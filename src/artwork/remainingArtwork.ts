import { getCatalogItem, WISPWISE_THEME, type CardId, type ColorId, type ObjectId } from '@/domain'
import type { CardArtworkEntry } from './types'

const imageModules = import.meta.glob<string>(
  '@/assets/cards/haunted-house/expansion-02/approved/*.webp',
  { eager: true, import: 'default', query: '?url' },
)

const objectIds = new Set<string>(WISPWISE_THEME.objects.map(({ objectId }) => objectId))
const colorIds = new Set<string>(WISPWISE_THEME.colors.map(({ colorId }) => colorId))
const colorLabels = new Map<string, string>(WISPWISE_THEME.colors.map(({ colorId, label }) => [colorId, label]))

function parseSubject(value: string): { objectId: ObjectId; colorId: ColorId } {
  const [objectId, colorId, ...extra] = value.split('-')
  if (extra.length > 0 || !objectIds.has(objectId) || !colorIds.has(colorId)) {
    throw new Error(`Invalid generated artwork filename subject: ${value}`)
  }
  return { objectId: objectId as ObjectId, colorId: colorId as ColorId }
}

function entryFromModule(path: string, imageUrl: string): CardArtworkEntry {
  const filename = path.split('/').at(-1)?.replace(/\.webp$/, '')
  const subjects = filename?.split('_')
  if (!filename || subjects?.length !== 2) {
    throw new Error(`Invalid generated artwork filename: ${path}`)
  }

  const left = parseSubject(subjects[0])
  const right = parseSubject(subjects[1])
  return {
    cardId: `${left.objectId}:${left.colorId}|${right.objectId}:${right.colorId}` as CardId,
    variants: [{
      id: `expansion-02-${filename}`,
      imageUrl,
      alt: `${colorLabels.get(left.colorId)}${getCatalogItem(left.objectId).label}與${colorLabels.get(right.colorId)}${getCatalogItem(right.objectId).label}的互動場景`,
      status: 'approved',
    }],
  }
}

export const REMAINING_ARTWORK_ENTRIES: readonly CardArtworkEntry[] = Object.entries(imageModules)
  .map(([path, imageUrl]) => entryFromModule(path, imageUrl))
  .sort((left, right) => left.cardId.localeCompare(right.cardId))
