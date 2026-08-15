import type { CardId, LegalDeckCard } from '@/domain'

export interface CardArtworkVariant {
  readonly id: string
  readonly imageUrl: string
  readonly alt: string
  readonly status: 'draft' | 'approved'
}

export interface CardArtworkEntry {
  readonly cardId: CardId
  readonly variants: readonly CardArtworkVariant[]
}

export interface CardArtworkManifest {
  readonly themeId: string
  readonly version: number
  readonly cards: readonly CardArtworkEntry[]
}

export function validateArtworkManifest(
  manifest: CardArtworkManifest,
  legalDeck: readonly LegalDeckCard[],
): CardArtworkManifest {
  const legalIds = new Set(legalDeck.map(({ card }) => card.id))
  const seenCardIds = new Set<CardId>()

  if (!manifest.themeId.trim() || manifest.version < 1) {
    throw new Error('Artwork manifest requires a theme id and positive version')
  }

  for (const entry of manifest.cards) {
    if (!legalIds.has(entry.cardId)) throw new Error(`Artwork references an illegal card: ${entry.cardId}`)
    if (seenCardIds.has(entry.cardId)) throw new Error(`Artwork card is duplicated: ${entry.cardId}`)
    seenCardIds.add(entry.cardId)

    const variantIds = new Set<string>()
    for (const variant of entry.variants) {
      if (!variant.id.trim() || !variant.imageUrl.trim() || !variant.alt.trim()) {
        throw new Error(`Artwork variant is incomplete for card: ${entry.cardId}`)
      }
      if (variantIds.has(variant.id)) throw new Error(`Artwork variant is duplicated: ${variant.id}`)
      variantIds.add(variant.id)
    }
  }

  return manifest
}

export function selectApprovedArtwork(
  manifest: CardArtworkManifest,
  cardId: CardId,
  variantSeed = 0,
): CardArtworkVariant | undefined {
  const approved = manifest.cards
    .find((entry) => entry.cardId === cardId)
    ?.variants.filter(({ status }) => status === 'approved')

  if (!approved?.length) return undefined
  return approved[Math.abs(variantSeed) % approved.length]
}
