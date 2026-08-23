import { buildCompleteDeck, type LegalDeckCard } from '@/domain'
import { describe, expect, it } from 'vitest'
import {
  CORRECT_ANSWER_POINTS,
  HOST_RECONNECT_GRACE_MS,
  MAX_ROOM_PLAYERS,
  ROUND_DURATION_MS,
} from './protocol'
import { createRoom, rankPlayers, toPublicSnapshot, transitionRoom, type RoomState } from './room'

const questions = buildCompleteDeck().legal.slice(0, 2)

function roomWithPlayers(count = 2, selectedQuestions: readonly LegalDeckCard[] = questions): RoomState {
  let state = createRoom({ roomCode: 'WISP42', hostId: 'host-1', objectCount: 5, questions: selectedQuestions })
  for (let index = 1; index <= count; index += 1) {
    const result = transitionRoom(state, {
      type: 'join-player',
      playerId: `player-${index}`,
      reconnectToken: `token-${index}`,
      nickname: `Player ${index}`,
    })
    if (!result.ok) throw new Error(result.reason)
    state = result.state
  }
  return state
}

function start(state: RoomState, atMs = 1_000): RoomState {
  const result = transitionRoom(state, { type: 'start-game', actorId: 'host-1', atMs })
  if (!result.ok) throw new Error(result.reason)
  return result.state
}

