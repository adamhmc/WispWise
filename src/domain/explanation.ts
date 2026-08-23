import { cardObjects, type Card } from './card'
import type { ValidCardEvaluation } from './evaluate-card'
import type { ColorId, ObjectId } from './types'

export interface DirectExplanation {
  readonly kind: 'direct'
  readonly answer: ObjectId
  readonly matchedColor: ColorId
}

export interface ExclusionExplanation {
  readonly kind: 'exclusion'
  readonly answer: ObjectId
  readonly shownObjects: readonly ObjectId[]
  readonly shownColors: readonly ColorId[]
}

export type AnswerExplanation = DirectExplanation | ExclusionExplanation

export function createAnswerExplanation(
  card: Card,
  evaluation: ValidCardEvaluation,
): AnswerExplanation {
  if (evaluation.kind === 'direct') {
    const matchingObject = cardObjects(card).find(
      ({ objectId }) => objectId === evaluation.answer,
    )

    if (!matchingObject) {
      throw new Error('Direct answer is not shown on the card')
    }

    return {
      kind: 'direct',
      answer: evaluation.answer,
      matchedColor: matchingObject.colorId,
    }
  }

  return {
    kind: 'exclusion',
    answer: evaluation.answer,
    shownObjects: cardObjects(card).map(({ objectId }) => objectId),
    shownColors: cardObjects(card).map(({ colorId }) => colorId),
  }
}
