import type { GameStats, ObjectId } from '@/domain'
import type { AnswerRecord, GameSession } from './session'

export interface HomeState {
  readonly status: 'home'
}

export interface TutorialState {
  readonly status: 'tutorial'
}

export interface PreparingState {
  readonly status: 'preparing'
  readonly session: GameSession
  readonly questionIndex: number
}

export interface AnsweringState {
  readonly status: 'answering'
  readonly session: GameSession
  readonly questionIndex: number
  readonly questionStartedAtMs: number
}

export interface FeedbackState {
  readonly status: 'feedback'
  readonly session: GameSession
  readonly questionIndex: number
  readonly answer: AnswerRecord
}

export interface ResultsState {
  readonly status: 'results'
  readonly session: GameSession
  readonly stats: GameStats
}

export type GameState =
  | HomeState
  | TutorialState
  | PreparingState
  | AnsweringState
  | FeedbackState
  | ResultsState

export type GameEvent =
  | { readonly type: 'OPEN_TUTORIAL' }
  | { readonly type: 'CLOSE_TUTORIAL' }
  | { readonly type: 'START_GAME'; readonly session: GameSession }
  | { readonly type: 'QUESTION_READY'; readonly nowMs: number }
  | { readonly type: 'SUBMIT_ANSWER'; readonly objectId: ObjectId; readonly nowMs: number }
  | { readonly type: 'NEXT_QUESTION' }
  | { readonly type: 'AUTO_ADVANCE'; readonly nowMs?: number }
  | { readonly type: 'TIMER_EXPIRED'; readonly nowMs: number }
  | { readonly type: 'RESTART_GAME'; readonly session: GameSession }
  | { readonly type: 'EXIT_GAME' }

export const INITIAL_GAME_STATE: HomeState = { status: 'home' }
