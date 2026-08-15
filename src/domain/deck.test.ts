import { WISPWISE_THEME } from './theme'
import { buildCompleteDeck, generateCandidateCards } from './deck'

describe('complete deck generation', () => {
  it('generates 200 unique unordered candidate cards', () => {
    const candidates = generateCandidateCards()

    expect(candidates).toHaveLength(200)
    expect(new Set(candidates.map(({ id }) => id))).toHaveLength(200)
  })

  it('derives the candidate space from the supplied theme definition', () => {
    const threeObjectTheme = {
      colors: WISPWISE_THEME.colors.slice(0, 3),
      objects: WISPWISE_THEME.objects.slice(0, 3),
    }

    expect(generateCandidateCards(threeObjectTheme)).toHaveLength(18)
  })

  it('classifies the complete candidate space as 60 direct, 60 exclusion, 80 invalid', () => {
    const deck = buildCompleteDeck()
    const direct = deck.legal.filter(({ evaluation }) => evaluation.kind === 'direct')
    const exclusion = deck.legal.filter(({ evaluation }) => evaluation.kind === 'exclusion')

    expect(deck.candidates).toHaveLength(200)
    expect(deck.legal).toHaveLength(120)
    expect(direct).toHaveLength(60)
    expect(exclusion).toHaveLength(60)
    expect(deck.invalid).toHaveLength(80)
  })

  it('gives every legal card exactly one answer', () => {
    const { legal } = buildCompleteDeck()

    expect(legal.every(({ evaluation }) => evaluation.answers.length === 1)).toBe(true)
  })

  it('classifies every invalid card in the five-object deck as having multiple answers', () => {
    const { invalid } = buildCompleteDeck()

    expect(invalid.every(({ evaluation }) => evaluation.reason === 'multiple-answer')).toBe(true)
  })
})
