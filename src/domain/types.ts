import { WISPWISE_SEVEN_OBJECT_THEME, WISPWISE_THEME } from './theme'

export type ObjectId = (typeof WISPWISE_SEVEN_OBJECT_THEME.objects)[number]['objectId']
export type ColorId = (typeof WISPWISE_SEVEN_OBJECT_THEME.colors)[number]['colorId']

export const CLASSIC_OBJECT_IDS = WISPWISE_THEME.objects.map(({ objectId }) => objectId) as readonly ObjectId[]
export const CLASSIC_COLOR_IDS = WISPWISE_THEME.colors.map(({ colorId }) => colorId) as readonly ColorId[]
export const OBJECT_IDS = WISPWISE_SEVEN_OBJECT_THEME.objects.map(({ objectId }) => objectId) as readonly ObjectId[]
export const COLOR_IDS = WISPWISE_SEVEN_OBJECT_THEME.colors.map(({ colorId }) => colorId) as readonly ColorId[]

export interface CatalogItem {
  readonly objectId: ObjectId
  readonly fixedColorId: ColorId
  readonly label: string
  readonly assetKey: ObjectId
}

export interface CardObject {
  readonly objectId: ObjectId
  readonly colorId: ColorId
}
