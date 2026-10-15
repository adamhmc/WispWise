import { cardObjects, type ArtworkStyle, type Card } from '@/domain'
import { CARD_ARTWORK_MANIFEST } from '@/artwork/manifest'
import { SEVEN_OBJECT_ARTWORK_MANIFEST } from '@/artwork/sevenObjectManifest'
import { selectApprovedArtwork, type CardArtworkVariant } from '@/artwork/types'
import {
  VAN_GOGH_FIVE_OBJECT_ARTWORK_MANIFEST,
  VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST,
} from '@/artwork/vanGoghManifest'
import { ObjectGlyph } from './ObjectGlyph'

interface QuestionCardProps {
  readonly card: Card
  readonly artwork?: CardArtworkVariant
  readonly variantSeed?: number
  readonly artworkStyle?: ArtworkStyle
}

function selectArtwork(card: Card, style: ArtworkStyle, variantSeed: number): CardArtworkVariant | undefined {
  if (style === 'van-gogh') {
    const styled = selectApprovedArtwork(VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST, card.id, variantSeed)
      ?? selectApprovedArtwork(VAN_GOGH_FIVE_OBJECT_ARTWORK_MANIFEST, card.id, variantSeed)
    if (styled) return styled
  }

  return selectApprovedArtwork(SEVEN_OBJECT_ARTWORK_MANIFEST, card.id, variantSeed)
    ?? selectApprovedArtwork(CARD_ARTWORK_MANIFEST, card.id, variantSeed)
}

export function QuestionCard({
  card,
  variantSeed = 0,
  artworkStyle = 'classic',
  artwork = selectArtwork(card, artworkStyle, variantSeed),
}: QuestionCardProps) {
  return (
    <article className="question-card" aria-label="題目卡" data-artwork={artwork ? 'illustrated' : 'fallback'} data-artwork-style={artworkStyle}>
      <div className="question-card__shine" aria-hidden="true" />
      {artwork ? (
        <img className="question-card__artwork" src={artwork.imageUrl} alt={artwork.alt} />
      ) : (
        <div className="question-card__objects">
          {cardObjects(card).map(({ objectId, colorId }) => (
            <ObjectGlyph key={objectId} objectId={objectId} colorId={colorId} size="large" />
          ))}
        </div>
      )}
      <span className="question-card__mark" aria-hidden="true">?</span>
    </article>
  )
}
