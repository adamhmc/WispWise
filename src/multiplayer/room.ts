import type { LegalDeckCard, ObjectId } from '../domain'
import {
  HOST_RECONNECT_GRACE_MS,
  MAX_ROOM_PLAYERS,
  MULTIPLAYER_PROTOCOL_VERSION,
  ROUND_DURATION_MS,
  calculateCorrectAnswerPoints,
  type AutoAdvanceSeconds,
  type PublicRoomSnapshot,
  type RoomPhase,
  type RoundResult,
} from './protocol'

export interface RoomPlayer {
  readonly id: string
  readonly reconnectToken: string
  readonly nickname: string
  readonly connected: boolean
  readonly score: number
  readonly correctElapsedTotalMs: number
}

export interface Submission extends RoundResult {
  readonly submittedAtMs: number
}

export interface RoomState {
  readonly roomCode: string
  readonly revision: number
  readonly hostId: string
  readonly hostConnected: boolean
  readonly phase: RoomPhase
  readonly questions: readonly LegalDeckCard[]
  readonly players: readonly RoomPlayer[]
  readonly roundIndex: number
  readonly roundStartedAtMs?: number
  readonly roundDeadlineAtMs?: number
  readonly submissions: readonly Submission[]
  readonly autoAdvanceSeconds: AutoAdvanceSeconds | null
  readonly autoAdvanceAtMs?: number
  readonly pausedAtMs?: number
  readonly hostReconnectDeadlineAtMs?: number
  readonly resumePhase?: Exclude<RoomPhase, 'paused' | 'finished'>
  readonly finishReason?: 'completed' | 'host-disconnected'
}

export type RoomCommand =
  | {
      readonly type: 'join-player'
      readonly playerId: string
      readonly reconnectToken: string
      readonly nickname: string
    }
  | { readonly type: 'start-game'; readonly actorId: string; readonly atMs: number }
  | {
      readonly type: 'set-auto-advance'
      readonly actorId: string
      readonly seconds: AutoAdvanceSeconds | null
    }
  | {
      readonly type: 'submit-answer'
      readonly playerId: string
      readonly roundId: string
      readonly answer: ObjectId
      readonly atMs: number
    }
  | { readonly type: 'advance-round'; readonly actorId: string; readonly atMs: number }
  | {
      readonly type: 'reset-game'
      readonly actorId: string
      readonly questions: readonly LegalDeckCard[]
    }
  | { readonly type: 'round-deadline'; readonly atMs: number }
  | { readonly type: 'auto-advance'; readonly atMs: number }
  | { readonly type: 'disconnect'; readonly actorId: string; readonly atMs: number }
  | { readonly type: 'reconnect'; readonly actorId: string; readonly atMs: number }
  | { readonly type: 'host-reconnect-timeout'; readonly atMs: number }

export type RoomTransition =
  | { readonly ok: true; readonly state: RoomState }
  | { readonly ok: false; readonly state: RoomState; readonly reason: string }

export function createRoom(options: {
  readonly roomCode: string
  readonly hostId: string
  readonly questions: readonly LegalDeckCard[]
}): RoomState {
  if (options.questions.length === 0) throw new Error('A room requires at least one question')
  return {
    roomCode: options.roomCode,
    revision: 0,
    hostId: options.hostId,
    hostConnected: true,
    phase: 'lobby',
    questions: options.questions,
    players: [],
    roundIndex: -1,
    submissions: [],
    autoAdvanceSeconds: null,
  }
}

function accepted(state: RoomState): RoomTransition {
  return { ok: true, state: { ...state, revision: (state.revision ?? 0) + 1 } }
}

function rejected(state: RoomState, reason: string): RoomTransition {
  return { ok: false, state, reason }
}

function updatePlayer(
  state: RoomState,
  playerId: string,
  update: (player: RoomPlayer) => RoomPlayer,
): RoomState {
  return {
    ...state,
    players: state.players.map((player) => (player.id === playerId ? update(player) : player)),
  }
}

