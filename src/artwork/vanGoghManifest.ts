import {
  buildCompleteDeck,
  SEVEN_OBJECT_DECK,
  SEVEN_OBJECT_QUESTION_SPECS,
  WISPWISE_SEVEN_OBJECT_THEME,
  WISPWISE_THEME,
  type CardId,
} from '@/domain'
import ghostWhiteChairGreen from '@/assets/cards/styles/van-gogh/ghost-white-chair-green.jpg'
import bottleGreenBookGray from '@/assets/cards/styles/van-gogh/bottle-green-book-gray.jpg'
import bottleRedMouseGray from '@/assets/cards/styles/van-gogh/bottle-red-mouse-gray.jpg'
import ghostGreenPumpkinRedWizardHatBlue from '@/assets/cards/styles/van-gogh/ghost-green-pumpkin-red-wizard-hat-blue.jpg'
import bookGrayMouseBluePumpkinYellow from '@/assets/cards/styles/van-gogh/book-gray-mouse-blue-pumpkin-yellow.jpg'
import { validateArtworkManifest, type CardArtworkEntry, type CardArtworkManifest } from './types'

const generatedSevenObjectImages = import.meta.glob<string>(
  '@/assets/cards/styles/van-gogh/seven-objects/*.jpg',
  { eager: true, import: 'default', query: '?url' },
)

export const VAN_GOGH_SEVEN_OBJECT_QUESTION_IDS = [
  'mixed-074', 'mixed-075', 'mixed-076', 'mixed-077', 'mixed-078',
  'mixed-079', 'mixed-080', 'mixed-081', 'mixed-082', 'mixed-083',
  'mixed-084', 'mixed-085', 'mixed-086', 'mixed-087', 'mixed-088',
  'mixed-089', 'mixed-090', 'mixed-091', 'mixed-092', 'mixed-094',
  'mixed-095', 'mixed-096', 'mixed-097', 'mixed-098', 'mixed-100',
  'mixed-116', 'mixed-117', 'mixed-118', 'mixed-119', 'mixed-120',
  'mixed-121', 'mixed-122', 'mixed-123', 'mixed-124', 'mixed-125',
  'mixed-126', 'mixed-127', 'mixed-128', 'mixed-129', 'mixed-130',
] as const

const bundledSevenObjectIds = new Set(['mixed-100', 'mixed-121'])
const objectLabels = new Map(WISPWISE_SEVEN_OBJECT_THEME.objects.map(({ objectId, label }) => [objectId, label]))
const colorLabels = new Map(WISPWISE_SEVEN_OBJECT_THEME.colors.map(({ colorId, label }) => [colorId, label]))

function generatedSevenObjectEntry(questionId: string): CardArtworkEntry {
  const questionIndex = SEVEN_OBJECT_QUESTION_SPECS.findIndex(({ id }) => id === questionId)
  if (questionIndex < 0) throw new Error(`Unknown Van Gogh question: ${questionId}`)

  const imageUrl = Object.entries(generatedSevenObjectImages)
    .find(([path]) => path.endsWith(`/${questionId}.jpg`))?.[1]
  if (!imageUrl) throw new Error(`Missing Van Gogh artwork: ${questionId}`)

  const description = SEVEN_OBJECT_QUESTION_SPECS[questionIndex].objects
    .map(({ objectId, colorId }) => `${colorLabels.get(colorId)}${objectLabels.get(objectId)}`)
    .join('、')

  return {
    cardId: SEVEN_OBJECT_DECK[questionIndex].card.id,
    variants: [{
      id: `van-gogh-${questionId}`,
      imageUrl,
      alt: `梵谷風格的${description}互動場景`,
      status: 'approved',
    }],
  }
}

const generatedSevenObjectEntries = VAN_GOGH_SEVEN_OBJECT_QUESTION_IDS
  .filter((id) => !bundledSevenObjectIds.has(id))
  .map(generatedSevenObjectEntry)

export const VAN_GOGH_FIVE_OBJECT_ARTWORK_MANIFEST = validateArtworkManifest({
  themeId: `${WISPWISE_THEME.id}-van-gogh`,
  version: 1,
  cards: [
    {
      cardId: 'ghost:white|chair:green' as CardId,
      variants: [{ id: 'van-gogh-01', imageUrl: ghostWhiteChairGreen, alt: '梵谷風格的白鬼推著綠椅子', status: 'approved' }],
    },
    {
      cardId: 'bottle:green|book:gray' as CardId,
      variants: [{ id: 'van-gogh-02', imageUrl: bottleGreenBookGray, alt: '梵谷風格的綠瓶子放在灰書上', status: 'approved' }],
    },
    {
      cardId: 'bottle:red|mouse:gray' as CardId,
      variants: [{ id: 'van-gogh-03', imageUrl: bottleRedMouseGray, alt: '梵谷風格的灰老鼠推著紅瓶子', status: 'approved' }],
    },
  ],
} satisfies CardArtworkManifest, buildCompleteDeck(WISPWISE_THEME).legal)

export const VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST = validateArtworkManifest({
  themeId: `${WISPWISE_SEVEN_OBJECT_THEME.id}-van-gogh`,
  version: 1,
  cards: [
    ...generatedSevenObjectEntries,
    {
      cardId: 'ghost:green|pumpkin:red|wizard-hat:blue' as CardId,
      variants: [{ id: 'van-gogh-04', imageUrl: ghostGreenPumpkinRedWizardHatBlue, alt: '梵谷風格的綠鬼抱著紅南瓜，旁邊放著藍巫師帽', status: 'approved' }],
    },
    {
      cardId: 'book:gray|mouse:blue|pumpkin:yellow' as CardId,
      variants: [{ id: 'van-gogh-05', imageUrl: bookGrayMouseBluePumpkinYellow, alt: '梵谷風格的黃南瓜放在灰書上，藍老鼠在旁觀察', status: 'approved' }],
    },
  ],
} satisfies CardArtworkManifest, SEVEN_OBJECT_DECK)
