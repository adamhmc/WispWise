import { calculateGameStats } from '@/domain'
import { TIMED_GAME_DURATION_MS, type AnswerRecord, type GameSession } from './session'
import { INITIAL_GAME_STATE, type FeedbackState, type GameEvent, type GameState } from './state'

function advanceFeedback(state: FeedbackState): GameState {
  const nextIndex = state.questionIndex + 1

  if (state.session.mode === 'classic' && nextIndex >= state.session.questions.length) {
    return {
      status: 'results',
      session: state.session,
      stats: calculateGameStats(state.session.records),
    }
  }

  return {
    status: 'preparing',
    session: state.session,
    questionIndex: nextIndex % state.session.questions.length,
  }
}

function results(session: GameSession): GameState {
  return { status: 'results', session, stats: calculateGameStats(session.records) }
}

function timedOut(session: GameSession, nowMs: number): boolean {
  return session.mode === 'timed' && session.deadlineAtMs !== undefined && nowMs >= session.deadlineAtMs
}

export function gameReducer(state: GameState, event: GameEvent): GameState {
  if (event.type === 'EXIT_GAME') {
    return INITIAL_GAME_STATE
  }

  if (
    event.type === 'TIMER_EXPIRED' &&
    state.status !== 'home' &&
    state.status !== 'tutorial' &&
    timedOut(state.session, event.nowMs)
  ) {
    return results(state.session)
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

    case 'preparing': {
      if (event.type !== 'QUESTION_READY') return state
      if (timedOut(state.session, event.nowMs)) return results(state.session)

      const session = state.session.mode === 'timed' && state.session.startedAtMs === undefined
        ? {
            ...state.session,
            startedAtMs: event.nowMs,
            deadlineAtMs: event.nowMs + TIMED_GAME_DURATION_MS,
          }
        : state.session

      return {
        status: 'answering',
        session,
        questionIndex: state.questionIndex,
        questionStartedAtMs: event.nowMs,
      }
    }

    case 'answering': {
      if (event.type !== 'SUBMIT_ANSWER') return state
      if (timedOut(state.session, event.nowMs)) return results(state.session)

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
        if (event.nowMs !== undefined && timedOut(state.session, event.nowMs)) return results(state.session)
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
