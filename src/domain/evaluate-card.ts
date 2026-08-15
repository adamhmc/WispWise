import { CATALOG } from './catalog'
import type { Card } from './card'
import type { CatalogItem, ObjectId } from './types'

export type ValidCardKind = 'direct' | 'exclusion'
export type InvalidCardReason = 'no-answer' | 'multiple-answer'

export interface ValidCardEvaluation {
  readonly kind: ValidCardKind
  readonly answer: ObjectId
  readonly answers: readonly [ObjectId]
}

export interface InvalidCardEvaluation {
  readonly kind: 'invalid'
  readonly reason: InvalidCardReason
  readonly answers: readonly ObjectId[]
}

export type CardEvaluation = ValidCardEvaluation | InvalidCardEvaluation

function fixedColorIn(catalog: readonly CatalogItem[], objectId: ObjectId) {
  return catalog.find((item) => item.objectId === objectId)?.fixedColorId
}

export function findDirectMatches(
  card: Card,
  catalog: readonly CatalogItem[] = CATALOG,
): ObjectId[] {
  return [card.left, card.right]
    .filter(({ objectId, colorId }) => fixedColorIn(catalog, objectId) === colorId)
    .map(({ objectId }) => objectId)
}

export function findExclusionCandidates(
  card: Card,
  catalog: readonly CatalogItem[] = CATALOG,
): ObjectId[] {
  const shownObjects = new Set([card.left.objectId, card.right.objectId])
  const shownColors = new Set([card.left.colorId, card.right.colorId])

  return catalog.filter(
    ({ objectId, fixedColorId }) =>
      !shownObjects.has(objectId) && !shownColors.has(fixedColorId),
  ).map(({ objectId }) => objectId)
}

function invalidEvaluation(answers: readonly ObjectId[]): InvalidCardEvaluation {
  return {
    kind: 'invalid',
    reason: answers.length === 0 ? 'no-answer' : 'multiple-answer',
    answers,
  }
}

export function evaluateCard(
  card: Card,
  catalog: readonly CatalogItem[] = CATALOG,
): CardEvaluation {
  const directMatches = findDirectMatches(card, catalog)

  if (directMatches.length === 1) {
    const answer = directMatches[0]
    return { kind: 'direct', answer, answers: [answer] }
  }

  if (directMatches.length > 1) {
    return invalidEvaluation(directMatches)
  }

  const exclusionCandidates = findExclusionCandidates(card, catalog)

  if (exclusionCandidates.length === 1) {
    const answer = exclusionCandidates[0]
    return { kind: 'exclusion', answer, answers: [answer] }
  }

  return invalidEvaluation(exclusionCandidates)
}
