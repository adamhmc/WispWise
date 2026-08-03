import { gameReducer } from './reducer'
import { selectCurrentQuestion, selectScore } from './selectors'
import { createGameSession } from './session'
import { INITIAL_GAME_STATE } from './state'

describe('game selectors', () => {
  it('returns no question or score outside a game', () => {
    expect(selectCurrentQuestion(INITIAL_GAME_STATE)).toBeNull()
    expect(selectScore(INITIAL_GAME_STATE)).toBe(0)
  })

  it('selects the current question and accumulated score', () => {
    const session = createGameSession({
      id: 'session-1',
      explanationsEnabled: true,
      random: { next: () => 0.25 },
    })
    let state = gameReducer(INITIAL_GAME_STATE, { type: 'START_GAME', session })
    expect(selectCurrentQuestion(state)?.card.id).toBe(session.questions[0].card.id)

    state = gameReducer(state, { type: 'QUESTION_READY', nowMs: 0 })
    if (state.status !== 'answering') throw new Error('Expected answering state')
    state = gameReducer(state, {
      type: 'SUBMIT_ANSWER',
      objectId: state.session.questions[0].evaluation.answer,
      nowMs: 500,
    })

    expect(selectScore(state)).toBe(1)
  })
})
