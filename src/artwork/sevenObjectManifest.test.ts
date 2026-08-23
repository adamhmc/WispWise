import { SEVEN_OBJECT_DECK } from '@/domain'
import { SEVEN_OBJECT_ARTWORK_MANIFEST } from './sevenObjectManifest'

describe('seven-object artwork manifest', () => {
  it('provides one approved image for every seven-object question', () => {
    expect(SEVEN_OBJECT_ARTWORK_MANIFEST.cards).toHaveLength(SEVEN_OBJECT_DECK.length)
    expect(new Set(SEVEN_OBJECT_ARTWORK_MANIFEST.cards.map(({ cardId }) => cardId))).toEqual(
      new Set(SEVEN_OBJECT_DECK.map(({ card }) => card.id)),
    )
    expect(SEVEN_OBJECT_ARTWORK_MANIFEST.cards.every(({ variants }) =>
      variants.length === 1 && variants[0].status === 'approved' && /\.(jpg|png)$/.test(variants[0].imageUrl),
    )).toBe(true)
  })
})
