import type { ColorId, ObjectId } from '@/domain'

export const PHASE_ONE_OBJECTS: Record<
  ObjectId,
  { readonly label: string; readonly shape: 'circle' | 'triangle' | 'square' | 'star' | 'hexagon' }
> = {
  ghost: { label: '圓形', shape: 'circle' },
  chair: { label: '三角形', shape: 'triangle' },
  bottle: { label: '正方形', shape: 'square' },
  book: { label: '星形', shape: 'star' },
  mouse: { label: '六角形', shape: 'hexagon' },
}

export const COLOR_PRESENTATION: Record<ColorId, { readonly label: string; readonly value: string }> = {
  white: { label: '白色', value: '#fff9ec' },
  red: { label: '紅色', value: '#ff6268' },
  green: { label: '綠色', value: '#58d27a' },
  blue: { label: '藍色', value: '#48c7ef' },
  gray: { label: '灰色', value: '#a9b2bf' },
}
