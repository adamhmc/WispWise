import type { LegalDeckCard } from './deck'
import { shuffle, type RandomSource } from './shuffle'

export const ROUND_QUESTION_COUNT = 10
export const QUESTIONS_PER_KIND = 5

export function selectRound(
  legalDeck: readonly LegalDeckCard[],
  random: RandomSource,
): LegalDeckCard[] {
  const direct = legalDeck.filter(({ evaluation }) => evaluation.kind === 'direct')
  const exclusion = legalDeck.filter(({ evaluation }) => evaluation.kind === 'exclusion')

  if (direct.length < QUESTIONS_PER_KIND || exclusion.length < QUESTIONS_PER_KIND) {
    throw new Error('Deck does not contain enough questions of each kind')
  }

  const selected = [
    ...shuffle(direct, random).slice(0, QUESTIONS_PER_KIND),
    ...shuffle(exclusion, random).slice(0, QUESTIONS_PER_KIND),
  ]

  return shuffle(selected, random)
}
