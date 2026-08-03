import type { Card } from '@/domain'
import { ObjectGlyph } from './ObjectGlyph'

interface QuestionCardProps {
  readonly card: Card
}

export function QuestionCard({ card }: QuestionCardProps) {
  return (
    <article className="question-card" aria-label="題目卡">
      <div className="question-card__shine" aria-hidden="true" />
      <div className="question-card__objects">
        <ObjectGlyph objectId={card.left.objectId} colorId={card.left.colorId} size="large" />
        <ObjectGlyph objectId={card.right.objectId} colorId={card.right.colorId} size="large" />
      </div>
      <span className="question-card__mark" aria-hidden="true">?</span>
    </article>
  )
}
