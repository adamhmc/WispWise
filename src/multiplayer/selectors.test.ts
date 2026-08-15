import { describe, expect, it } from 'vitest'
import { createCard } from '../domain'
import type { PublicRoomSnapshot } from './protocol'
import {
  findPlayerResult,
  hasPlayerAnswered,
  rankPublicPlayers,
  shouldApplyRoomSnapshot,
} from './selectors'

const snapshot = {
  protocolVersion: 1,
  roomCode: 'WISP42',
  revision: 2,
  phase: 'results',
  hostConnected: true,
  serverNowMs: 0,
  players: [],
  round: {
    id: 'round-1',
    number: 1,
    total: 10,
    card: createCard(
      { objectId: 'ghost', colorId: 'red' },
      { objectId: 'chair', colorId: 'blue' },
    ),
    deadlineAtMs: 15_000,
    remainingMs: 15_000,
    answeredPlayerIds: ['p1'],
  },
  results: [{ playerId: 'p1', answer: 'ghost', isCorrect: true, elapsedMs: 1200, pointsAwarded: 1000 }],
} satisfies PublicRoomSnapshot

describe('multiplayer selectors', () => {
  it('finds the current player result and answer state', () => {
    expect(hasPlayerAnswered(snapshot, 'p1')).toBe(true)
    expect(hasPlayerAnswered(snapshot, 'p2')).toBe(false)
    expect(findPlayerResult(snapshot, 'p1')).toMatchObject({ isCorrect: true, pointsAwarded: 1000 })
  })

  it('ranks score first and correct response time second', () => {
    const players = [
      { id: 'p1', nickname: 'Ada', connected: true, score: 2000, correctElapsedTotalMs: 4000 },
      { id: 'p2', nickname: 'Lin', connected: true, score: 2000, correctElapsedTotalMs: 3000 },
      { id: 'p3', nickname: 'Mia', connected: true, score: 1000, correctElapsedTotalMs: 1000 },
    ]
    expect(rankPublicPlayers(players).map(({ id }) => id)).toEqual(['p2', 'p1', 'p3'])
  })

  it('does not let an older lobby response overwrite a newer game snapshot', () => {
    const olderLobby = { ...snapshot, revision: 1, phase: 'lobby' as const }

    expect(shouldApplyRoomSnapshot(snapshot, olderLobby)).toBe(false)
    expect(shouldApplyRoomSnapshot(snapshot, { ...snapshot, revision: 3 })).toBe(true)
  })
})
