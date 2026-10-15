import { SEVEN_OBJECT_DECK, SEVEN_OBJECT_QUESTION_SPECS } from '@/domain'
import {
  VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST,
  VAN_GOGH_SEVEN_OBJECT_QUESTION_IDS,
} from './vanGoghManifest'

describe('Van Gogh seven-object artwork manifest', () => {
  it('contains 40 approved cards split into 25 exclusion and 15 direct questions', () => {
    expect(VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST.cards).toHaveLength(40)
    expect(new Set(VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST.cards.map(({ cardId }) => cardId))).toHaveLength(40)
    expect(VAN_GOGH_SEVEN_OBJECT_ARTWORK_MANIFEST.cards.every(({ variants }) =>
      variants.length === 1
      && variants[0].status === 'approved'
      && /\.(jpg|png)$/.test(variants[0].imageUrl),
    )).toBe(true)

    const kinds = VAN_GOGH_SEVEN_OBJECT_QUESTION_IDS.map((questionId) => {
      const index = SEVEN_OBJECT_QUESTION_SPECS.findIndex(({ id }) => id === questionId)
      return SEVEN_OBJECT_DECK[index].evaluation.kind
    })
    expect(kinds.filter((kind) => kind === 'exclusion')).toHaveLength(25)
    expect(kinds.filter((kind) => kind === 'direct')).toHaveLength(15)
  })
})
