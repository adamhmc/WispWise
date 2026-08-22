import { buildCompleteDeck, selectRound, shuffle, type LegalDeckCard, type ObjectId } from '@/domain'
import type { RandomSource } from '@/ports'

export interface AnswerRecord {
  readonly questionId: string
  readonly kind: 'direct' | 'exclusion'
  readonly correctAnswer: ObjectId
  readonly selectedAnswer: ObjectId
  readonly startedAtMs: number
  readonly answeredAtMs: number
  readonly elapsedMs: number
  readonly isCorrect: boolean
}

export interface GameSession {
  readonly id: string
  readonly mode: GameMode
  readonly questions: readonly LegalDeckCard[]
  readonly records: readonly AnswerRecord[]
  readonly explanationsEnabled: boolean
  readonly startedAtMs?: number
  readonly deadlineAtMs?: number
}

export type GameMode = 'classic' | 'timed'
export const TIMED_GAME_DURATION_MS = 60_000

export interface CreateGameSessionOptions {
  readonly id: string
  readonly explanationsEnabled: boolean
  readonly random: RandomSource
  readonly mode?: GameMode
  readonly legalDeck?: readonly LegalDeckCard[]
}

export function createGameSession({
  id,
  explanationsEnabled,
  random,
  mode = 'classic',
  legalDeck = buildCompleteDeck().legal,
}: CreateGameSessionOptions): GameSession {
  return {
    id,
    mode,
    explanationsEnabled: mode === 'timed' ? false : explanationsEnabled,
    questions: mode === 'timed'
      ? shuffle(legalDeck, () => random.next())
      : selectRound(legalDeck, () => random.next()),
    records: [],
  }
}
