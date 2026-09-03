import type { PublicRoomSnapshot, ServerMessage } from './protocol'

const LOCAL_WORKER_PORT = '8788'
const REQUEST_TIMEOUT_MS = 8_000

function defaultApiBaseUrl(): string {
  if (typeof window === 'undefined') return `http://127.0.0.1:${LOCAL_WORKER_PORT}`
  return `${window.location.protocol}//${window.location.hostname}:${LOCAL_WORKER_PORT}`
}

const API_BASE_URL = (import.meta.env.VITE_MULTIPLAYER_API_URL || defaultApiBaseUrl()).replace(/\/$/, '')
export const MULTIPLAYER_IDENTITY_KEY = 'wispwise.multiplayer.identity'

interface CreatedRoom {
  readonly hostId: string
  readonly hostToken: string
  readonly snapshot: PublicRoomSnapshot
}

interface JoinedRoom {
  readonly playerId: string
  readonly reconnectToken: string
  readonly snapshot: PublicRoomSnapshot
}

interface RoomSnapshotResponse {
  readonly snapshot: PublicRoomSnapshot
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      signal: controller.signal,
    })
    const body = (await response.json()) as T & { error?: string }
    if (!response.ok) throw new Error(body.error || '多人伺服器暫時無法使用')
    return body
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === 'AbortError') {
      throw new Error('多人伺服器未回應，請確認本機 Worker 已啟動後再試一次')
    }
    throw caught
  } finally {
    window.clearTimeout(timeout)
  }
}

export function createMultiplayerRoom(): Promise<CreatedRoom> {
  return apiRequest('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function joinMultiplayerRoom(code: string, nickname: string): Promise<JoinedRoom> {
  return apiRequest(`/api/rooms/${encodeURIComponent(code.toUpperCase())}/join`, {
    method: 'POST',
    body: JSON.stringify({ nickname }),
  })
}

export async function fetchMultiplayerRoomSnapshot(code: string): Promise<PublicRoomSnapshot> {
  const response = await apiRequest<RoomSnapshotResponse>(
    `/api/rooms/${encodeURIComponent(code.toUpperCase())}`,
    { method: 'GET' },
  )
  return response.snapshot
}

export function connectToMultiplayerRoom(options: {
  readonly roomCode: string
  readonly role: 'host' | 'player'
  readonly token: string
  readonly onMessage: (message: ServerMessage) => void
  readonly onOpen: () => void
  readonly onClose: (event: CloseEvent) => void
}): WebSocket {
  const url = new URL(`${API_BASE_URL}/api/rooms/${options.roomCode}/connect`)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('role', options.role)
  url.searchParams.set('token', options.token)
  const socket = new WebSocket(url)
  socket.addEventListener('open', options.onOpen)
  socket.addEventListener('close', options.onClose)
  socket.addEventListener('message', (event) => {
    try {
      options.onMessage(JSON.parse(String(event.data)) as ServerMessage)
    } catch {
      // Ignore malformed server frames; the next authoritative snapshot repairs the view.
    }
  })
  return socket
}