describe('multiplayer room', () => {
  it('accepts up to eight uniquely named players only in the lobby', () => {
    const fullRoom = roomWithPlayers(MAX_ROOM_PLAYERS)
    expect(fullRoom.players).toHaveLength(8)

    expect(
      transitionRoom(fullRoom, {
        type: 'join-player',
        playerId: 'player-9',
        reconnectToken: 'token-9',
        nickname: 'Player 9',
      }),
    ).toMatchObject({ ok: false, reason: 'Room is full' })

    expect(
      transitionRoom(roomWithPlayers(1), {
        type: 'join-player',
        playerId: 'other-id',
        reconnectToken: 'other-token',
        nickname: 'player 1',
      }),
    ).toMatchObject({ ok: false, reason: 'Nickname is already in use' })

    expect(
      transitionRoom(start(roomWithPlayers(1)), {
        type: 'join-player',
        playerId: 'late',
        reconnectToken: 'late-token',
        nickname: 'Late player',
      }),
    ).toMatchObject({ ok: false, reason: 'Game already started' })
  })

  it('allows only the host to start and requires a player', () => {
    const emptyRoom = createRoom({ roomCode: 'WISP42', hostId: 'host-1', objectCount: 5, questions })
    expect(
      transitionRoom(emptyRoom, { type: 'start-game', actorId: 'host-1', atMs: 0 }),
    ).toMatchObject({ ok: false, reason: 'At least one player is required' })
    expect(
      transitionRoom(roomWithPlayers(1), { type: 'start-game', actorId: 'player-1', atMs: 0 }),
    ).toMatchObject({ ok: false, reason: 'Only the host can start' })
  })

  it('starts a 15 second server-authoritative round', () => {
    const state = start(roomWithPlayers())
    expect(state).toMatchObject({
      phase: 'playing',
      roundIndex: 0,
      roundStartedAtMs: 1_000,
      roundDeadlineAtMs: 1_000 + ROUND_DURATION_MS,
    })
  })

  it('awards time-decayed points only for a correct first answer and records elapsed time', () => {
    const initial = start(roomWithPlayers())
    const answer = initial.questions[0].evaluation.answer
    const result = transitionRoom(initial, {
      type: 'submit-answer',
      playerId: 'player-1',
      roundId: 'round-1',
      answer,
      atMs: 1_500,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.players[0]).toMatchObject({
      score: CORRECT_ANSWER_POINTS,
      correctElapsedTotalMs: 500,
    })
    expect(result.state.submissions[0]).toMatchObject({
      isCorrect: true,
      elapsedMs: 500,
      pointsAwarded: CORRECT_ANSWER_POINTS,
    })

    expect(
      transitionRoom(result.state, {
        type: 'submit-answer',
        playerId: 'player-1',
        roundId: 'round-1',
        answer,
        atMs: 2_500,
      }),
    ).toMatchObject({ ok: false, reason: 'Player already answered' })
  })

  it('settles immediately after every player answers', () => {
    let state = start(roomWithPlayers())
    const correct = state.questions[0].evaluation.answer
    const wrong = correct === 'ghost' ? 'chair' : 'ghost'

    const first = transitionRoom(state, {
      type: 'submit-answer',
      playerId: 'player-1',
      roundId: 'round-1',
      answer: correct,
      atMs: 1_500,
    })
    if (!first.ok) throw new Error(first.reason)
    expect(first.state.phase).toBe('playing')
    const waitingSnapshot = toPublicSnapshot(first.state, 2_000)
    expect(waitingSnapshot.round?.answeredPlayerIds).toEqual(['player-1'])
    expect(waitingSnapshot).not.toHaveProperty('correctAnswer')
    expect(waitingSnapshot).not.toHaveProperty('results')

    const second = transitionRoom(first.state, {
      type: 'submit-answer',
      playerId: 'player-2',
      roundId: 'round-1',
      answer: wrong,
      atMs: 3_000,
    })
    if (!second.ok) throw new Error(second.reason)
    state = second.state
    expect(state.phase).toBe('results')
    expect(state.submissions.map(({ pointsAwarded }) => pointsAwarded)).toEqual([1_000, 0])
  })

  it('stores the Host setting and automatically advances after the selected delay', () => {
    const configured = transitionRoom(roomWithPlayers(1), {
      type: 'set-auto-advance',
      actorId: 'host-1',
      seconds: 5,
    })
    if (!configured.ok) throw new Error(configured.reason)
    let state = start(configured.state)
    const answered = transitionRoom(state, {
      type: 'submit-answer',
      playerId: 'player-1',
      roundId: 'round-1',
      answer: state.questions[0].evaluation.answer,
      atMs: 2_000,
    })
    if (!answered.ok) throw new Error(answered.reason)
    state = answered.state
    expect(state).toMatchObject({ phase: 'results', autoAdvanceAtMs: 7_000 })
    expect(toPublicSnapshot(state, 3_000)).toMatchObject({
      autoAdvanceSeconds: 5,
      autoAdvanceRemainingMs: 4_000,
    })
    expect(transitionRoom(state, { type: 'auto-advance', atMs: 6_999 })).toMatchObject({
      ok: false,
      reason: 'Automatic advance time has not arrived',
    })
    expect(transitionRoom(state, { type: 'auto-advance', atMs: 7_000 })).toMatchObject({
      ok: true,
      state: { phase: 'playing', roundIndex: 1 },
    })
  })

  it('settles unanswered players at the deadline and rejects late answers', () => {
    const state = start(roomWithPlayers())
    expect(
      transitionRoom(state, { type: 'round-deadline', atMs: state.roundDeadlineAtMs! - 1 }),
    ).toMatchObject({ ok: false, reason: 'Round deadline has not passed' })

    const timedOut = transitionRoom(state, {
      type: 'round-deadline',
      atMs: state.roundDeadlineAtMs!,
    })
    expect(timedOut).toMatchObject({ ok: true, state: { phase: 'results' } })

    expect(
      transitionRoom(state, {
        type: 'submit-answer',
        playerId: 'player-1',
        roundId: 'round-1',
        answer: state.questions[0].evaluation.answer,
        atMs: state.roundDeadlineAtMs! + 1,
      }),
    ).toMatchObject({ ok: false, reason: 'Round deadline has passed' })
  })

  it('lets the host advance and finishes after the final question', () => {
    let state = start(roomWithPlayers(1))
    for (let index = 0; index < questions.length; index += 1) {
      const answer = state.questions[index].evaluation.answer
      const submitted = transitionRoom(state, {
        type: 'submit-answer',
        playerId: 'player-1',
        roundId: `round-${index + 1}`,
        answer,
        atMs: 2_000 + index * 2_000,
      })
      if (!submitted.ok) throw new Error(submitted.reason)
      const advanced = transitionRoom(submitted.state, {
        type: 'advance-round',
        actorId: 'host-1',
        atMs: 2_500 + index * 2_000,
      })
      if (!advanced.ok) throw new Error(advanced.reason)
      state = advanced.state
    }
    expect(state).toMatchObject({ phase: 'finished', finishReason: 'completed' })
  })

  it('lets the host return connected players to the lobby for a rematch', () => {
    const replacementQuestions = buildCompleteDeck().legal.slice(10, 12)
    const finished: RoomState = {
      ...roomWithPlayers(2),
      phase: 'finished',
      finishReason: 'completed',
      roundIndex: 1,
      players: roomWithPlayers(2).players.map((player, index) => ({
        ...player,
        connected: index === 0,
        score: 2_000,
        correctElapsedTotalMs: 1_500,
      })),
    }

    expect(transitionRoom(finished, {
      type: 'reset-game',
      actorId: 'player-1',
      questions: replacementQuestions,
    })).toMatchObject({ ok: false, reason: 'Only the host can reset' })

    const reset = transitionRoom(finished, {
      type: 'reset-game',
      actorId: 'host-1',
      questions: replacementQuestions,
    })
    if (!reset.ok) throw new Error(reset.reason)
    expect(reset.state).toMatchObject({
      phase: 'lobby',
      roundIndex: -1,
      finishReason: undefined,
      questions: replacementQuestions,
    })
    expect(reset.state.players).toHaveLength(1)
    expect(reset.state.players[0]).toMatchObject({
      id: 'player-1',
      score: 0,
      correctElapsedTotalMs: 0,
    })
    expect(reset.state.submissions).toEqual([])
  })

  it('pauses for a disconnected host, restores the round clock on reconnect, and expires at 30s', () => {
    const playing = start(roomWithPlayers(1), 10_000)
    const disconnected = transitionRoom(playing, {
      type: 'disconnect',
      actorId: 'host-1',
      atMs: 12_000,
    })
    if (!disconnected.ok) throw new Error(disconnected.reason)
    expect(disconnected.state).toMatchObject({
      phase: 'paused',
      hostConnected: false,
      hostReconnectDeadlineAtMs: 12_000 + HOST_RECONNECT_GRACE_MS,
    })

    const reconnected = transitionRoom(disconnected.state, {
      type: 'reconnect',
      actorId: 'host-1',
      atMs: 17_000,
    })
    if (!reconnected.ok) throw new Error(reconnected.reason)
    expect(reconnected.state).toMatchObject({
      phase: 'playing',
      hostConnected: true,
      roundStartedAtMs: 15_000,
      roundDeadlineAtMs: 30_000,
    })

    const expired = transitionRoom(disconnected.state, {
      type: 'host-reconnect-timeout',
      atMs: 12_000 + HOST_RECONNECT_GRACE_MS,
    })
    expect(expired).toMatchObject({
      ok: true,
      state: { phase: 'finished', finishReason: 'host-disconnected' },
    })
  })

  it('does not expose reconnect tokens or the correct answer before settlement', () => {
    const playing = start(roomWithPlayers(1))
    const serialized = JSON.stringify(toPublicSnapshot(playing))
    expect(serialized).not.toContain('token-1')
    expect(toPublicSnapshot(playing)).not.toHaveProperty('correctAnswer')

    const settled = transitionRoom(playing, {
      type: 'round-deadline',
      atMs: playing.roundDeadlineAtMs!,
    })
    if (!settled.ok) throw new Error(settled.reason)
    const snapshot = toPublicSnapshot(settled.state, settled.state.roundDeadlineAtMs)
    expect(snapshot.correctAnswer).toBe(
      playing.questions[0].evaluation.answer,
    )
    expect(snapshot.round?.id).toBe('round-1')
    expect(snapshot.round?.card).toEqual(playing.questions[0].card)
    expect(snapshot.round?.remainingMs).toBe(0)
  })

  it('ranks equal scores by total correct response time', () => {
    const players = roomWithPlayers(2).players.map((player, index) => ({
      ...player,
      score: 2_000,
      correctElapsedTotalMs: index === 0 ? 4_000 : 3_000,
    }))
    expect(rankPlayers(players).map(({ id }) => id)).toEqual(['player-2', 'player-1'])
  })
})