function roundId(roundIndex: number): string {
  return `round-${roundIndex + 1}`
}

function settleRound(state: RoomState, atMs: number): RoomState {
  const answer = state.questions[state.roundIndex]?.evaluation.answer
  if (!answer) return state
  const autoAdvanceSeconds = state.autoAdvanceSeconds ?? null
  return {
    ...state,
    phase: 'results',
    autoAdvanceAtMs:
      autoAdvanceSeconds === null ? undefined : atMs + autoAdvanceSeconds * 1_000,
  }
}

function advanceRound(state: RoomState, atMs: number): RoomState {
  const nextIndex = state.roundIndex + 1
  if (nextIndex >= state.questions.length) {
    return { ...state, phase: 'finished', finishReason: 'completed', autoAdvanceAtMs: undefined }
  }
  return {
    ...state,
    phase: 'playing',
    roundIndex: nextIndex,
    roundStartedAtMs: atMs,
    roundDeadlineAtMs: atMs + ROUND_DURATION_MS,
    submissions: [],
    autoAdvanceAtMs: undefined,
  }
}

function hasEveryPlayerSubmitted(state: RoomState): boolean {
  return state.players.length > 0 && state.players.every((player) =>
    state.submissions.some((submission) => submission.playerId === player.id),
  )
}

