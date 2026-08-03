import { CATALOG, getFixedColor, validateCatalog } from './catalog'
import { COLOR_IDS, OBJECT_IDS, type CatalogItem } from './types'

describe('catalog', () => {
  it('contains every object and fixed color exactly once', () => {
    expect(CATALOG.map(({ objectId }) => objectId)).toEqual(OBJECT_IDS)
    expect(new Set(CATALOG.map(({ fixedColorId }) => fixedColorId))).toEqual(new Set(COLOR_IDS))
  })

  it.each([
    ['ghost', 'white'],
    ['chair', 'red'],
    ['bottle', 'green'],
    ['book', 'blue'],
    ['mouse', 'gray'],
  ] as const)('maps %s to %s', (objectId, colorId) => {
    expect(getFixedColor(objectId)).toBe(colorId)
  })

  it('rejects a catalog with a duplicated object', () => {
    const invalid = [...CATALOG.slice(0, 4), CATALOG[0]]
    expect(() => validateCatalog(invalid)).toThrow('every object exactly once')
  })

  it('rejects a catalog with a duplicated fixed color', () => {
    const invalid: CatalogItem[] = CATALOG.map((item, index) =>
      index === 4 ? { ...item, fixedColorId: 'white' } : { ...item },
    )
    expect(() => validateCatalog(invalid)).toThrow('fixed colors must be unique')
  })

  it('rejects a catalog with missing entries', () => {
    expect(() => validateCatalog(CATALOG.slice(0, 4))).toThrow('every object exactly once')
  })
})
