import { themeForObjectCount, WISPWISE_SEVEN_OBJECT_THEME, WISPWISE_THEME, type GameObjectCount, type ThemeDefinition } from './theme'
import { type CatalogItem, type ColorId, type ObjectId } from './types'

export const CATALOG = WISPWISE_THEME.objects satisfies readonly CatalogItem[]
export const SEVEN_OBJECT_CATALOG = WISPWISE_SEVEN_OBJECT_THEME.objects satisfies readonly CatalogItem[]

export function validateCatalog(
  catalog: readonly CatalogItem[],
  theme: ThemeDefinition = WISPWISE_THEME,
): readonly CatalogItem[] {
  const expectedObjectIds = theme.objects.map(({ objectId }) => objectId)
  const expectedColorIds = theme.colors.map(({ colorId }) => colorId)
  const objectIds = new Set<string>(catalog.map((item) => item.objectId))
  const colorIds = new Set<string>(catalog.map((item) => item.fixedColorId))

  if (catalog.length !== expectedObjectIds.length || objectIds.size !== expectedObjectIds.length) {
    throw new Error('Catalog must contain every object exactly once')
  }

  if (colorIds.size !== expectedColorIds.length) {
    throw new Error('Catalog fixed colors must be unique')
  }

  for (const objectId of expectedObjectIds) {
    if (!objectIds.has(objectId)) {
      throw new Error(`Catalog is missing object: ${objectId}`)
    }
  }

  for (const colorId of expectedColorIds) {
    if (!colorIds.has(colorId)) {
      throw new Error(`Catalog is missing fixed color: ${colorId}`)
    }
  }

  return catalog
}

validateCatalog(CATALOG)
validateCatalog(SEVEN_OBJECT_CATALOG, WISPWISE_SEVEN_OBJECT_THEME)

const catalogByObject = new Map<ObjectId, CatalogItem>(
  SEVEN_OBJECT_CATALOG.map((item) => [item.objectId, item]),
)

export function catalogForObjectCount(objectCount: GameObjectCount): readonly CatalogItem[] {
  return themeForObjectCount(objectCount).objects as readonly CatalogItem[]
}

export function getCatalogItem(objectId: ObjectId): CatalogItem {
  const item = catalogByObject.get(objectId)

  if (!item) {
    throw new Error(`Unknown object: ${objectId}`)
  }

  return item
}

export function getFixedColor(objectId: ObjectId): ColorId {
  return getCatalogItem(objectId).fixedColorId
}
