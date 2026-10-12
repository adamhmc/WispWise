import type { CardId, ObjectId, ValidCardKind } from '@/domain'
import type { CardArtworkVariant } from './types'
import v01 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-01.jpg'
import v02 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-02.jpg'
import v03 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-03.jpg'
import v04 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-04.jpg'
import v05 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-05.jpg'
import v06 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-06.jpg'
import v07 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-07.jpg'
import v08 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-08.jpg'
import v09 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-09.jpg'
import v10 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-10.jpg'
import v11 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-11.jpg'
import v12 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-12.jpg'
import v13 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-13.jpg'
import v14 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-14.jpg'
import v15 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-15.jpg'
import v16 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-16.jpg'
import v17 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-17.jpg'
import v18 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-18.jpg'
import v19 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-19.jpg'
import v20 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-20.jpg'
import v21 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-21.jpg'
import v22 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-22.jpg'
import v23 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-23.jpg'
import v24 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-24.jpg'
import v25 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-25.jpg'
import v26 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-26.jpg'
import v27 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-27.jpg'
import v28 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-28.jpg'
import v29 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-29.jpg'
import v30 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-30.jpg'
import v31 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-31.jpg'
import v32 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-32.jpg'
import v33 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-33.jpg'
import v34 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-34.jpg'
import v35 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-35.jpg'
import v36 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-36.jpg'
import v37 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-37.jpg'
import v38 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-38.jpg'
import v39 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-39.jpg'
import v40 from '@/assets/cards/haunted-house/five-object-variants-2026-10/variant-40.jpg'

interface FiveObjectVariantSpec {
  readonly cardId: CardId
  readonly kind: ValidCardKind
  readonly answer: ObjectId
  readonly variant: CardArtworkVariant
}

