import { catalogForObjectCount, type GameObjectCount, type ObjectId } from '@/domain'
import { ObjectGlyph } from './ObjectGlyph'

interface AnswerOptionsProps {
  readonly disabled: boolean
  readonly objectCount?: GameObjectCount
  readonly selectedAnswer?: ObjectId
  readonly correctAnswer?: ObjectId
  readonly onSelect: (objectId: ObjectId) => void
}

export function AnswerOptions({
  disabled,
  objectCount = 5,
  selectedAnswer,
  correctAnswer,
  onSelect,
}: AnswerOptionsProps) {
  const catalog = catalogForObjectCount(objectCount)
  return (
    <section className="answer-panel" aria-labelledby="answer-options-title">
      <div className="answer-panel__heading">
        <span id="answer-options-title">選擇正確物品</span>
        <span className="answer-panel__hint">每題只能選一次</span>
      </div>
      <div className="answer-options" data-object-count={objectCount}>
        {catalog.map(({ objectId, fixedColorId, label }, index) => {
          const selected = selectedAnswer === objectId
          const status = correctAnswer === objectId
            ? 'correct'
            : selected && correctAnswer
              ? 'incorrect'
              : undefined

          return (
            <button
              className="answer-option"
              data-selected={selected || undefined}
              data-status={status}
              disabled={disabled}
              key={objectId}
              type="button"
              onClick={() => onSelect(objectId)}
              aria-pressed={selected}
              aria-label={`選擇${label}`}
            >
              <span className="answer-option__number" aria-hidden="true">{index + 1}</span>
              <span className="answer-option__disc">
                <ObjectGlyph objectId={objectId} colorId={fixedColorId} decorative />
              </span>
              <span className="answer-option__label">{label}</span>
              {status || selected ? (
                <span
                  className="answer-option__result"
                  data-selection-confirmed={selected && !status ? true : undefined}
                  aria-hidden="true"
                >
                  {status === 'incorrect' ? '×' : '✓'}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
