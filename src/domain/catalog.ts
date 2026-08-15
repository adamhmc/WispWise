import { WISPWISE_THEME } from './theme'
import { COLOR_IDS, OBJECT_IDS, type CatalogItem, type ColorId, type ObjectId } from './types'

export const CATALOG = WISPWISE_THEME.objects satisfies readonly CatalogItem[]

export function validateCatalog(catalog: readonly CatalogItem[]): readonly CatalogItem[] {
  const objectIds = new Set(catalog.map((item) => item.objectId))
  const colorIds = new Set(catalog.map((item) => item.fixedColorId))

  if (catalog.length !== OBJECT_IDS.length || objectIds.size !== OBJECT_IDS.length) {
    throw new Error('Catalog must contain every object exactly once')
  }

  if (colorIds.size !== COLOR_IDS.length) {
    throw new Error('Catalog fixed colors must be unique')
  }

  for (const objectId of OBJECT_IDS) {
    if (!objectIds.has(objectId)) {
      throw new Error(`Catalog is missing object: ${objectId}`)
    }
  }

  for (const colorId of COLOR_IDS) {
    if (!colorIds.has(colorId)) {
      throw new Error(`Catalog is missing fixed color: ${colorId}`)
    }
  }

  return catalog
}

validateCatalog(CATALOG)

const catalogByObject = new Map<ObjectId, CatalogItem>(
  CATALOG.map((item) => [item.objectId, item]),
)

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
