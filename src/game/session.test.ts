import { createGameSession } from './session'

describe('game session creation', () => {
  const random = { next: () => 0.25 }

  it('creates a serializable 10-question session with a 5/5 split', () => {
    const session = createGameSession({ id: 'session-1', explanationsEnabled: true, random })

    expect(session.questions).toHaveLength(10)
    expect(session.mode).toBe('classic')
    expect(session.objectCount).toBe(5)
    expect(session.questions.filter(({ evaluation }) => evaluation.kind === 'direct')).toHaveLength(5)
    expect(session.questions.filter(({ evaluation }) => evaluation.kind === 'exclusion')).toHaveLength(5)
    expect(new Set(session.questions.map(({ card }) => card.id))).toHaveLength(10)
    expect(session.records).toEqual([])
    expect(() => JSON.stringify(session)).not.toThrow()
  })

  it('creates a 10-question session from the legal seven-object deck', () => {
    const session = createGameSession({
      id: 'seven-session',
      objectCount: 7,
      explanationsEnabled: true,
      random,
    })

    expect(session.objectCount).toBe(7)
    expect(session.questions).toHaveLength(10)
    expect(session.questions.every(({ card, evaluation }) =>
      card.third
      && evaluation.answers.length === 1
      && ['direct', 'exclusion'].includes(evaluation.kind),
    )).toBe(true)
    expect(new Set(session.questions.map(({ card }) => card.id))).toHaveLength(10)
  })

  it('creates a 60-second session from the full legal deck and disables manual explanations', () => {
    const session = createGameSession({
      id: 'timed-session',
      mode: 'timed',
      explanationsEnabled: true,
      random,
    })
    expect(session.mode).toBe('timed')
    expect(session.questions.length).toBeGreaterThan(10)
    expect(session.explanationsEnabled).toBe(false)
  })

  it('preserves the explanation preference in the session', () => {
    expect(
      createGameSession({ id: 'session-2', explanationsEnabled: false, random })
        .explanationsEnabled,
    ).toBe(false)
  })
})
