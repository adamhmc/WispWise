import type { ObjectId } from '@/domain'
import { gameReducer } from './reducer'
import { createGameSession, type GameSession } from './session'
import { INITIAL_GAME_STATE, type GameState } from './state'

function session(explanationsEnabled = true, id = 'session-1'): GameSession {
  return createGameSession({ id, explanationsEnabled, random: { next: () => 0.25 } })
}

function startAnswering(gameSession = session(), nowMs = 1_000): GameState {
  const preparing = gameReducer(INITIAL_GAME_STATE, { type: 'START_GAME', session: gameSession })
  return gameReducer(preparing, { type: 'QUESTION_READY', nowMs })
}

function correctAnswer(state: GameState): ObjectId {
  if (state.status !== 'answering') throw new Error('Expected answering state')
  return state.session.questions[state.questionIndex].evaluation.answer
}

describe('game reducer', () => {
  it('supports home and tutorial transitions while ignoring illegal events', () => {
    const tutorial = gameReducer(INITIAL_GAME_STATE, { type: 'OPEN_TUTORIAL' })
    expect(tutorial).toEqual({ status: 'tutorial' })
    expect(gameReducer(tutorial, { type: 'QUESTION_READY', nowMs: 10 })).toBe(tutorial)
    expect(gameReducer(tutorial, { type: 'CLOSE_TUTORIAL' })).toEqual(INITIAL_GAME_STATE)
  })

  it('starts in preparing and only starts timing after QUESTION_READY', () => {
    const gameSession = session()
    const preparing = gameReducer(INITIAL_GAME_STATE, { type: 'START_GAME', session: gameSession })

    expect(preparing).toMatchObject({ status: 'preparing', questionIndex: 0 })
    expect(gameReducer(preparing, { type: 'SUBMIT_ANSWER', objectId: 'ghost', nowMs: 900 })).toBe(
      preparing,
    )
    expect(gameReducer(preparing, { type: 'QUESTION_READY', nowMs: 1_000 })).toMatchObject({
      status: 'answering',
      questionStartedAtMs: 1_000,
    })
  })

  it('records the first answer and ignores all later submissions (AC-04)', () => {
    const answering = startAnswering()
    const selectedAnswer = correctAnswer(answering)
    const feedback = gameReducer(answering, {
      type: 'SUBMIT_ANSWER',
      objectId: selectedAnswer,
      nowMs: 1_750,
    })

    expect(feedback).toMatchObject({
      status: 'feedback',
      answer: { selectedAnswer, elapsedMs: 750, isCorrect: true },
    })
    expect(
      gameReducer(feedback, { type: 'SUBMIT_ANSWER', objectId: 'mouse', nowMs: 1_800 }),
    ).toBe(feedback)
  })

  it('clamps elapsed time at zero if the injected clock goes backwards', () => {
    const answering = startAnswering()
    const feedback = gameReducer(answering, {
      type: 'SUBMIT_ANSWER',
      objectId: correctAnswer(answering),
      nowMs: 900,
    })

    expect(feedback).toMatchObject({ answer: { elapsedMs: 0 } })
  })

  it('uses manual next only when explanations are enabled', () => {
    const answering = startAnswering(session(true))
    const feedback = gameReducer(answering, {
      type: 'SUBMIT_ANSWER',
      objectId: correctAnswer(answering),
      nowMs: 1_200,
    })

    expect(gameReducer(feedback, { type: 'AUTO_ADVANCE' })).toBe(feedback)
    expect(gameReducer(feedback, { type: 'NEXT_QUESTION' })).toMatchObject({
      status: 'preparing',
      questionIndex: 1,
    })
  })

  it('uses automatic advance only when explanations are disabled', () => {
    const answering = startAnswering(session(false))
    const feedback = gameReducer(answering, {
      type: 'SUBMIT_ANSWER',
      objectId: correctAnswer(answering),
      nowMs: 1_200,
    })

    expect(gameReducer(feedback, { type: 'NEXT_QUESTION' })).toBe(feedback)
    expect(gameReducer(feedback, { type: 'AUTO_ADVANCE' })).toMatchObject({
      status: 'preparing',
      questionIndex: 1,
    })
  })

  it('finishes 10 questions with statistics matching all records (AC-06)', () => {
    let state: GameState = gameReducer(INITIAL_GAME_STATE, {
      type: 'START_GAME',
      session: session(true),
    })

    for (let index = 0; index < 10; index += 1) {
      state = gameReducer(state, { type: 'QUESTION_READY', nowMs: index * 1_000 })
      state = gameReducer(state, {
        type: 'SUBMIT_ANSWER',
        objectId: index === 0 ? 'ghost' : correctAnswer(state),
        nowMs: index * 1_000 + 500,
      })
      state = gameReducer(state, { type: 'NEXT_QUESTION' })
    }

    expect(state.status).toBe('results')
    if (state.status !== 'results') throw new Error('Expected results state')
    expect(state.stats.total).toBe(10)
    expect(state.stats.correct + state.stats.incorrect).toBe(10)
    expect(state.session.records).toHaveLength(10)
  })

  it('restarts with a clean session and exits without counting a partial question (AC-07)', () => {
    const answering = startAnswering()
    expect(gameReducer(answering, { type: 'EXIT_GAME' })).toEqual(INITIAL_GAME_STATE)

    const resultsState = {
      status: 'results',
      session: session(true, 'old'),
      stats: { total: 10, correct: 10, incorrect: 0, accuracy: 1, averageCorrectTimeMs: 500 },
    } as const
    const freshSession = session(true, 'new')

    expect(gameReducer(resultsState, { type: 'RESTART_GAME', session: freshSession })).toMatchObject({
      status: 'preparing',
      questionIndex: 0,
      session: { id: 'new', records: [] },
    })
  })
})