// Each asset is a new scene for an existing legal card, never a new logical card.
export const FIVE_OBJECT_VARIANT_SPECS = [
  { cardId: 'chair:green|mouse:blue' as CardId, kind: 'exclusion', answer: 'ghost', variant: { id: 'five-2026-10-01', imageUrl: v01, alt: '綠椅子與藍老鼠：藍老鼠爬上綠椅子的椅背，尾巴繞過椅腳。', status: 'approved' } },
  { cardId: 'bottle:white|book:gray' as CardId, kind: 'exclusion', answer: 'chair', variant: { id: 'five-2026-10-02', imageUrl: v02, alt: '白瓶子與灰書：白瓶子立在灰書的封面上，書微微傾斜。', status: 'approved' } },
  { cardId: 'book:white|mouse:red' as CardId, kind: 'exclusion', answer: 'bottle', variant: { id: 'five-2026-10-03', imageUrl: v03, alt: '白書與紅老鼠：紅老鼠從白書的書頁旁探頭。', status: 'approved' } },
  { cardId: 'ghost:red|mouse:green' as CardId, kind: 'exclusion', answer: 'book', variant: { id: 'five-2026-10-04', imageUrl: v04, alt: '紅鬼與綠老鼠：紅鬼托起綠老鼠，兩者面對面。', status: 'approved' } },
  { cardId: 'ghost:green|chair:blue' as CardId, kind: 'exclusion', answer: 'mouse', variant: { id: 'five-2026-10-05', imageUrl: v05, alt: '綠鬼與藍椅子：綠鬼從藍椅子背後探頭，扶著椅背。', status: 'approved' } },
  { cardId: 'chair:blue|bottle:gray' as CardId, kind: 'exclusion', answer: 'ghost', variant: { id: 'five-2026-10-06', imageUrl: v06, alt: '藍椅子與灰瓶子：灰瓶子穩穩放在藍椅面上。', status: 'approved' } },
  { cardId: 'ghost:blue|bottle:gray' as CardId, kind: 'exclusion', answer: 'chair', variant: { id: 'five-2026-10-07', imageUrl: v07, alt: '藍鬼與灰瓶子：藍鬼繞著灰瓶子，雙手扶住瓶身。', status: 'approved' } },
  { cardId: 'chair:white|book:gray' as CardId, kind: 'exclusion', answer: 'bottle', variant: { id: 'five-2026-10-08', imageUrl: v08, alt: '白椅子與灰書：灰書斜放在白椅面上。', status: 'approved' } },
  { cardId: 'bottle:white|mouse:red' as CardId, kind: 'exclusion', answer: 'book', variant: { id: 'five-2026-10-09', imageUrl: v09, alt: '白瓶子與紅老鼠：紅老鼠推著白瓶子往前走。', status: 'approved' } },
  { cardId: 'ghost:red|book:green' as CardId, kind: 'exclusion', answer: 'mouse', variant: { id: 'five-2026-10-10', imageUrl: v10, alt: '紅鬼與綠書：紅鬼抱著綠書，像正在閱讀。', status: 'approved' } },
  { cardId: 'chair:blue|mouse:green' as CardId, kind: 'exclusion', answer: 'ghost', variant: { id: 'five-2026-10-11', imageUrl: v11, alt: '藍椅子與綠老鼠：綠老鼠沿藍椅子的橫桿攀爬。', status: 'approved' } },
  { cardId: 'bottle:gray|book:white' as CardId, kind: 'exclusion', answer: 'chair', variant: { id: 'five-2026-10-12', imageUrl: v12, alt: '灰瓶子與白書：灰瓶子靠在白書旁，書封面清楚可見。', status: 'approved' } },
  { cardId: 'book:red|mouse:white' as CardId, kind: 'exclusion', answer: 'bottle', variant: { id: 'five-2026-10-13', imageUrl: v13, alt: '紅書與白老鼠：白老鼠跳過紅書的一角。', status: 'approved' } },
  { cardId: 'ghost:green|mouse:red' as CardId, kind: 'exclusion', answer: 'book', variant: { id: 'five-2026-10-14', imageUrl: v14, alt: '綠鬼與紅老鼠：綠鬼伸手指向紅老鼠，老鼠抬頭回望。', status: 'approved' } },
  { cardId: 'ghost:blue|chair:green' as CardId, kind: 'exclusion', answer: 'mouse', variant: { id: 'five-2026-10-15', imageUrl: v15, alt: '藍鬼與綠椅子：藍鬼舉起綠椅子，動作輕巧。', status: 'approved' } },
  { cardId: 'chair:gray|bottle:blue' as CardId, kind: 'exclusion', answer: 'ghost', variant: { id: 'five-2026-10-16', imageUrl: v16, alt: '灰椅子與藍瓶子：藍瓶子置於灰椅子上，椅腳完整可辨。', status: 'approved' } },
  { cardId: 'ghost:gray|bottle:blue' as CardId, kind: 'exclusion', answer: 'chair', variant: { id: 'five-2026-10-17', imageUrl: v17, alt: '灰鬼與藍瓶子：灰鬼躲在藍瓶子後，露出臉與手。', status: 'approved' } },
  { cardId: 'chair:gray|book:white' as CardId, kind: 'exclusion', answer: 'bottle', variant: { id: 'five-2026-10-18', imageUrl: v18, alt: '灰椅子與白書：白書靠在灰椅子的椅背上。', status: 'approved' } },
  { cardId: 'bottle:red|mouse:white' as CardId, kind: 'exclusion', answer: 'book', variant: { id: 'five-2026-10-19', imageUrl: v19, alt: '紅瓶子與白老鼠：白老鼠坐在紅瓶子旁，抬頭看瓶塞。', status: 'approved' } },
  { cardId: 'ghost:green|book:red' as CardId, kind: 'exclusion', answer: 'mouse', variant: { id: 'five-2026-10-20', imageUrl: v20, alt: '綠鬼與紅書：綠鬼把紅書托在掌心。', status: 'approved' } },
  { cardId: 'ghost:white|chair:green' as CardId, kind: 'direct', answer: 'ghost', variant: { id: 'five-2026-10-21', imageUrl: v21, alt: '白鬼與綠椅子：白鬼推著綠椅子，椅子向前傾。', status: 'approved' } },
  { cardId: 'chair:red|bottle:gray' as CardId, kind: 'direct', answer: 'chair', variant: { id: 'five-2026-10-22', imageUrl: v22, alt: '紅椅子與灰瓶子：灰瓶子端坐在紅椅面上，椅背微微後仰。', status: 'approved' } },
  { cardId: 'ghost:blue|bottle:green' as CardId, kind: 'direct', answer: 'bottle', variant: { id: 'five-2026-10-23', imageUrl: v23, alt: '藍鬼與綠瓶子：藍鬼抱住綠瓶子，瓶子呈圓肚細頸。', status: 'approved' } },
  { cardId: 'ghost:red|book:blue' as CardId, kind: 'direct', answer: 'book', variant: { id: 'five-2026-10-24', imageUrl: v24, alt: '紅鬼與藍書：紅鬼捧著藍書，露出完整笑臉。', status: 'approved' } },
  { cardId: 'book:white|mouse:gray' as CardId, kind: 'direct', answer: 'mouse', variant: { id: 'five-2026-10-25', imageUrl: v25, alt: '白書與灰老鼠：灰老鼠坐在白書上，書封面清晰。', status: 'approved' } },
  { cardId: 'ghost:white|mouse:green' as CardId, kind: 'direct', answer: 'ghost', variant: { id: 'five-2026-10-26', imageUrl: v26, alt: '白鬼與綠老鼠：白鬼追著綠老鼠，老鼠回頭張望。', status: 'approved' } },
  { cardId: 'chair:red|mouse:blue' as CardId, kind: 'direct', answer: 'chair', variant: { id: 'five-2026-10-27', imageUrl: v27, alt: '紅椅子與藍老鼠：藍老鼠鑽過紅椅子的椅腳。', status: 'approved' } },
  { cardId: 'bottle:green|book:gray' as CardId, kind: 'direct', answer: 'bottle', variant: { id: 'five-2026-10-28', imageUrl: v28, alt: '綠瓶子與灰書：綠瓶子壓在灰書的封面一角。', status: 'approved' } },
  { cardId: 'chair:gray|book:blue' as CardId, kind: 'direct', answer: 'book', variant: { id: 'five-2026-10-29', imageUrl: v29, alt: '灰椅子與藍書：藍書放在灰椅子上，斜靠椅背。', status: 'approved' } },
  { cardId: 'bottle:red|mouse:gray' as CardId, kind: 'direct', answer: 'mouse', variant: { id: 'five-2026-10-30', imageUrl: v30, alt: '紅瓶子與灰老鼠：灰老鼠用前腳輕推紅瓶子。', status: 'approved' } },
  { cardId: 'ghost:white|book:red' as CardId, kind: 'direct', answer: 'ghost', variant: { id: 'five-2026-10-31', imageUrl: v31, alt: '白鬼與紅書：白鬼從紅書後探頭，書保持完整。', status: 'approved' } },
  { cardId: 'chair:red|bottle:blue' as CardId, kind: 'direct', answer: 'chair', variant: { id: 'five-2026-10-32', imageUrl: v32, alt: '紅椅子與藍瓶子：紅椅子旁放著藍瓶子，瓶子靠著椅腳。', status: 'approved' } },
  { cardId: 'bottle:green|mouse:white' as CardId, kind: 'direct', answer: 'bottle', variant: { id: 'five-2026-10-33', imageUrl: v33, alt: '綠瓶子與白老鼠：白老鼠伸手碰綠瓶子的瓶塞。', status: 'approved' } },
  { cardId: 'bottle:gray|book:blue' as CardId, kind: 'direct', answer: 'book', variant: { id: 'five-2026-10-34', imageUrl: v34, alt: '灰瓶子與藍書：灰瓶子平穩地站在藍書上。', status: 'approved' } },
  { cardId: 'book:green|mouse:gray' as CardId, kind: 'direct', answer: 'mouse', variant: { id: 'five-2026-10-35', imageUrl: v35, alt: '綠書與灰老鼠：灰老鼠沿綠書的書脊攀爬。', status: 'approved' } },
  { cardId: 'ghost:white|bottle:red' as CardId, kind: 'direct', answer: 'ghost', variant: { id: 'five-2026-10-36', imageUrl: v36, alt: '白鬼與紅瓶子：白鬼頂著紅瓶子，瓶子輪廓完整。', status: 'approved' } },
  { cardId: 'chair:red|book:white' as CardId, kind: 'direct', answer: 'chair', variant: { id: 'five-2026-10-37', imageUrl: v37, alt: '紅椅子與白書：白書放在紅椅面上，書角露出椅座。', status: 'approved' } },
  { cardId: 'chair:blue|bottle:green' as CardId, kind: 'direct', answer: 'bottle', variant: { id: 'five-2026-10-38', imageUrl: v38, alt: '藍椅子與綠瓶子：藍椅子旁的綠瓶子微微傾斜但沒有倒。', status: 'approved' } },
  { cardId: 'ghost:gray|book:blue' as CardId, kind: 'direct', answer: 'book', variant: { id: 'five-2026-10-39', imageUrl: v39, alt: '灰鬼與藍書：灰鬼抱著藍書，保留清晰五官。', status: 'approved' } },
  { cardId: 'ghost:green|mouse:gray' as CardId, kind: 'direct', answer: 'mouse', variant: { id: 'five-2026-10-40', imageUrl: v40, alt: '綠鬼與灰老鼠：綠鬼與灰老鼠相互揮手。', status: 'approved' } },
] as const satisfies readonly FiveObjectVariantSpec[]