export function transitionRoom(state: RoomState, command: RoomCommand): RoomTransition {
  switch (command.type) {
    case 'join-player': {
      if (state.phase !== 'lobby') return rejected(state, 'Game already started')
      if (state.players.length >= MAX_ROOM_PLAYERS) return rejected(state, 'Room is full')
      const nickname = command.nickname.trim()
      if (!nickname) return rejected(state, 'Nickname is required')
      if (state.players.some((player) => player.nickname.toLocaleLowerCase() === nickname.toLocaleLowerCase())) {
        return rejected(state, 'Nickname is already in use')
      }
      if (state.players.some((player) => player.id === command.playerId)) {
        return rejected(state, 'Player already joined')
      }
      return accepted({
        ...state,
        players: [
          ...state.players,
          {
            id: command.playerId,
            reconnectToken: command.reconnectToken,
            nickname,
            connected: true,
            score: 0,
            correctElapsedTotalMs: 0,
          },
        ],
      })
    }
    case 'start-game': {
      if (command.actorId !== state.hostId) return rejected(state, 'Only the host can start')
      if (state.phase !== 'lobby') return rejected(state, 'Room is not in the lobby')
      if (state.players.length === 0) return rejected(state, 'At least one player is required')
      return accepted({
        ...state,
        phase: 'playing',
        roundIndex: 0,
        roundStartedAtMs: command.atMs,
        roundDeadlineAtMs: command.atMs + ROUND_DURATION_MS,
        submissions: [],
      })
    }
    case 'set-auto-advance': {
      if (command.actorId !== state.hostId) return rejected(state, 'Only the host can change settings')
      if (state.phase !== 'lobby') return rejected(state, 'Settings can only change in the lobby')
      return accepted({ ...state, autoAdvanceSeconds: command.seconds })
    }
    case 'submit-answer': {
      if (state.phase !== 'playing') return rejected(state, 'Round is not accepting answers')
      if (command.roundId !== roundId(state.roundIndex)) return rejected(state, 'Answer is for another round')
      if (state.roundDeadlineAtMs === undefined || command.atMs > state.roundDeadlineAtMs) {
        return rejected(state, 'Round deadline has passed')
      }
      const player = state.players.find(({ id }) => id === command.playerId)
      if (!player) return rejected(state, 'Player is not in this room')
      if (!player.connected) return rejected(state, 'Player is disconnected')
      if (state.submissions.some(({ playerId }) => playerId === command.playerId)) {
        return rejected(state, 'Player already answered')
      }
      const question = state.questions[state.roundIndex]
      const isCorrect = command.answer === question.evaluation.answer
      const elapsedMs = Math.max(0, command.atMs - (state.roundStartedAtMs ?? command.atMs))
      const pointsAwarded = isCorrect ? calculateCorrectAnswerPoints(elapsedMs) : 0
      const submission: Submission = {
        playerId: command.playerId,
        answer: command.answer,
        isCorrect,
        elapsedMs,
        submittedAtMs: command.atMs,
        pointsAwarded,
      }
      let next: RoomState = { ...state, submissions: [...state.submissions, submission] }
      if (isCorrect) {
        next = updatePlayer(next, command.playerId, (current) => ({
          ...current,
          score: current.score + pointsAwarded,
          correctElapsedTotalMs: current.correctElapsedTotalMs + elapsedMs,
        }))
      }
      if (hasEveryPlayerSubmitted(next)) next = settleRound(next, command.atMs)
      return accepted(next)
    }
    case 'round-deadline': {
      if (state.phase !== 'playing') return rejected(state, 'No active round')
      if (state.roundDeadlineAtMs === undefined || command.atMs < state.roundDeadlineAtMs) {
        return rejected(state, 'Round deadline has not passed')
      }
      return accepted(settleRound(state, command.atMs))
    }
    case 'advance-round': {
      if (command.actorId !== state.hostId) return rejected(state, 'Only the host can advance')
      if (state.phase !== 'results') return rejected(state, 'Round results are not ready')
      return accepted(advanceRound(state, command.atMs))
    }
    case 'auto-advance': {
      if (state.phase !== 'results' || state.autoAdvanceAtMs === undefined) {
        return rejected(state, 'Automatic advance is not scheduled')
      }
      if (command.atMs < state.autoAdvanceAtMs) {
        return rejected(state, 'Automatic advance time has not arrived')
      }
      return accepted(advanceRound(state, command.atMs))
    }
    case 'reset-game': {
      if (command.actorId !== state.hostId) return rejected(state, 'Only the host can reset')
      if (state.phase !== 'finished' || state.finishReason !== 'completed') {
        return rejected(state, 'Game is not ready for a rematch')
      }
      if (command.questions.length === 0) return rejected(state, 'A room requires at least one question')
      return accepted({
        ...state,
        phase: 'lobby',
        questions: command.questions,
        players: state.players
          .filter(({ connected }) => connected)
          .map((player) => ({ ...player, score: 0, correctElapsedTotalMs: 0 })),
        roundIndex: -1,
        roundStartedAtMs: undefined,
        roundDeadlineAtMs: undefined,
        submissions: [],
        autoAdvanceAtMs: undefined,
        pausedAtMs: undefined,
        hostReconnectDeadlineAtMs: undefined,
        resumePhase: undefined,
        finishReason: undefined,
      })
    }
    case 'disconnect': {
      if (command.actorId === state.hostId) {
        if (!state.hostConnected) return accepted(state)
        if (state.phase === 'finished') return accepted({ ...state, hostConnected: false })
        return accepted({
          ...state,
          hostConnected: false,
          phase: 'paused',
          pausedAtMs: command.atMs,
          hostReconnectDeadlineAtMs: command.atMs + HOST_RECONNECT_GRACE_MS,
          resumePhase: state.phase as Exclude<RoomPhase, 'paused' | 'finished'>,
        })
      }
      if (!state.players.some(({ id }) => id === command.actorId)) {
        return rejected(state, 'Actor is not in this room')
      }
      return accepted(updatePlayer(state, command.actorId, (player) => ({ ...player, connected: false })))
    }
    case 'reconnect': {
      if (command.actorId === state.hostId) {
        if (state.phase !== 'paused' || state.hostReconnectDeadlineAtMs === undefined) {
          return rejected(state, 'Host room is not paused')
        }
        if (command.atMs > state.hostReconnectDeadlineAtMs) {
          return accepted({ ...state, phase: 'finished', finishReason: 'host-disconnected' })
        }
        const pausedDurationMs = command.atMs - (state.pausedAtMs ?? command.atMs)
        return accepted({
          ...state,
          hostConnected: true,
          phase: state.resumePhase ?? 'lobby',
          roundStartedAtMs:
            state.roundStartedAtMs === undefined ? undefined : state.roundStartedAtMs + pausedDurationMs,
          roundDeadlineAtMs:
            state.roundDeadlineAtMs === undefined ? undefined : state.roundDeadlineAtMs + pausedDurationMs,
          autoAdvanceAtMs:
            state.autoAdvanceAtMs === undefined ? undefined : state.autoAdvanceAtMs + pausedDurationMs,
          pausedAtMs: undefined,
          hostReconnectDeadlineAtMs: undefined,
          resumePhase: undefined,
        })
      }
      if (!state.players.some(({ id }) => id === command.actorId)) {
        return rejected(state, 'Actor is not in this room')
      }
      return accepted(updatePlayer(state, command.actorId, (player) => ({ ...player, connected: true })))
    }
    case 'host-reconnect-timeout': {
      if (state.phase !== 'paused' || state.hostReconnectDeadlineAtMs === undefined) {
        return rejected(state, 'Host room is not paused')
      }
      if (command.atMs < state.hostReconnectDeadlineAtMs) {
        return rejected(state, 'Host reconnect grace period has not passed')
      }
      return accepted({ ...state, phase: 'finished', finishReason: 'host-disconnected' })
    }
  }
}

