import { buildCompleteDeck, WISPWISE_THEME, type CardId } from '@/domain'
import ghostWhiteChairGreen from '@/assets/cards/haunted-house/pilot/ghost-white_chair-green.webp'
import ghostWhiteBottleRed from '@/assets/cards/haunted-house/pilot/ghost-white_bottle-red-v2.webp'
import ghostWhiteBookRed from '@/assets/cards/haunted-house/pilot/ghost-white_book-red.webp'
import ghostWhiteMouseRed from '@/assets/cards/haunted-house/pilot/ghost-white_mouse-red.webp'
import chairWhiteBottleGreen from '@/assets/cards/haunted-house/pilot/chair-white_bottle-green-v3.webp'
import ghostGreenChairBlue from '@/assets/cards/haunted-house/pilot/ghost-green_chair-blue.webp'
import ghostRedBottleBlue from '@/assets/cards/haunted-house/pilot/ghost-red_bottle-blue-v2.webp'
import ghostRedBookGreen from '@/assets/cards/haunted-house/pilot/ghost-red_book-green.webp'
import ghostRedMouseGreen from '@/assets/cards/haunted-house/pilot/ghost-red_mouse-green.webp'
import chairWhiteBottleBlue from '@/assets/cards/haunted-house/pilot/chair-white_bottle-blue-v3.webp'
import { EXPANSION_01_ARTWORK_ENTRIES } from './expansion01'
import { REMAINING_ARTWORK_ENTRIES } from './remainingArtwork'
import { validateArtworkManifest, type CardArtworkManifest } from './types'

export const CARD_ARTWORK_MANIFEST = validateArtworkManifest({
  themeId: WISPWISE_THEME.id,
  version: 3,
  cards: [
    {
      cardId: 'ghost:white|chair:green' as CardId,
      variants: [{ id: 'pilot-01', imageUrl: ghostWhiteChairGreen, alt: '白色鬼舉起綠色椅子的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:white|bottle:red' as CardId,
      variants: [{ id: 'pilot-02', imageUrl: ghostWhiteBottleRed, alt: '白色鬼頂著紅色瓶子的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:white|book:red' as CardId,
      variants: [{ id: 'pilot-03', imageUrl: ghostWhiteBookRed, alt: '白色鬼躲在紅色書後的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:white|mouse:red' as CardId,
      variants: [{ id: 'pilot-04', imageUrl: ghostWhiteMouseRed, alt: '白色鬼追逐紅色老鼠的互動場景', status: 'approved' }],
    },
    {
      cardId: 'chair:white|bottle:green' as CardId,
      variants: [{ id: 'pilot-05', imageUrl: chairWhiteBottleGreen, alt: '白色椅子依靠綠色瓶子的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:green|chair:blue' as CardId,
      variants: [{ id: 'pilot-06', imageUrl: ghostGreenChairBlue, alt: '綠色鬼舉起藍色椅子的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:red|bottle:blue' as CardId,
      variants: [{ id: 'pilot-07', imageUrl: ghostRedBottleBlue, alt: '紅色鬼頂著藍色瓶子的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:red|book:green' as CardId,
      variants: [{ id: 'pilot-08', imageUrl: ghostRedBookGreen, alt: '紅色鬼躲在綠色書後的互動場景', status: 'approved' }],
    },
    {
      cardId: 'ghost:red|mouse:green' as CardId,
      variants: [{ id: 'pilot-09', imageUrl: ghostRedMouseGreen, alt: '紅色鬼追逐綠色老鼠的互動場景', status: 'approved' }],
    },
    {
      cardId: 'chair:white|bottle:blue' as CardId,
      variants: [{ id: 'pilot-10', imageUrl: chairWhiteBottleBlue, alt: '白色椅子依靠藍色瓶子的互動場景', status: 'approved' }],
    },
    ...EXPANSION_01_ARTWORK_ENTRIES,
    ...REMAINING_ARTWORK_ENTRIES,
  ],
} satisfies CardArtworkManifest, buildCompleteDeck(WISPWISE_THEME).legal)
