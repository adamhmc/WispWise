import type { ColorId, ObjectId } from '@/domain'
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

  return (
    <span
      className={`object-glyph object-glyph--${object.shape} object-glyph--${size}`}
      style={{ '--glyph-color': color.value } as React.CSSProperties}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${color.label}${object.label}`}
    />
  )
}
