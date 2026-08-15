import {
  buildCompleteDeck,
  getCatalogItem,
  WISPWISE_THEME,
  type CardObject,
  type LegalDeckCard,
} from '@/domain'
import { COLOR_PRESENTATION } from '@/ui/presentation'

const INTERACTIONS = [
  'the first object playfully holding the second object',
  'the first object balancing the second object',
  'the first object peeking from behind the second object',
  'the two objects playfully chasing each other',
  'the first object sitting beside and leaning on the second object',
] as const

function describe(subject: CardObject): string {
  return `${COLOR_PRESENTATION[subject.colorId].label}${getCatalogItem(subject.objectId).label}`
}

export interface CardArtworkSpec {
  readonly themeId: string
  readonly cardId: string
  readonly kind: 'direct' | 'exclusion'
  readonly answer: string
  readonly subjects: readonly [string, string]
  readonly referenceAssetKeys: readonly [string, string]
  readonly interaction: string
  readonly prompt: string
}

export const PILOT_ARTWORK_CARD_IDS = [
  'ghost:white|chair:green',
  'ghost:white|bottle:red',
  'ghost:white|book:red',
  'ghost:white|mouse:red',
  'chair:white|bottle:green',
  'ghost:green|chair:blue',
  'ghost:red|bottle:blue',
  'ghost:red|book:green',
  'ghost:red|mouse:green',
  'chair:white|bottle:blue',
] as const

function selectDifferentObjectPairs(
  cards: readonly LegalDeckCard[],
  count: number,
): LegalDeckCard[] {
  const selected: LegalDeckCard[] = []
  const pairs = new Set<string>()
  for (const candidate of cards) {
    const pair = [candidate.card.left.objectId, candidate.card.right.objectId].sort().join('|')
    if (pairs.has(pair)) continue
    pairs.add(pair)
    selected.push(candidate)
    if (selected.length === count) break
  }
  return selected
}

export function createPilotArtworkSpecs(
  legalDeck: readonly LegalDeckCard[] = buildCompleteDeck(WISPWISE_THEME).legal,
): CardArtworkSpec[] {
  const selected = [
    ...selectDifferentObjectPairs(
      legalDeck.filter(({ evaluation }) => evaluation.kind === 'direct'),
      5,
    ),
    ...selectDifferentObjectPairs(
      legalDeck.filter(({ evaluation }) => evaluation.kind === 'exclusion'),
      5,
    ),
  ]

  return createArtworkSpecs(selected)
}

export function createExpansionArtworkSpecs(
  legalDeck: readonly LegalDeckCard[] = buildCompleteDeck(WISPWISE_THEME).legal,
): CardArtworkSpec[] {
  const pilotCardIds = new Set<string>(PILOT_ARTWORK_CARD_IDS)
  const uncovered = legalDeck.filter(({ card }) => !pilotCardIds.has(card.id))
  const selected = [
    ...selectDifferentObjectPairs(
      uncovered.filter(({ evaluation }) => evaluation.kind === 'direct'),
      10,
    ),
    ...selectDifferentObjectPairs(
      uncovered.filter(({ evaluation }) => evaluation.kind === 'exclusion'),
      10,
    ),
  ]

  if (selected.length !== 20) {
    throw new Error('Artwork expansion requires ten direct and ten exclusion cards')
  }

  return createArtworkSpecs(selected, PILOT_ARTWORK_CARD_IDS.length)
}

export function createRemainingArtworkSpecs(
  legalDeck: readonly LegalDeckCard[] = buildCompleteDeck(WISPWISE_THEME).legal,
): CardArtworkSpec[] {
  const expansionIds = createExpansionArtworkSpecs(legalDeck).map(({ cardId }) => cardId)
  const coveredCardIds = new Set<string>([
    ...PILOT_ARTWORK_CARD_IDS,
    ...expansionIds,
  ])
  const remaining = legalDeck.filter(({ card }) => !coveredCardIds.has(card.id))

  if (remaining.length !== 90) {
    throw new Error('Remaining artwork batch requires exactly ninety uncovered cards')
  }

  return createArtworkSpecs(remaining, coveredCardIds.size)
}

function createArtworkSpecs(
  selected: readonly LegalDeckCard[],
  interactionOffset = 0,
): CardArtworkSpec[] {
  return selected.map(({ card, evaluation }, index) => {
    const left = describe(card.left)
    const right = describe(card.right)
    const leftPromptName = `${card.left.colorId} ${card.left.objectId}`
    const rightPromptName = `${card.right.colorId} ${card.right.objectId}`
    const referenceAssetKeys = [
      getCatalogItem(card.left.objectId).assetKey,
      getCatalogItem(card.right.objectId).assetKey,
    ] as const
    const interaction = INTERACTIONS[(index + interactionOffset) % INTERACTIONS.length]
    return {
      themeId: WISPWISE_THEME.id,
      cardId: card.id,
      kind: evaluation.kind,
      answer: evaluation.answer,
      subjects: [left, right],
      referenceAssetKeys,
      interaction,
      prompt: [
        'Use case: illustration-story.',
        'Asset type: portrait mobile game question-card artwork.',
        `Primary request: an original cute WispWise scene with exactly two primary game objects: one ${leftPromptName} and one ${rightPromptName}; ${interaction}.`,
        'Style/medium: polished original children’s game illustration, rounded expressive shapes, crisp dark-blue linework, gentle cel shading; do not imitate any existing commercial board-game artwork.',
        `Reference consistency: use the canonical theme assets ${referenceAssetKeys[0]} and ${referenceAssetKeys[1]} as visual references; retain each object’s defining silhouette, proportions, construction details, and outline style. Recolor and pose the objects, but do not redesign them.`,
        'Color separation: white objects must use neutral pure white (#ffffff) as the dominant fill with only minimal very-pale neutral shading; gray objects must use a clearly darker neutral gray (#667085). Never render white as cream, ivory, beige, cool gray, silver, smoky glass, or light gray; never render gray as pale gray or off-white; the difference must remain obvious at mobile thumbnail size.',
        'Scene/backdrop: simple low-contrast haunted-room setting in muted navy and warm cream, with no recognizable extra game objects.',
        'Composition/framing: portrait 4:5, both complete subjects large, separated and instantly readable on a phone.',
        `Constraints: the ${card.left.objectId} body must be unmistakably ${card.left.colorId}; the ${card.right.objectId} body must be unmistakably ${card.right.colorId}; exactly two game objects; preserve their canonical silhouettes; do not add faces or limbs to an object unless they appear in its canonical theme asset.`,
        'Avoid: chair, bottle, book, mouse, or ghost unless explicitly named above; no extra characters, no text, no numbers, no symbols, no watermark, no border.',
      ].join('\n'),
    }
  })
}
