import type { ColorId, ObjectId } from '@/domain'

export const PHASE_ONE_OBJECTS: Record<
  ObjectId,
  { readonly label: string }
> = {
  ghost: { label: '鬼' },
  chair: { label: '椅子' },
  bottle: { label: '瓶子' },
  book: { label: '書' },
  mouse: { label: '老鼠' },
}

export const COLOR_PRESENTATION: Record<ColorId, { readonly label: string; readonly value: string }> = {
  white: { label: '白色', value: '#fff9ec' },
  red: { label: '紅色', value: '#ff6268' },
  green: { label: '綠色', value: '#58d27a' },
  blue: { label: '藍色', value: '#48c7ef' },
  gray: { label: '灰色', value: '#a9b2bf' },
}
