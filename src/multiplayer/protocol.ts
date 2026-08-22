import { OBJECT_IDS, type Card, type ObjectId } from '../domain'

export const MULTIPLAYER_PROTOCOL_VERSION = 2 as const
export const ROOM_CODE_LENGTH = 6
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROUND_DURATION_MS = 15_000
export const HOST_RECONNECT_GRACE_MS = 30_000
export const CORRECT_ANSWER_POINTS = 1_000
export const MAX_SCORE_GRACE_MS = 500
export const MAX_ROOM_PLAYERS = 8
export const AUTO_ADVANCE_SECONDS_OPTIONS = [3, 5, 10] as const

export type AutoAdvanceSeconds = (typeof AUTO_ADVANCE_SECONDS_OPTIONS)[number]

export function calculateCorrectAnswerPoints(elapsedMs: number): number {
  const normalizedElapsedMs = Math.max(0, elapsedMs)
  if (normalizedElapsedMs <= MAX_SCORE_GRACE_MS) return CORRECT_ANSWER_POINTS
  if (normalizedElapsedMs >= ROUND_DURATION_MS) return 0

  const scoringWindowMs = ROUND_DURATION_MS - MAX_SCORE_GRACE_MS
  const remainingScoringMs = ROUND_DURATION_MS - normalizedElapsedMs
  return Math.round(CORRECT_ANSWER_POINTS * (remainingScoringMs / scoringWindowMs))
}

export type RoomPhase = 'lobby' | 'playing' | 'results' | 'paused' | 'finished'

export interface PublicPlayer {
  readonly id: string
  readonly nickname: string
  readonly connected: boolean
  readonly score: number
  readonly correctElapsedTotalMs: number
}

export interface PublicRound {
  readonly id: string
  readonly number: number
  readonly total: number
  readonly card: Card
  readonly deadlineAtMs: number
  readonly remainingMs: number
  readonly answeredPlayerIds: readonly string[]
}

export interface RoundResult {
  readonly playerId: string
  readonly answer: ObjectId
  readonly isCorrect: boolean
  readonly elapsedMs: number
  readonly pointsAwarded: number
}

export interface PublicRoomSnapshot {
  readonly protocolVersion: typeof MULTIPLAYER_PROTOCOL_VERSION
  readonly roomCode: string
  readonly revision: number
  readonly phase: RoomPhase
  readonly hostConnected: boolean
  readonly serverNowMs: number
  readonly players: readonly PublicPlayer[]
  readonly autoAdvanceSeconds: AutoAdvanceSeconds | null
  readonly autoAdvanceAtMs?: number
  readonly autoAdvanceRemainingMs?: number
  readonly round?: PublicRound
  readonly correctAnswer?: ObjectId
  readonly results?: readonly RoundResult[]
  readonly finishReason?: 'completed' | 'host-disconnected'
}

export type ClientMessage =
  | {
      readonly type: 'join-room'
      readonly nickname: string
      readonly reconnectToken?: string
    }
  | { readonly type: 'start-game' }
  | {
      readonly type: 'set-auto-advance'
      readonly seconds: AutoAdvanceSeconds | null
    }
  | {
      readonly type: 'submit-answer'
      readonly commandId: string
      readonly roundId: string
      readonly answer: ObjectId
    }
  | { readonly type: 'advance-round' }
  | { readonly type: 'reset-game' }

export type ServerMessage =
  | { readonly type: 'room-snapshot'; readonly snapshot: PublicRoomSnapshot }
  | {
      readonly type: 'joined-room'
      readonly playerId: string
      readonly reconnectToken: string
      readonly snapshot: PublicRoomSnapshot
    }
  | { readonly type: 'answer-accepted'; readonly commandId: string }
  | {
      readonly type: 'command-rejected'
      readonly commandId?: string
      readonly reason: string
    }

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isObjectId(value: unknown): value is ObjectId {
  return typeof value === 'string' && (OBJECT_IDS as readonly string[]).includes(value)
}

function isAutoAdvanceSeconds(value: unknown): value is AutoAdvanceSeconds {
  return typeof value === 'number' && (AUTO_ADVANCE_SECONDS_OPTIONS as readonly number[]).includes(value)
}

export function parseClientMessage(value: unknown): ClientMessage | null {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  switch (value.type) {
    case 'join-room':
      if (!isNonEmptyString(value.nickname)) return null
      if (value.reconnectToken !== undefined && !isNonEmptyString(value.reconnectToken)) return null
      return {
        type: 'join-room',
        nickname: value.nickname.trim(),
        ...(value.reconnectToken === undefined ? {} : { reconnectToken: value.reconnectToken }),
      }
    case 'start-game':
    case 'advance-round':
    case 'reset-game':
      return { type: value.type }
    case 'set-auto-advance':
      if (value.seconds !== null && !isAutoAdvanceSeconds(value.seconds)) return null
      return { type: 'set-auto-advance', seconds: value.seconds }
    case 'submit-answer':
      if (
        !isNonEmptyString(value.commandId) ||
        !isNonEmptyString(value.roundId) ||
        !isObjectId(value.answer)
      ) {
        return null
      }
      return {
        type: 'submit-answer',
        commandId: value.commandId,
        roundId: value.roundId,
        answer: value.answer,
      }
    default:
      return null
  }
}
