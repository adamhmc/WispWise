import { createCard } from './card'
import { evaluateCard, findDirectMatches, findExclusionCandidates } from './evaluate-card'

describe('card evaluation', () => {
  it('finds the single correctly colored object (AC-01)', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'white' },
      { objectId: 'bottle', colorId: 'blue' },
    )

    expect(findDirectMatches(card)).toEqual(['ghost'])
    expect(evaluateCard(card)).toEqual({ kind: 'direct', answer: 'ghost', answers: ['ghost'] })
  })

  it('finds the exclusion answer when no displayed object has its fixed color (AC-02)', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'blue' },
      { objectId: 'bottle', colorId: 'red' },
    )

    expect(findDirectMatches(card)).toEqual([])
    expect(findExclusionCandidates(card)).toEqual(['mouse'])
    expect(evaluateCard(card)).toEqual({ kind: 'exclusion', answer: 'mouse', answers: ['mouse'] })
  })

  it('distinguishes gray-book and white-book exclusion answers', () => {
    const grayBook = createCard(
      { objectId: 'bottle', colorId: 'red' },
      { objectId: 'book', colorId: 'gray' },
    )
    const whiteBook = createCard(
      { objectId: 'bottle', colorId: 'red' },
      { objectId: 'book', colorId: 'white' },
    )

    expect(evaluateCard(grayBook)).toEqual({
      kind: 'exclusion',
      answer: 'ghost',
      answers: ['ghost'],
    })
    expect(evaluateCard(whiteBook)).toEqual({
      kind: 'exclusion',
      answer: 'mouse',
      answers: ['mouse'],
    })
  })

  it('rejects a card with two direct answers (AC-03)', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'white' },
      { objectId: 'chair', colorId: 'red' },
    )

    expect(evaluateCard(card)).toEqual({
      kind: 'invalid',
      reason: 'multiple-answer',
      answers: ['ghost', 'chair'],
    })
  })

  it('rejects a card with multiple exclusion answers', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'red' },
      { objectId: 'chair', colorId: 'white' },
    )

    expect(evaluateCard(card)).toMatchObject({
      kind: 'invalid',
      reason: 'multiple-answer',
      answers: ['bottle', 'book', 'mouse'],
    })
  })

})
