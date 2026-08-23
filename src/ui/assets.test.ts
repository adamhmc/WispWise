import { OBJECT_ASSETS, preloadGameAssets } from './assets'

describe('game assets', () => {
  it('defines and preloads one asset for every object', () => {
    const images: Array<{ src: string }> = []
    const loaded = preloadGameAssets(() => {
      const image = { src: '' }
      images.push(image)
      return image as HTMLImageElement
    })

    expect(Object.keys(OBJECT_ASSETS)).toEqual([
      'ghost', 'chair', 'bottle', 'book', 'mouse', 'pumpkin', 'wizard-hat',
    ])
    expect(loaded).toHaveLength(7)
    expect(images.map(({ src }) => src)).toEqual(Object.values(OBJECT_ASSETS))
  })
})
