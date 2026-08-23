import { OBJECT_IDS, type CardObject } from './types'

export type CardId = string & { readonly __brand: 'CardId' }

export interface Card {
  readonly id: CardId
  readonly left: CardObject
  readonly right: CardObject
  readonly third?: CardObject
}

const objectOrder = new Map(OBJECT_IDS.map((objectId, index) => [objectId, index]))

export function cardObjects(card: Card): readonly CardObject[] {
  return card.third ? [card.left, card.right, card.third] : [card.left, card.right]
}

export function canonicalCardId(first: CardObject, second: CardObject, third?: CardObject): CardId {
  const ordered = [first, second, ...(third ? [third] : [])].sort(
    (a, b) => (objectOrder.get(a.objectId) ?? 0) - (objectOrder.get(b.objectId) ?? 0),
  )

  return ordered.map(({ objectId, colorId }) => `${objectId}:${colorId}`).join('|') as CardId
}

export function createCard(left: CardObject, right: CardObject, third?: CardObject): Card {
  const objects = [left, right, ...(third ? [third] : [])]
  if (new Set(objects.map(({ objectId }) => objectId)).size !== objects.length) {
    throw new Error('Card objects must be different')
  }

  if (new Set(objects.map(({ colorId }) => colorId)).size !== objects.length) {
    throw new Error('Card colors must be different')
  }

  return {
    id: canonicalCardId(left, right, third),
    left,
    right,
    ...(third ? { third } : {}),
  }
}
