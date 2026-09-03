import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMultiplayerRoom } from './client'

describe('multiplayer client', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('uses the current page host for the local Worker', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'test response' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(createMultiplayerRoom()).rejects.toThrow('test response')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8788/api/rooms',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({}) }),
    )
  })

  it('stops waiting and reports when the Worker does not respond', async () => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, 'fetch').mockImplementation((_input, init) => (
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    ))

    const request = createMultiplayerRoom()
    const rejection = expect(request).rejects.toThrow('多人伺服器未回應')
    await vi.advanceTimersByTimeAsync(8_000)

    await rejection
  })
})
