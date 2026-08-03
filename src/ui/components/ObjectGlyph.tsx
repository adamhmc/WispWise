import { getFixedColor, type ColorId, type ObjectId } from '@/domain'
import { OBJECT_ASSETS } from '@/ui/assets'
import { COLOR_PRESENTATION, PHASE_ONE_OBJECTS } from '@/ui/presentation'

interface ObjectGlyphProps {
  readonly objectId: ObjectId
  readonly colorId: ColorId
  readonly size?: 'small' | 'large'
  readonly decorative?: boolean
}

export function ObjectGlyph({
  objectId,
  colorId,
  size = 'small',
  decorative = false,
}: ObjectGlyphProps) {
  const object = PHASE_ONE_OBJECTS[objectId]
  const color = COLOR_PRESENTATION[colorId]
  const isCanonicalColor = getFixedColor(objectId) === colorId

  return (
    <span
      className={`object-glyph object-glyph--${size}`}
      data-object={objectId}
      data-recolored={isCanonicalColor ? undefined : true}
      style={{
        '--glyph-color': color.value,
        '--glyph-image': `url(${OBJECT_ASSETS[objectId]})`,
      } as React.CSSProperties}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${color.label}${object.label}`}
    >
      <img src={OBJECT_ASSETS[objectId]} alt="" draggable={false} />
    </span>
  )
}
