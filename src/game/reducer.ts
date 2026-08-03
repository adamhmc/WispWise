import { calculateGameStats } from '@/domain'
import type { AnswerRecord } from './session'
import { INITIAL_GAME_STATE, type FeedbackState, type GameEvent, type GameState } from './state'

function advanceFeedback(state: FeedbackState): GameState {
  const nextIndex = state.questionIndex + 1

  if (nextIndex >= state.session.questions.length) {
    return {
      status: 'results',
      session: state.session,
      stats: calculateGameStats(state.session.records),
    }
  }

  return {
    status: 'preparing',
    session: state.session,
    questionIndex: nextIndex,
  }
}

export function gameReducer(state: GameState, event: GameEvent): GameState {
  if (event.type === 'EXIT_GAME') {
    return INITIAL_GAME_STATE
  }

  switch (state.status) {
    case 'home':
      if (event.type === 'OPEN_TUTORIAL') return { status: 'tutorial' }
      if (event.type === 'START_GAME') {
        return { status: 'preparing', session: event.session, questionIndex: 0 }
      }
      return state

    case 'tutorial':
      return event.type === 'CLOSE_TUTORIAL' ? INITIAL_GAME_STATE : state

    case 'preparing':
      if (event.type !== 'QUESTION_READY') return state
      return {
        status: 'answering',
        session: state.session,
        questionIndex: state.questionIndex,
        questionStartedAtMs: event.nowMs,
      }

    case 'answering': {
      if (event.type !== 'SUBMIT_ANSWER') return state

      const question = state.session.questions[state.questionIndex]
      const elapsedMs = Math.max(0, event.nowMs - state.questionStartedAtMs)
      const answer: AnswerRecord = {
        questionId: question.card.id,
        kind: question.evaluation.kind,
        correctAnswer: question.evaluation.answer,
        selectedAnswer: event.objectId,
        startedAtMs: state.questionStartedAtMs,
        answeredAtMs: event.nowMs,
        elapsedMs,
        isCorrect: event.objectId === question.evaluation.answer,
      }
      const session = {
        ...state.session,
        records: [...state.session.records, answer],
      }

      return { status: 'feedback', session, questionIndex: state.questionIndex, answer }
    }

    case 'feedback':
      if (event.type === 'NEXT_QUESTION' && state.session.explanationsEnabled) {
        return advanceFeedback(state)
      }
      if (event.type === 'AUTO_ADVANCE' && !state.session.explanationsEnabled) {
        return advanceFeedback(state)
      }
      return state

    case 'results':
      if (event.type === 'RESTART_GAME') {
        return { status: 'preparing', session: event.session, questionIndex: 0 }
      }
      return state
  }
}
