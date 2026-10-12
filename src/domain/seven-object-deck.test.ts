import { cardObjects } from './card'
import { SEVEN_OBJECT_CATALOG } from './catalog'
import { evaluateCard } from './evaluate-card'
import { SEVEN_OBJECT_DECK, SEVEN_OBJECT_QUESTION_SPECS } from './seven-object-deck'

describe('seven-object question deck', () => {
  it('contains unique three-object questions', () => {
    expect(SEVEN_OBJECT_DECK).toHaveLength(109)
    expect(new Set(SEVEN_OBJECT_DECK.map(({ card }) => card.id))).toHaveLength(109)
    expect(SEVEN_OBJECT_DECK.every(({ card }) => cardObjects(card).length === 3)).toBe(true)
  })

  it('excludes artwork whose visible objects or colors do not match the question', () => {
    const ids = new Set<string>(SEVEN_OBJECT_QUESTION_SPECS.map(({ id }) => id))
    for (const id of ['mixed-033', 'mixed-037', 'mixed-038', 'mixed-042', 'mixed-065']) {
      expect(ids.has(id)).toBe(false)
    }
  })

  it('keeps exactly one valid answer on every question', () => {
    SEVEN_OBJECT_DECK.forEach(({ card, evaluation }, index) => {
      expect(evaluateCard(card, SEVEN_OBJECT_CATALOG)).toEqual(evaluation)
      expect(evaluation.answer).toBe(SEVEN_OBJECT_QUESTION_SPECS[index].answer)
      expect(evaluation.answers).toEqual([SEVEN_OBJECT_QUESTION_SPECS[index].answer])
      expect(['direct', 'exclusion']).toContain(evaluation.kind)
    })
  })

  it('keeps the declared answer mapped to the computed direct or exclusion answer', () => {
    expect(SEVEN_OBJECT_QUESTION_SPECS.map((spec, index) => ({
      id: spec.id,
      declaredAnswer: spec.answer,
      computedAnswer: SEVEN_OBJECT_DECK[index].evaluation.answer,
      kind: SEVEN_OBJECT_DECK[index].evaluation.kind,
    }))).toEqual(SEVEN_OBJECT_QUESTION_SPECS.map((spec, index) => ({
      id: spec.id,
      declaredAnswer: spec.answer,
      computedAnswer: spec.answer,
      kind: SEVEN_OBJECT_DECK[index].evaluation.kind,
    })))
  })

  it('includes both expansion objects as correct answers', () => {
    const answers = SEVEN_OBJECT_DECK.map(({ evaluation }) => evaluation.answer)
    expect(answers).toContain('pumpkin')
    expect(answers).toContain('wizard-hat')
  })

  it('includes deletion-rule questions', () => {
    expect(SEVEN_OBJECT_DECK.filter(({ evaluation }) => evaluation.kind === 'exclusion')).toHaveLength(64)
  })

  it('adds twenty new questions that each require the exclusion rule', () => {
    const newQuestions = SEVEN_OBJECT_QUESTION_SPECS.filter(({ id }) => /^mixed-(?:09[6-9]|1(?:0\d|1[0-5]))$/.test(id))
    expect(newQuestions).toHaveLength(20)
    for (const spec of newQuestions) {
      const index = SEVEN_OBJECT_QUESTION_SPECS.indexOf(spec)
      expect(SEVEN_OBJECT_DECK[index].evaluation.kind).toBe('exclusion')
    }
  })

  it('adds twenty new questions with one direct color match', () => {
    const newQuestions = SEVEN_OBJECT_QUESTION_SPECS.filter(({ id }) => /^mixed-1(?:1[6-9]|2\d|3[0-5])$/.test(id))
    expect(newQuestions).toHaveLength(20)
    for (const spec of newQuestions) {
      const index = SEVEN_OBJECT_QUESTION_SPECS.indexOf(spec)
      expect(SEVEN_OBJECT_DECK[index].evaluation.kind).toBe('direct')
    }
  })
})
