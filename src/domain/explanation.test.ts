import { createCard } from './card'
import { evaluateCard } from './evaluate-card'
import { createAnswerExplanation } from './explanation'

describe('answer explanations', () => {
  it('describes the direct matching object and color', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'white' },
      { objectId: 'bottle', colorId: 'blue' },
    )
    const evaluation = evaluateCard(card)
    if (evaluation.kind === 'invalid') throw new Error('Expected a legal card')

    expect(createAnswerExplanation(card, evaluation)).toEqual({
      kind: 'direct',
      answer: 'ghost',
      matchedColor: 'white',
    })
  })

  it('describes the shown objects and colors used for exclusion', () => {
    const card = createCard(
      { objectId: 'ghost', colorId: 'blue' },
      { objectId: 'bottle', colorId: 'red' },
    )
    const evaluation = evaluateCard(card)
    if (evaluation.kind === 'invalid') throw new Error('Expected a legal card')

    expect(createAnswerExplanation(card, evaluation)).toEqual({
      kind: 'exclusion',
      answer: 'mouse',
      shownObjects: ['ghost', 'bottle'],
      shownColors: ['blue', 'red'],
    })
  })
})
