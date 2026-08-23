import ghost from '@/assets/objects/ghost.png'
import chair from '@/assets/objects/chair.png'
import bottle from '@/assets/objects/bottle.png'
import book from '@/assets/objects/book.png'
import mouse from '@/assets/objects/mouse.png'
import pumpkin from '@/assets/objects/pumpkin-transparent.png'
import wizardHat from '@/assets/objects/wizard-hat-transparent.png'
import type { ObjectId } from '@/domain'

export const OBJECT_ASSETS: Readonly<Record<ObjectId, string>> = {
  ghost,
  chair,
  bottle,
  book,
  mouse,
  pumpkin,
  'wizard-hat': wizardHat,
}

export function preloadGameAssets(createImage: () => HTMLImageElement = () => new Image()): HTMLImageElement[] {
  return Object.values(OBJECT_ASSETS).map((source) => {
    const image = createImage()
    image.src = source
    return image
  })
}
