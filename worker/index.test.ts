import { env, exports } from 'cloudflare:workers'
import { runInDurableObject } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { ROOM_TTL_MS } from './config'

interface ApiResponse {
  readonly hostToken?: string
  readonly playerId?: string
  readonly reconnectToken?: string
  readonly error?: string
  readonly snapshot?: {
    readonly roomCode: string
    readonly phase: string
    readonly objectCount: number
    readonly autoAdvanceSeconds?: number | null
    readonly autoAdvanceRemainingMs?: number
    readonly players: readonly { id: string; nickname: string; score: number }[]
    readonly round?: { id: string }
    readonly correctAnswer?: string
  }
}

async function call(path: string, init?: RequestInit): Promise<{ response: Response; body: ApiResponse }> {
  const response = await exports.default.fetch(new Request(`https://example.test${path}`, init))
  return { response, body: await response.json<ApiResponse>() }
}

function nextMessage(socket: WebSocket): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    socket.addEventListener(
      'message',
      (event) => resolve(JSON.parse(String(event.data)) as Record<string, unknown>),
      { once: true },
    )
  })
}

describe('multiplayer Worker', () => {
  it('creates a seven-object room with three-object questions', async () => {
    const created = await call('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ objectCount: 7 }),
    })
    expect(created.response.status).toBe(201)
    expect(created.body.snapshot?.objectCount).toBe(7)

    const code = created.body.snapshot!.roomCode
    const joined = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Ada' }),
    })
    await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${created.body.hostToken}` },
      body: JSON.stringify({ type: 'start-game' }),
    })
    const snapshot = await call(`/api/rooms/${code}`)
    expect(snapshot.body.snapshot?.objectCount).toBe(7)
    expect(snapshot.body.snapshot?.round).toBeTruthy()
    expect(joined.body.snapshot?.objectCount).toBe(7)
  })

  it('allows browser CORS preflight requests', async () => {
    const response = await exports.default.fetch(
      new Request('https://example.test/api/rooms', { method: 'OPTIONS' }),
    )
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('creates a room without exposing the answer and permits an authorized host to start', async () => {
    const created = await call('/api/rooms', { method: 'POST' })
    expect(created.response.status).toBe(201)
    expect(created.body.snapshot?.roomCode).toMatch(/^[A-Z2-9]{6}$/)
    expect(created.body.snapshot?.phase).toBe('lobby')
    expect(created.body.snapshot).not.toHaveProperty('correctAnswer')

    const code = created.body.snapshot!.roomCode
    const joined = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Ada' }),
    })
    expect(joined.response.status).toBe(201)
    expect(joined.body.snapshot?.players).toHaveLength(1)

    const unauthorized = await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      body: JSON.stringify({ type: 'start-game' }),
    })
    expect(unauthorized.response.status).toBe(401)

    const configured = await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${created.body.hostToken}` },
      body: JSON.stringify({ type: 'set-auto-advance', seconds: 5 }),
    })
    expect(configured.response.status).toBe(200)
    expect(configured.body.snapshot?.autoAdvanceSeconds).toBe(5)

    const started = await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${created.body.hostToken}` },
      body: JSON.stringify({ type: 'start-game' }),
    })
    expect(started.response.status).toBe(200)
    expect(started.body.snapshot?.phase).toBe('playing')
    expect(started.body.snapshot?.round?.id).toBe('round-1')
    expect(started.body.snapshot).not.toHaveProperty('correctAnswer')

    const answered = await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${joined.body.reconnectToken}` },
      body: JSON.stringify({
        type: 'submit-answer',
        commandId: 'answer-1',
        roundId: 'round-1',
        answer: 'ghost',
      }),
    })
    expect(answered.response.status).toBe(200)
    expect(answered.body.snapshot?.phase).toBe('results')
    expect(answered.body.snapshot?.correctAnswer).toBeTruthy()
    expect(answered.body.snapshot?.autoAdvanceRemainingMs).toBeGreaterThan(0)
  })

  it('rejects duplicate nicknames and joining after start', async () => {
    const created = await call('/api/rooms', { method: 'POST' })
    const code = created.body.snapshot!.roomCode
    await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Grace' }),
    })
    const duplicate = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'grace' }),
    })
    expect(duplicate.response.status).toBe(409)

    await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${created.body.hostToken}` },
      body: JSON.stringify({ type: 'start-game' }),
    })
    const late = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Late' }),
    })
    expect(late.response.status).toBe(409)
    expect(late.body.error).toBe('Game already started')
  })

  it('keeps the round private until every player answers', async () => {
    const created = await call('/api/rooms', { method: 'POST' })
    const code = created.body.snapshot!.roomCode
    const firstPlayer = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Ada' }),
    })
    const secondPlayer = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Lin' }),
    })
    await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${created.body.hostToken}` },
      body: JSON.stringify({ type: 'start-game' }),
    })

    const firstAnswer = await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${firstPlayer.body.reconnectToken}` },
      body: JSON.stringify({
        type: 'submit-answer',
        commandId: 'first-answer',
        roundId: 'round-1',
        answer: 'ghost',
      }),
    })
    expect(firstAnswer.body.snapshot?.phase).toBe('playing')
    expect(firstAnswer.body.snapshot).not.toHaveProperty('correctAnswer')

    const secondAnswer = await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secondPlayer.body.reconnectToken}` },
      body: JSON.stringify({
        type: 'submit-answer',
        commandId: 'second-answer',
        roundId: 'round-1',
        answer: 'chair',
      }),
    })
    expect(secondAnswer.body.snapshot?.phase).toBe('results')
    expect(secondAnswer.body.snapshot?.correctAnswer).toBeTruthy()
  })

  it('accepts commands over a hibernation-compatible WebSocket', async () => {
    const created = await call('/api/rooms', { method: 'POST' })
    const code = created.body.snapshot!.roomCode
    const joined = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Lin' }),
    })
    await call(`/api/rooms/${code}/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${created.body.hostToken}` },
      body: JSON.stringify({ type: 'start-game' }),
    })

    const response = await exports.default.fetch(
      new Request(
        `https://example.test/api/rooms/${code}/connect?role=player&token=${joined.body.reconnectToken}`,
        { headers: { Upgrade: 'websocket' } },
      ),
    )
    expect(response.status).toBe(101)
    const socket = response.webSocket!
    socket.accept()
    const initial = await nextMessage(socket)
    expect(initial).toMatchObject({ type: 'room-snapshot', snapshot: { phase: 'playing' } })

    socket.send(
      JSON.stringify({
        type: 'submit-answer',
        commandId: 'ws-answer-1',
        roundId: 'round-1',
        answer: 'ghost',
      }),
    )
    await expect(nextMessage(socket)).resolves.toEqual({
      type: 'answer-accepted',
      commandId: 'ws-answer-1',
    })
    await expect(nextMessage(socket)).resolves.toMatchObject({
      type: 'room-snapshot',
      snapshot: { phase: 'results' },
    })
    socket.close(1000, 'test complete')
  })

  it('returns connected players to a fresh lobby for a rematch', async () => {
    const created = await call('/api/rooms', { method: 'POST' })
    const code = created.body.snapshot!.roomCode
    const joined = await call(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Ada' }),
    })
    const hostHeaders = { Authorization: `Bearer ${created.body.hostToken}` }
    await call(`/api/rooms/${code}/command`, {
      method: 'POST', headers: hostHeaders, body: JSON.stringify({ type: 'start-game' }),
    })

    for (let round = 1; round <= 10; round += 1) {
      await call(`/api/rooms/${code}/command`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${joined.body.reconnectToken}` },
        body: JSON.stringify({
          type: 'submit-answer',
          commandId: `answer-${round}`,
          roundId: `round-${round}`,
          answer: 'ghost',
        }),
      })
      await call(`/api/rooms/${code}/command`, {
        method: 'POST', headers: hostHeaders, body: JSON.stringify({ type: 'advance-round' }),
      })
    }

    const reset = await call(`/api/rooms/${code}/command`, {
      method: 'POST', headers: hostHeaders, body: JSON.stringify({ type: 'reset-game' }),
    })
    expect(reset.response.status).toBe(200)
    expect(reset.body.snapshot).toMatchObject({ phase: 'lobby', players: [{ nickname: 'Ada', score: 0 }] })
    expect(reset.body.snapshot).not.toHaveProperty('round')
  })

  it('deletes room storage after 24 hours without activity', async () => {
    const created = await call('/api/rooms', { method: 'POST' })
    const code = created.body.snapshot!.roomCode
    const stub = env.GAME_ROOMS.getByName(code)
    const remaining = await runInDurableObject(stub, async (instance, state) => {
      const room = await state.storage.get<Record<string, unknown>>('room')
      if (!room) throw new Error('Expected stored room')
      await state.storage.put('room', { ...room, lastActivityAtMs: Date.now() - ROOM_TTL_MS })
      await instance.alarm()
      return state.storage.get('room')
    })
    expect(remaining).toBeUndefined()

    const expired = await call(`/api/rooms/${code}`)
    expect(expired.response.status).toBe(404)
    expect(expired.body.error).toBe('Room not found')
  })
})
