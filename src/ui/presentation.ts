import { WISPWISE_SEVEN_OBJECT_THEME, type ColorId } from '@/domain'

export const COLOR_PRESENTATION = Object.fromEntries(
  WISPWISE_SEVEN_OBJECT_THEME.colors.map(({ colorId, label, value }) => [colorId, { label, value }]),
) as Record<ColorId, { readonly label: string; readonly value: string }>
