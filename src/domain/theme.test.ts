import { describe, expect, it } from 'vitest'
import { validateThemeDefinition, WISPWISE_THEME } from './theme'

describe('theme definition', () => {
  it('keeps the current five object and color mappings in one definition', () => {
    expect(WISPWISE_THEME.objects.map(({ objectId, fixedColorId }) => [objectId, fixedColorId])).toEqual([
      ['ghost', 'white'],
      ['chair', 'red'],
      ['bottle', 'green'],
      ['book', 'blue'],
      ['mouse', 'gray'],
    ])
  })

  it('rejects themes with duplicate fixed colors', () => {
    expect(() => validateThemeDefinition({
      id: 'invalid',
      label: 'Invalid',
      colors: [
        { colorId: 'one', label: 'One', value: '#111' },
        { colorId: 'two', label: 'Two', value: '#222' },
        { colorId: 'three', label: 'Three', value: '#333' },
      ],
      objects: [
        { objectId: 'a', fixedColorId: 'one', label: 'A', assetKey: 'a' },
        { objectId: 'b', fixedColorId: 'one', label: 'B', assetKey: 'b' },
        { objectId: 'c', fixedColorId: 'three', label: 'C', assetKey: 'c' },
      ],
    })).toThrow('fixed colors must be unique')
  })
})
