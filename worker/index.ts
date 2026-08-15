import { DurableObject } from 'cloudflare:workers'
import { buildCompleteDeck, selectRound, WISPWISE_THEME } from '../src/domain'
import { parseClientMessage } from '../src/multiplayer/protocol'
import type { ClientMessage, ServerMessage } from '../src/multiplayer/protocol'
import {
  createRoom,
  toPublicSnapshot,
  transitionRoom,
  type RoomState,
  type RoomTransition,
} from '../src/multiplayer/room'

interface Env {
  readonly GAME_ROOMS: DurableObjectNamespace<GameRoom>
}

interface StoredRoom {
  readonly hostToken: string
  readonly state: RoomState
}

interface SocketAttachment {
  readonly actorId: string
  readonly role: 'host' | 'player'
}

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  })
}

function roomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join('')
}

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization')
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function applyTransition(room: StoredRoom, transition: RoomTransition): StoredRoom {
  return transition.ok ? { ...room, state: transition.state } : room
}

export class GameRoom extends DurableObject<Env> {
  private async getRoom(): Promise<StoredRoom | undefined> {
    return this.ctx.storage.get<StoredRoom>('room')
  }

  private async saveRoom(room: StoredRoom): Promise<void> {
    await this.ctx.storage.put('room', room)
    if (room.state.phase === 'playing' && room.state.roundDeadlineAtMs !== undefined) {
      await this.ctx.storage.setAlarm(room.state.roundDeadlineAtMs)
    } else if (room.state.phase === 'paused' && room.state.hostReconnectDeadlineAtMs !== undefined) {
      await this.ctx.storage.setAlarm(room.state.hostReconnectDeadlineAtMs)
    } else if (room.state.phase !== 'paused') {
      await this.ctx.storage.deleteAlarm()
    }
  }

