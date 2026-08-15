import type { CardId } from '@/domain'
import ghostWhiteChairBlue from '@/assets/cards/haunted-house/expansion-01/ghost-white_chair-blue.webp'
import ghostWhiteBottleBlue from '@/assets/cards/haunted-house/expansion-01/ghost-white_bottle-blue.webp'
import ghostWhiteBookGreen from '@/assets/cards/haunted-house/expansion-01/ghost-white_book-green.webp'
import ghostWhiteMouseGreen from '@/assets/cards/haunted-house/expansion-01/ghost-white_mouse-green.webp'
import chairRedBottleWhite from '@/assets/cards/haunted-house/expansion-01/chair-red_bottle-white.webp'
import chairWhiteBookBlue from '@/assets/cards/haunted-house/expansion-01/chair-white_book-blue.webp'
import chairWhiteMouseGray from '@/assets/cards/haunted-house/expansion-01/chair-white_mouse-gray.webp'
import bottleWhiteBookBlue from '@/assets/cards/haunted-house/expansion-01/bottle-white_book-blue.webp'
import bottleWhiteMouseGray from '@/assets/cards/haunted-house/expansion-01/bottle-white_mouse-gray.webp'
import bookWhiteMouseGray from '@/assets/cards/haunted-house/expansion-01/book-white_mouse-gray.webp'
import ghostGreenChairGray from '@/assets/cards/haunted-house/expansion-01/ghost-green_chair-gray.webp'
import ghostRedBottleGray from '@/assets/cards/haunted-house/expansion-01/ghost-red_bottle-gray.webp'
import ghostRedBookGray from '@/assets/cards/haunted-house/expansion-01/ghost-red_book-gray.webp'
import ghostRedMouseBlue from '@/assets/cards/haunted-house/expansion-01/ghost-red_mouse-blue.webp'
import chairWhiteBottleGray from '@/assets/cards/haunted-house/expansion-01/chair-white_bottle-gray.webp'
import chairWhiteBookGreen from '@/assets/cards/haunted-house/expansion-01/chair-white_book-green.webp'
import chairWhiteMouseGreen from '@/assets/cards/haunted-house/expansion-01/chair-white_mouse-green.webp'
import bottleWhiteBookRed from '@/assets/cards/haunted-house/expansion-01/bottle-white_book-red-v3.webp'
import bottleWhiteMouseRed from '@/assets/cards/haunted-house/expansion-01/bottle-white_mouse-red.webp'
import bookWhiteMouseRed from '@/assets/cards/haunted-house/expansion-01/book-white_mouse-red.webp'
import type { CardArtworkEntry } from './types'

function approvedEntry(
  cardId: CardId,
  id: string,
  imageUrl: string,
  alt: string,
): CardArtworkEntry {
  return {
    cardId,
    variants: [{ id, imageUrl, alt, status: 'approved' }],
  }
}

export const EXPANSION_01_ARTWORK_ENTRIES: readonly CardArtworkEntry[] = [
  approvedEntry('ghost:white|chair:blue' as CardId, 'expansion-01-11', ghostWhiteChairBlue, '白色鬼抱著藍色椅子的互動場景'),
  approvedEntry('ghost:white|bottle:blue' as CardId, 'expansion-01-12', ghostWhiteBottleBlue, '白色鬼平衡藍色瓶子的互動場景'),
  approvedEntry('ghost:white|book:green' as CardId, 'expansion-01-13', ghostWhiteBookGreen, '白色鬼從綠色書後探頭的互動場景'),
  approvedEntry('ghost:white|mouse:green' as CardId, 'expansion-01-14', ghostWhiteMouseGreen, '白色鬼追逐綠色老鼠的互動場景'),
  approvedEntry('chair:red|bottle:white' as CardId, 'expansion-01-15', chairRedBottleWhite, '紅色椅子依靠白色瓶子的互動場景'),
  approvedEntry('chair:white|book:blue' as CardId, 'expansion-01-16', chairWhiteBookBlue, '白色椅背夾著藍色書的互動場景'),
  approvedEntry('chair:white|mouse:gray' as CardId, 'expansion-01-17', chairWhiteMouseGray, '灰色老鼠站在白色椅背上的互動場景'),
  approvedEntry('bottle:white|book:blue' as CardId, 'expansion-01-18', bottleWhiteBookBlue, '白色瓶子躲在藍色書後的互動場景'),
  approvedEntry('bottle:white|mouse:gray' as CardId, 'expansion-01-19', bottleWhiteMouseGray, '灰色老鼠繞著白色瓶子奔跑的互動場景'),
  approvedEntry('book:white|mouse:gray' as CardId, 'expansion-01-20', bookWhiteMouseGray, '灰色老鼠依靠白色書的互動場景'),
  approvedEntry('ghost:green|chair:gray' as CardId, 'expansion-01-21', ghostGreenChairGray, '綠色鬼抱著灰色椅子的互動場景'),
  approvedEntry('ghost:red|bottle:gray' as CardId, 'expansion-01-22', ghostRedBottleGray, '紅色鬼平衡灰色瓶子的互動場景'),
  approvedEntry('ghost:red|book:gray' as CardId, 'expansion-01-23', ghostRedBookGray, '紅色鬼從灰色書後探頭的互動場景'),
  approvedEntry('ghost:red|mouse:blue' as CardId, 'expansion-01-24', ghostRedMouseBlue, '紅色鬼追逐藍色老鼠的互動場景'),
  approvedEntry('chair:white|bottle:gray' as CardId, 'expansion-01-25', chairWhiteBottleGray, '白色椅子依靠灰色瓶子的互動場景'),
  approvedEntry('chair:white|book:green' as CardId, 'expansion-01-26', chairWhiteBookGreen, '白色椅背夾著綠色書的互動場景'),
  approvedEntry('chair:white|mouse:green' as CardId, 'expansion-01-27', chairWhiteMouseGreen, '綠色老鼠站在白色椅背上的互動場景'),
  approvedEntry('bottle:white|book:red' as CardId, 'expansion-01-28', bottleWhiteBookRed, '純白色瓶子躲在紅色書後的互動場景'),
  approvedEntry('bottle:white|mouse:red' as CardId, 'expansion-01-29', bottleWhiteMouseRed, '紅色老鼠繞著白色瓶子奔跑的互動場景'),
  approvedEntry('book:white|mouse:red' as CardId, 'expansion-01-30', bookWhiteMouseRed, '紅色老鼠依靠白色書的互動場景'),
]
