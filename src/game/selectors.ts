import type { LegalDeckCard } from '@/domain'
import type { GameState } from './state'

export function selectCurrentQuestion(state: GameState): LegalDeckCard | null {
  if (state.status === 'preparing' || state.status === 'answering' || state.status === 'feedback') {
    return state.session.questions[state.questionIndex] ?? null
  }

  return null
}

export function selectScore(state: GameState): number {
  if (state.status === 'home' || state.status === 'tutorial') return 0
  return state.session.records.filter(({ isCorrect }) => isCorrect).length
}
