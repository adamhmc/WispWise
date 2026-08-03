import { buildCompleteDeck, selectRound, type LegalDeckCard, type ObjectId } from '@/domain'
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
  readonly questions: readonly LegalDeckCard[]
  readonly records: readonly AnswerRecord[]
  readonly explanationsEnabled: boolean
}

export interface CreateGameSessionOptions {
  readonly id: string
  readonly explanationsEnabled: boolean
  readonly random: RandomSource
  readonly legalDeck?: readonly LegalDeckCard[]
}

export function createGameSession({
  id,
  explanationsEnabled,
  random,
  legalDeck = buildCompleteDeck().legal,
}: CreateGameSessionOptions): GameSession {
  return {
    id,
    explanationsEnabled,
    questions: selectRound(legalDeck, () => random.next()),
    records: [],
  }
}
