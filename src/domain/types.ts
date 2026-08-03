export const OBJECT_IDS = ['ghost', 'chair', 'bottle', 'book', 'mouse'] as const
export const COLOR_IDS = ['white', 'red', 'green', 'blue', 'gray'] as const

export type ObjectId = (typeof OBJECT_IDS)[number]
export type ColorId = (typeof COLOR_IDS)[number]

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
