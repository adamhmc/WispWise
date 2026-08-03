import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ObjectId } from '@/domain'
import {
  AutoAdvanceController,
  createGameSession,
  gameReducer,
  INITIAL_GAME_STATE,
  type Preferences,
} from '@/game'
import {
  browserClock,
  browserRandomSource,
  browserTimer,
  LocalStoragePreferenceStore,
} from '@/infrastructure'

export function useGameController() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE)
  const preferenceStore = useMemo(
    () => new LocalStoragePreferenceStore(window.localStorage),
    [],
  )
  const [preferences, setPreferencesState] = useState<Preferences>(() => preferenceStore.load())
  const sessionCounter = useRef(0)
  const autoAdvance = useMemo(
    () => new AutoAdvanceController(browserTimer, dispatch),
    [],
  )

  const createFreshSession = useCallback(() => {
    sessionCounter.current += 1
    return createGameSession({
      id: `local-session-${sessionCounter.current}`,
      explanationsEnabled: preferences.explanationsEnabled,
      random: browserRandomSource,
    })
  }, [preferences.explanationsEnabled])

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME', session: createFreshSession() })
  }, [createFreshSession])

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART_GAME', session: createFreshSession() })
  }, [createFreshSession])

  const submitAnswer = useCallback((objectId: ObjectId) => {
    dispatch({ type: 'SUBMIT_ANSWER', objectId, nowMs: browserClock.now() })
  }, [])

  const setPreferences = useCallback(
    (next: Preferences) => {
      setPreferencesState(next)
      preferenceStore.save(next)
    },
    [preferenceStore],
  )

  useEffect(() => {
    if (state.status === 'preparing') {
      dispatch({ type: 'QUESTION_READY', nowMs: browserClock.now() })
    }
  }, [state])

  useEffect(() => {
    autoAdvance.sync(state)
  }, [autoAdvance, state])

  useEffect(() => () => autoAdvance.dispose(), [autoAdvance])

  return {
    state,
    preferences,
    startGame,
    restartGame,
    submitAnswer,
    setPreferences,
    nextQuestion: () => dispatch({ type: 'NEXT_QUESTION' }),
    exitGame: () => dispatch({ type: 'EXIT_GAME' }),
  }
}
