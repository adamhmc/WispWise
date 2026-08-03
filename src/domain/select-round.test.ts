import { buildCompleteDeck } from './deck'
import { QUESTIONS_PER_KIND, ROUND_QUESTION_COUNT, selectRound } from './select-round'

describe('round selection', () => {
  it('selects a reproducible, unique 10-question round with a 5/5 split', () => {
    const { legal } = buildCompleteDeck()
    const first = selectRound(legal, () => 0.25)
    const second = selectRound(legal, () => 0.25)

    expect(first).toEqual(second)
    expect(first).toHaveLength(ROUND_QUESTION_COUNT)
    expect(new Set(first.map(({ card }) => card.id))).toHaveLength(ROUND_QUESTION_COUNT)
    expect(first.filter(({ evaluation }) => evaluation.kind === 'direct')).toHaveLength(
      QUESTIONS_PER_KIND,
    )
    expect(first.filter(({ evaluation }) => evaluation.kind === 'exclusion')).toHaveLength(
      QUESTIONS_PER_KIND,
    )
  })

  it('does not mutate the complete legal deck', () => {
    const { legal } = buildCompleteDeck()
    const idsBefore = legal.map(({ card }) => card.id)

    selectRound(legal, () => 0.5)

    expect(legal.map(({ card }) => card.id)).toEqual(idsBefore)
  })

  it('rejects a deck without enough questions of each kind', () => {
    const directOnly = buildCompleteDeck().legal.filter(
      ({ evaluation }) => evaluation.kind === 'direct',
    )

    expect(() => selectRound(directOnly, () => 0.5)).toThrow('enough questions of each kind')
  })
})
