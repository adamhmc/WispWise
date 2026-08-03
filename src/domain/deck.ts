import { createCard, type Card } from './card'
import { evaluateCard, type InvalidCardEvaluation, type ValidCardEvaluation } from './evaluate-card'
import { COLOR_IDS, OBJECT_IDS } from './types'

export interface LegalDeckCard {
  readonly card: Card
  readonly evaluation: ValidCardEvaluation
}

export interface InvalidDeckCard {
  readonly card: Card
  readonly evaluation: InvalidCardEvaluation
}

export interface CompleteDeck {
  readonly candidates: readonly Card[]
  readonly legal: readonly LegalDeckCard[]
  readonly invalid: readonly InvalidDeckCard[]
}

export function generateCandidateCards(): Card[] {
  const cards: Card[] = []

  for (let firstIndex = 0; firstIndex < OBJECT_IDS.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < OBJECT_IDS.length; secondIndex += 1) {
      for (const firstColor of COLOR_IDS) {
        for (const secondColor of COLOR_IDS) {
          if (firstColor === secondColor) {
            continue
          }

          cards.push(
            createCard(
              { objectId: OBJECT_IDS[firstIndex], colorId: firstColor },
              { objectId: OBJECT_IDS[secondIndex], colorId: secondColor },
            ),
          )
        }
      }
    }
  }

  return cards
}

export function buildCompleteDeck(): CompleteDeck {
  const candidates = generateCandidateCards()
  const legal: LegalDeckCard[] = []
  const invalid: InvalidDeckCard[] = []

  for (const card of candidates) {
    const evaluation = evaluateCard(card)

    if (evaluation.kind === 'invalid') {
      invalid.push({ card, evaluation })
    } else {
      legal.push({ card, evaluation })
    }
  }

  return { candidates, legal, invalid }
}
