import { buildCompleteDeck, type LegalDeckCard } from './deck'
import { selectRound } from './select-round'
import { SEVEN_OBJECT_DECK } from './seven-object-deck'
import { shuffle, type RandomSource } from './shuffle'
import type { GameObjectCount } from './theme'

export function legalDeckForObjectCount(objectCount: GameObjectCount): readonly LegalDeckCard[] {
  return objectCount === 7 ? SEVEN_OBJECT_DECK : buildCompleteDeck().legal
}

export function selectRoundForObjectCount(
  objectCount: GameObjectCount,
  random: RandomSource,
): LegalDeckCard[] {
  const deck = legalDeckForObjectCount(objectCount)
  return objectCount === 7 ? shuffle(deck, random).slice(0, 10) : selectRound(deck, random)
}
