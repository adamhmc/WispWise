import { cardObjects } from './card'
import { SEVEN_OBJECT_CATALOG } from './catalog'
import { evaluateCard } from './evaluate-card'
import { SEVEN_OBJECT_DECK, SEVEN_OBJECT_QUESTION_SPECS } from './seven-object-deck'

describe('seven-object question deck', () => {
  it('contains unique three-object questions', () => {
    expect(SEVEN_OBJECT_DECK).toHaveLength(74)
    expect(new Set(SEVEN_OBJECT_DECK.map(({ card }) => card.id))).toHaveLength(74)
    expect(SEVEN_OBJECT_DECK.every(({ card }) => cardObjects(card).length === 3)).toBe(true)
  })

  it('keeps exactly one valid answer on every question', () => {
    SEVEN_OBJECT_DECK.forEach(({ card, evaluation }, index) => {
      expect(evaluateCard(card, SEVEN_OBJECT_CATALOG)).toEqual(evaluation)
      expect(evaluation.answer).toBe(SEVEN_OBJECT_QUESTION_SPECS[index].answer)
      expect(evaluation.answers).toEqual([SEVEN_OBJECT_QUESTION_SPECS[index].answer])
      expect(['direct', 'exclusion']).toContain(evaluation.kind)
    })
  })

  it('includes both expansion objects as correct answers', () => {
    const answers = SEVEN_OBJECT_DECK.map(({ evaluation }) => evaluation.answer)
    expect(answers).toContain('pumpkin')
    expect(answers).toContain('wizard-hat')
  })

  it('includes deletion-rule questions', () => {
    expect(SEVEN_OBJECT_DECK.filter(({ evaluation }) => evaluation.kind === 'exclusion')).toHaveLength(47)
  })
})
