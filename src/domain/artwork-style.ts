export const ARTWORK_STYLES = ['classic', 'van-gogh'] as const

export type ArtworkStyle = (typeof ARTWORK_STYLES)[number]

export const DEFAULT_ARTWORK_STYLE: ArtworkStyle = 'classic'

export function isArtworkStyle(value: unknown): value is ArtworkStyle {
  return typeof value === 'string' && (ARTWORK_STYLES as readonly string[]).includes(value)
}
