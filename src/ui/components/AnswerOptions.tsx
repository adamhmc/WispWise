import { CATALOG, type ObjectId } from '@/domain'
import { PHASE_ONE_OBJECTS } from '@/ui/presentation'
import { ObjectGlyph } from './ObjectGlyph'

interface AnswerOptionsProps {
  readonly disabled: boolean
  readonly selectedAnswer?: ObjectId
  readonly onSelect: (objectId: ObjectId) => void
}

export function AnswerOptions({ disabled, selectedAnswer, onSelect }: AnswerOptionsProps) {
  return (
    <section className="answer-panel" aria-labelledby="answer-options-title">
      <div className="answer-panel__heading">
        <span id="answer-options-title">選擇正確物品</span>
        <span className="answer-panel__hint">每題只能選一次</span>
      </div>
      <div className="answer-options">
        {CATALOG.map(({ objectId, fixedColorId }, index) => {
          const presentation = PHASE_ONE_OBJECTS[objectId]
          const selected = selectedAnswer === objectId

          return (
            <button
              className="answer-option"
              data-selected={selected || undefined}
              disabled={disabled}
              key={objectId}
              type="button"
              onClick={() => onSelect(objectId)}
              aria-pressed={selected}
              aria-label={`選擇${presentation.label}`}
            >
              <span className="answer-option__number" aria-hidden="true">{index + 1}</span>
              <span className="answer-option__disc">
                <ObjectGlyph objectId={objectId} colorId={fixedColorId} decorative />
              </span>
              <span className="answer-option__label">{presentation.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