  private broadcast(message: ServerMessage): void {
    const serialized = JSON.stringify(message)
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(serialized)
      } catch {
        // A close event will update presence; one stale socket must not block the room.
      }
    }
  }

  private transitionForMessage(
    room: StoredRoom,
    attachment: SocketAttachment,
    message: Exclude<ClientMessage, { type: 'join-room' }>,
    atMs: number,
  ): RoomTransition {
    if (message.type === 'start-game' || message.type === 'advance-round') {
      if (attachment.role !== 'host') return { ok: false, state: room.state, reason: 'Host authorization required' }
      return transitionRoom(room.state, {
        type: message.type,
        actorId: attachment.actorId,
        atMs,
      })
    }
    if (attachment.role !== 'player') {
      return { ok: false, state: room.state, reason: 'Player authorization required' }
    }
    return transitionRoom(room.state, {
      type: 'submit-answer',
      playerId: attachment.actorId,
      roundId: message.roundId,
      answer: message.answer,
      atMs,
    })
  }

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)

    if (request.method === 'POST' && pathname === '/internal/initialize') {
      if (await this.getRoom()) return json({ error: 'Room already exists' }, 409)
      const body = (await readJson(request)) as Record<string, unknown> | null
      if (!body || typeof body.roomCode !== 'string' || typeof body.hostId !== 'string' || typeof body.hostToken !== 'string') {
        return json({ error: 'Invalid initialization request' }, 400)
      }
      const questions = selectRound(buildCompleteDeck(WISPWISE_THEME).legal, Math.random)
      const room: StoredRoom = {
        hostToken: body.hostToken,
        state: createRoom({ roomCode: body.roomCode, hostId: body.hostId, questions }),
      }
      await this.saveRoom(room)
      return json({
        hostId: body.hostId,
        hostToken: body.hostToken,
        snapshot: toPublicSnapshot(room.state),
      }, 201)
    }

    const room = await this.getRoom()
    if (!room) return json({ error: 'Room not found' }, 404)

    if (request.method === 'GET' && pathname === '/snapshot') {
      return json({ snapshot: toPublicSnapshot(room.state) })
    }

    if (request.method === 'POST' && pathname === '/join') {
      const body = (await readJson(request)) as Record<string, unknown> | null
      if (!body || typeof body.nickname !== 'string') return json({ error: 'Nickname is required' }, 400)
      const playerId = crypto.randomUUID()
      const reconnectToken = crypto.randomUUID()
      const transition = transitionRoom(room.state, {
        type: 'join-player',
        playerId,
        reconnectToken,
        nickname: body.nickname,
      })
      if (!transition.ok) return json({ error: transition.reason }, 409)
      const next = applyTransition(room, transition)
      await this.saveRoom(next)
      this.broadcast({ type: 'room-snapshot', snapshot: toPublicSnapshot(next.state) })
      return json({ playerId, reconnectToken, snapshot: toPublicSnapshot(next.state) }, 201)
    }

    if (request.method === 'GET' && pathname === '/connect') {
      if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
        return json({ error: 'WebSocket upgrade required' }, 426)
      }
      const url = new URL(request.url)
      const role = url.searchParams.get('role')
      const token = url.searchParams.get('token')
      let actorId: string | undefined
      if (role === 'host' && token === room.hostToken) actorId = room.state.hostId
      if (role === 'player') {
        actorId = room.state.players.find(({ reconnectToken }) => reconnectToken === token)?.id
      }
      if (!actorId || (role !== 'host' && role !== 'player')) return json({ error: 'Invalid connection token' }, 401)

      let connectedRoom = room
      const isDisconnected =
        role === 'host'
          ? !room.state.hostConnected
          : room.state.players.some(({ id, connected }) => id === actorId && !connected)
      if (isDisconnected) {
        const transition = transitionRoom(room.state, { type: 'reconnect', actorId, atMs: Date.now() })
        if (!transition.ok) return json({ error: transition.reason }, 409)
        connectedRoom = applyTransition(room, transition)
        await this.saveRoom(connectedRoom)
      }

      const pair = new WebSocketPair()
      const client = pair[0]
      const server = pair[1]
      const attachment: SocketAttachment = { actorId, role }
      server.serializeAttachment(attachment)
      this.ctx.acceptWebSocket(server, [actorId])
      this.broadcast({ type: 'room-snapshot', snapshot: toPublicSnapshot(connectedRoom.state) })
      return new Response(null, { status: 101, webSocket: client })
    }

    if (request.method === 'POST' && pathname === '/command') {
      const token = bearerToken(request)
      const message = parseClientMessage(await readJson(request))
      if (!message || message.type === 'join-room') return json({ error: 'Invalid command' }, 400)

      let transition: RoomTransition
      const atMs = Date.now()
      if (message.type === 'start-game' || message.type === 'advance-round') {
        if (token !== room.hostToken) return json({ error: 'Host authorization required' }, 401)
        transition = transitionRoom(room.state, {
          type: message.type,
          actorId: room.state.hostId,
          atMs,
        })
      } else {
        const player = room.state.players.find(({ reconnectToken }) => reconnectToken === token)
        if (!player) return json({ error: 'Player authorization required' }, 401)
        transition = transitionRoom(room.state, {
          type: 'submit-answer',
          playerId: player.id,
          roundId: message.roundId,
          answer: message.answer,
          atMs,
        })
      }

      if (!transition.ok) return json({ error: transition.reason }, 409)
      const next = applyTransition(room, transition)
      await this.saveRoom(next)
      this.broadcast({ type: 'room-snapshot', snapshot: toPublicSnapshot(next.state) })
      return json({ snapshot: toPublicSnapshot(next.state) })
    }

    return json({ error: 'Not found' }, 404)
  }

  async alarm(): Promise<void> {
    const room = await this.getRoom()
    if (!room) return
    const atMs = Date.now()
    const transition =
      room.state.phase === 'paused'
        ? transitionRoom(room.state, { type: 'host-reconnect-timeout', atMs })
        : transitionRoom(room.state, { type: 'round-deadline', atMs })
    if (transition.ok) {
      const next = applyTransition(room, transition)
      await this.saveRoom(next)
      this.broadcast({ type: 'room-snapshot', snapshot: toPublicSnapshot(next.state) })
    }
  }

  async webSocketMessage(socket: WebSocket, rawMessage: string | ArrayBuffer): Promise<void> {
    const room = await this.getRoom()
    if (!room) return socket.close(1011, 'Room not found')
    const attachment = socket.deserializeAttachment() as SocketAttachment | null
    if (!attachment) return socket.close(1008, 'Missing connection identity')

    let decoded: unknown
    try {
      decoded = JSON.parse(typeof rawMessage === 'string' ? rawMessage : new TextDecoder().decode(rawMessage))
    } catch {
      socket.send(JSON.stringify({ type: 'command-rejected', reason: 'Invalid JSON' } satisfies ServerMessage))
      return
    }
    const message = parseClientMessage(decoded)
    if (!message || message.type === 'join-room') {
      socket.send(JSON.stringify({ type: 'command-rejected', reason: 'Invalid command' } satisfies ServerMessage))
      return
    }
    const transition = this.transitionForMessage(room, attachment, message, Date.now())
    if (!transition.ok) {
      socket.send(
        JSON.stringify({
          type: 'command-rejected',
          ...(message.type === 'submit-answer' ? { commandId: message.commandId } : {}),
          reason: transition.reason,
        } satisfies ServerMessage),
      )
      return
    }
    const next = applyTransition(room, transition)
    await this.saveRoom(next)
    if (message.type === 'submit-answer') {
      socket.send(JSON.stringify({ type: 'answer-accepted', commandId: message.commandId } satisfies ServerMessage))
    }
    this.broadcast({ type: 'room-snapshot', snapshot: toPublicSnapshot(next.state) })
  }

  async webSocketClose(socket: WebSocket): Promise<void> {
    const attachment = socket.deserializeAttachment() as SocketAttachment | null
    if (!attachment) return
    const otherConnections = this.ctx.getWebSockets(attachment.actorId).filter((candidate) => candidate !== socket)
    if (otherConnections.length > 0) return
    const room = await this.getRoom()
    if (!room) return
    const transition = transitionRoom(room.state, {
      type: 'disconnect',
      actorId: attachment.actorId,
      atMs: Date.now(),
    })
    if (!transition.ok) return
    const next = applyTransition(room, transition)
    await this.saveRoom(next)
    this.broadcast({ type: 'room-snapshot', snapshot: toPublicSnapshot(next.state) })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
      })
    }

    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = roomCode()
        const stub = env.GAME_ROOMS.getByName(code)
        const response = await stub.fetch('https://room/internal/initialize', {
          method: 'POST',
          body: JSON.stringify({
            roomCode: code,
            hostId: crypto.randomUUID(),
            hostToken: crypto.randomUUID(),
          }),
        })
        if (response.status !== 409) return response
      }
      return json({ error: 'Could not allocate a room code' }, 503)
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{6})(?:\/(join|command|connect))?$/)
    if (!match) return json({ error: 'Not found' }, 404)
    const [, code, action] = match
    const stub = env.GAME_ROOMS.getByName(code)
    const path = action === 'connect' ? `/connect${url.search}` : action ? `/${action}` : '/snapshot'
    return stub.fetch(new Request(`https://room${path}`, request))
  },
} satisfies ExportedHandler<Env>