export function toPublicSnapshot(state: RoomState, nowMs = Date.now()): PublicRoomSnapshot {
  const question = state.questions[state.roundIndex]
  const hasRound = state.roundIndex >= 0 && question !== undefined
  const showResults = state.phase === 'results' || (state.phase === 'finished' && state.finishReason === 'completed')
  return {
    protocolVersion: MULTIPLAYER_PROTOCOL_VERSION,
    roomCode: state.roomCode,
    revision: state.revision,
    phase: state.phase,
    hostConnected: state.hostConnected,
    serverNowMs: nowMs,
    players: state.players.map((player) => ({
      id: player.id,
      nickname: player.nickname,
      connected: player.connected,
      score: player.score,
      correctElapsedTotalMs: player.correctElapsedTotalMs,
    })),
    autoAdvanceSeconds: state.autoAdvanceSeconds ?? null,
    ...(showResults && state.autoAdvanceAtMs !== undefined
      ? {
          autoAdvanceAtMs: state.autoAdvanceAtMs,
          autoAdvanceRemainingMs: Math.max(0, state.autoAdvanceAtMs - nowMs),
        }
      : {}),
    ...(hasRound && state.roundDeadlineAtMs !== undefined
      ? {
          round: {
            id: roundId(state.roundIndex),
            number: state.roundIndex + 1,
            total: state.questions.length,
            card: question.card,
            deadlineAtMs: state.roundDeadlineAtMs,
            remainingMs: Math.max(0, state.roundDeadlineAtMs - nowMs),
            answeredPlayerIds: state.submissions.map(({ playerId }) => playerId),
          },
        }
      : {}),
    ...(showResults && question
      ? {
          correctAnswer: question.evaluation.answer,
          results: state.submissions.map((submission) => ({
            playerId: submission.playerId,
            answer: submission.answer,
            isCorrect: submission.isCorrect,
            elapsedMs: submission.elapsedMs,
            pointsAwarded: submission.pointsAwarded,
          })),
        }
      : {}),
    ...(state.finishReason ? { finishReason: state.finishReason } : {}),
  }
}

export function rankPlayers(players: readonly RoomPlayer[]): RoomPlayer[] {
  return [...players].sort(
    (left, right) =>
      right.score - left.score ||
      left.correctElapsedTotalMs - right.correctElapsedTotalMs ||
      left.nickname.localeCompare(right.nickname),
  )
}
