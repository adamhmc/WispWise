export interface QuestionResult {
  readonly isCorrect: boolean
  readonly elapsedMs: number
}

export interface GameStats {
  readonly total: number
  readonly correct: number
  readonly incorrect: number
  readonly accuracy: number
  readonly averageCorrectTimeMs: number | null
}

export function calculateGameStats(results: readonly QuestionResult[]): GameStats {
  const correctResults = results.filter(({ isCorrect }) => isCorrect)
  const correctTimeTotal = correctResults.reduce((sum, result) => sum + result.elapsedMs, 0)

  return {
    total: results.length,
    correct: correctResults.length,
    incorrect: results.length - correctResults.length,
    accuracy: results.length === 0 ? 0 : correctResults.length / results.length,
    averageCorrectTimeMs:
      correctResults.length === 0 ? null : correctTimeTotal / correctResults.length,
  }
}
