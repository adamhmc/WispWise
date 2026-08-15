import { buildCompleteDeck, WISPWISE_THEME } from '@/domain'
import { CARD_ARTWORK_MANIFEST } from './manifest'
import { selectApprovedArtwork, validateArtworkManifest, type CardArtworkManifest } from './types'

const deck = buildCompleteDeck(WISPWISE_THEME).legal
const cardId = deck[0].card.id

describe('card artwork manifest', () => {
  it('ships reviewed artwork for every legal card, balanced across both rule types', () => {
    const kindByCardId = new Map(deck.map(({ card, evaluation }) => [card.id, evaluation.kind]))
    const expectedCardIds = new Set(deck.map(({ card }) => card.id))
    const artworkCardIds = new Set(CARD_ARTWORK_MANIFEST.cards.map(({ cardId }) => cardId))

    expect(CARD_ARTWORK_MANIFEST.cards).toHaveLength(120)
    expect(artworkCardIds).toEqual(expectedCardIds)
    expect(CARD_ARTWORK_MANIFEST.cards.filter(({ cardId }) => kindByCardId.get(cardId) === 'direct')).toHaveLength(60)
    expect(CARD_ARTWORK_MANIFEST.cards.filter(({ cardId }) => kindByCardId.get(cardId) === 'exclusion')).toHaveLength(60)
    expect(CARD_ARTWORK_MANIFEST.cards.every(({ variants }) =>
      variants.length > 0 && variants.every(({ status, imageUrl }) =>
        status === 'approved' && imageUrl.endsWith('.webp')),
    )).toBe(true)
  })

  it('selects approved variants deterministically and ignores drafts', () => {
    const manifest: CardArtworkManifest = {
      themeId: WISPWISE_THEME.id,
      version: 1,
      cards: [{
        cardId,
        variants: [
          { id: 'draft', imageUrl: '/draft.webp', alt: 'draft', status: 'draft' },
          { id: 'a', imageUrl: '/a.webp', alt: 'a', status: 'approved' },
          { id: 'b', imageUrl: '/b.webp', alt: 'b', status: 'approved' },
        ],
      }],
    }

    expect(selectApprovedArtwork(manifest, cardId, 0)?.id).toBe('a')
    expect(selectApprovedArtwork(manifest, cardId, 1)?.id).toBe('b')
  })

  it('rejects artwork for cards outside the legal deck', () => {
    expect(() => validateArtworkManifest({
      themeId: WISPWISE_THEME.id,
      version: 1,
      cards: [{
        cardId: 'not-a-card' as typeof cardId,
        variants: [{ id: 'a', imageUrl: '/a.webp', alt: 'a', status: 'approved' }],
      }],
    }, deck)).toThrow('illegal card')
  })
})
