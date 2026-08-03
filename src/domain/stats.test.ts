import { calculateGameStats } from './stats'

describe('game statistics', () => {
  it('returns empty-safe statistics', () => {
    expect(calculateGameStats([])).toEqual({
      total: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      averageCorrectTimeMs: null,
    })
  })

  it('calculates partial results and averages correct answers only', () => {
    expect(
      calculateGameStats([
        { isCorrect: true, elapsedMs: 1_000 },
        { isCorrect: false, elapsedMs: 500 },
        { isCorrect: true, elapsedMs: 3_000 },
      ]),
    ).toEqual({
      total: 3,
      correct: 2,
      incorrect: 1,
      accuracy: 2 / 3,
      averageCorrectTimeMs: 2_000,
    })
  })

  it('returns null average time when every answer is wrong', () => {
    expect(calculateGameStats([{ isCorrect: false, elapsedMs: 900 }])).toMatchObject({
      correct: 0,
      incorrect: 1,
      averageCorrectTimeMs: null,
    })
  })
})
