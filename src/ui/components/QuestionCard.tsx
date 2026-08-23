import { cardObjects, type Card } from '@/domain'
import { CARD_ARTWORK_MANIFEST } from '@/artwork/manifest'
import { SEVEN_OBJECT_ARTWORK_MANIFEST } from '@/artwork/sevenObjectManifest'
import { selectApprovedArtwork, type CardArtworkVariant } from '@/artwork/types'
import { ObjectGlyph } from './ObjectGlyph'

interface QuestionCardProps {
  readonly card: Card
  readonly artwork?: CardArtworkVariant
}

export function QuestionCard({
  card,
  artwork = selectApprovedArtwork(SEVEN_OBJECT_ARTWORK_MANIFEST, card.id)
    ?? selectApprovedArtwork(CARD_ARTWORK_MANIFEST, card.id),
}: QuestionCardProps) {
  return (
    <article className="question-card" aria-label="題目卡" data-artwork={artwork ? 'illustrated' : 'fallback'}>
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
