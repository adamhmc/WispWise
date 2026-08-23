export interface ThemeColorDefinition {
  readonly colorId: string
  readonly label: string
  readonly value: string
}

export interface ThemeObjectDefinition {
  readonly objectId: string
  readonly fixedColorId: string
  readonly label: string
  readonly assetKey: string
}

export interface ThemeDefinition {
  readonly id: string
  readonly label: string
  readonly colors: readonly ThemeColorDefinition[]
  readonly objects: readonly ThemeObjectDefinition[]
}

export const GAME_OBJECT_COUNTS = [5, 7] as const
export type GameObjectCount = (typeof GAME_OBJECT_COUNTS)[number]

export function validateThemeDefinition<TTheme extends ThemeDefinition>(theme: TTheme): TTheme {
  if (!theme.id.trim() || !theme.label.trim()) throw new Error('Theme requires an id and label')
  if (theme.objects.length < 3) throw new Error('Theme requires at least three objects')
  if (theme.objects.length !== theme.colors.length) {
    throw new Error('Theme requires one color for every object')
  }

  const objectIds = new Set(theme.objects.map(({ objectId }) => objectId))
  const colorIds = new Set(theme.colors.map(({ colorId }) => colorId))
  const fixedColorIds = new Set(theme.objects.map(({ fixedColorId }) => fixedColorId))

  if (objectIds.size !== theme.objects.length) throw new Error('Theme object ids must be unique')
  if (colorIds.size !== theme.colors.length) throw new Error('Theme color ids must be unique')
  if (fixedColorIds.size !== theme.objects.length) throw new Error('Theme fixed colors must be unique')
  if (theme.objects.some(({ fixedColorId }) => !colorIds.has(fixedColorId))) {
    throw new Error('Every fixed color must exist in the theme color palette')
  }

  return theme
}

const CLASSIC_COLORS = [
  { colorId: 'white', label: '白色', value: '#ffffff' },
  { colorId: 'red', label: '紅色', value: '#ff6268' },
  { colorId: 'green', label: '綠色', value: '#58d27a' },
  { colorId: 'blue', label: '藍色', value: '#48c7ef' },
  { colorId: 'gray', label: '灰色', value: '#667085' },
] as const

const CLASSIC_OBJECTS = [
  { objectId: 'ghost', fixedColorId: 'white', label: '鬼', assetKey: 'ghost' },
  { objectId: 'chair', fixedColorId: 'red', label: '椅子', assetKey: 'chair' },
  { objectId: 'bottle', fixedColorId: 'green', label: '瓶子', assetKey: 'bottle' },
  { objectId: 'book', fixedColorId: 'blue', label: '書', assetKey: 'book' },
  { objectId: 'mouse', fixedColorId: 'gray', label: '老鼠', assetKey: 'mouse' },
] as const

export const WISPWISE_THEME = validateThemeDefinition({
  id: 'haunted-house',
  label: '幽靈古宅',
  colors: CLASSIC_COLORS,
  objects: CLASSIC_OBJECTS,
} as const satisfies ThemeDefinition)

export const WISPWISE_SEVEN_OBJECT_THEME = validateThemeDefinition({
  id: 'haunted-house-seven',
  label: '幽靈古宅・七物品',
  colors: [
    ...CLASSIC_COLORS,
    { colorId: 'yellow', label: '黃色', value: '#f4b928' },
    { colorId: 'purple', label: '紫色', value: '#a83fe3' },
  ],
  objects: [
    ...CLASSIC_OBJECTS,
    { objectId: 'pumpkin', fixedColorId: 'yellow', label: '南瓜', assetKey: 'pumpkin' },
    { objectId: 'wizard-hat', fixedColorId: 'purple', label: '巫師帽', assetKey: 'wizard-hat' },
  ],
} as const satisfies ThemeDefinition)

export function themeForObjectCount(objectCount: GameObjectCount) {
  return objectCount === 7 ? WISPWISE_SEVEN_OBJECT_THEME : WISPWISE_THEME
}
