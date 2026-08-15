import { createCard, type Card } from './card'
import { evaluateCard, type InvalidCardEvaluation, type ValidCardEvaluation } from './evaluate-card'
import { WISPWISE_THEME } from './theme'
import type { CatalogItem, ColorId } from './types'

export interface PlayableTheme {
  readonly colors: readonly { readonly colorId: ColorId }[]
  readonly objects: readonly CatalogItem[]
}

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

export function generateCandidateCards(theme: PlayableTheme = WISPWISE_THEME): Card[] {
  const cards: Card[] = []
  const objectIds = theme.objects.map(({ objectId }) => objectId)
  const colorIds = theme.colors.map(({ colorId }) => colorId)

  for (let firstIndex = 0; firstIndex < objectIds.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < objectIds.length; secondIndex += 1) {
      for (const firstColor of colorIds) {
        for (const secondColor of colorIds) {
          if (firstColor === secondColor) {
            continue
          }

          cards.push(
            createCard(
              { objectId: objectIds[firstIndex], colorId: firstColor },
              { objectId: objectIds[secondIndex], colorId: secondColor },
            ),
          )
        }
      }
    }
  }

  return cards
}

export function buildCompleteDeck(theme: PlayableTheme = WISPWISE_THEME): CompleteDeck {
  const candidates = generateCandidateCards(theme)
  const legal: LegalDeckCard[] = []
  const invalid: InvalidDeckCard[] = []

  for (const card of candidates) {
    const evaluation = evaluateCard(card, theme.objects)

    if (evaluation.kind === 'invalid') {
      invalid.push({ card, evaluation })
    } else {
      legal.push({ card, evaluation })
    }
  }

  return { candidates, legal, invalid }
}
