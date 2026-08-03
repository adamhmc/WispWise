import { OBJECT_IDS, type CardObject } from './types'

export type CardId = string & { readonly __brand: 'CardId' }

export interface Card {
  readonly id: CardId
  readonly left: CardObject
  readonly right: CardObject
}

const objectOrder = new Map(OBJECT_IDS.map((objectId, index) => [objectId, index]))

export function canonicalCardId(first: CardObject, second: CardObject): CardId {
  const ordered = [first, second].sort(
    (a, b) => (objectOrder.get(a.objectId) ?? 0) - (objectOrder.get(b.objectId) ?? 0),
  )

  return ordered.map(({ objectId, colorId }) => `${objectId}:${colorId}`).join('|') as CardId
}

export function createCard(left: CardObject, right: CardObject): Card {
  if (left.objectId === right.objectId) {
    throw new Error('Card objects must be different')
  }

  if (left.colorId === right.colorId) {
    throw new Error('Card colors must be different')
  }

  return {
    id: canonicalCardId(left, right),
    left,
    right,
  }
}
