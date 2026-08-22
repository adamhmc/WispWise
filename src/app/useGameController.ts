import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ObjectId } from '@/domain'
import {
  AutoAdvanceController,
  createGameSession,
  gameReducer,
  INITIAL_GAME_STATE,
  type Preferences,
  type GameMode,
} from '@/game'
import {
  browserClock,
  browserRandomSource,
  browserTimer,
  BrowserAudioCuePlayer,
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
  const lastAudioRecordCount = useRef(0)
  const audioCuePlayer = useMemo(() => new BrowserAudioCuePlayer(), [])
  const autoAdvance = useMemo(
    () => new AutoAdvanceController(browserTimer, dispatch, browserClock),
    [],
  )
  const lastMode = useRef<GameMode>('classic')

  const createFreshSession = useCallback((mode: GameMode) => {
    sessionCounter.current += 1
    return createGameSession({
      id: `local-session-${sessionCounter.current}`,
      explanationsEnabled: preferences.explanationsEnabled,
      random: browserRandomSource,
      mode,
    })
  }, [preferences.explanationsEnabled])

  const startGame = useCallback((mode: GameMode = 'classic') => {
    lastAudioRecordCount.current = 0
    lastMode.current = mode
    dispatch({ type: 'START_GAME', session: createFreshSession(mode) })
  }, [createFreshSession])

  const restartGame = useCallback(() => {
    lastAudioRecordCount.current = 0
    dispatch({ type: 'RESTART_GAME', session: createFreshSession(lastMode.current) })
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

  useEffect(() => {
    if (
      (state.status !== 'preparing' && state.status !== 'answering' && state.status !== 'feedback') ||
      state.session.mode !== 'timed' ||
      state.session.deadlineAtMs === undefined
    ) return
    const handle = browserTimer.schedule(() => {
      dispatch({ type: 'TIMER_EXPIRED', nowMs: browserClock.now() })
    }, Math.max(0, state.session.deadlineAtMs - browserClock.now()))
    return () => browserTimer.cancel(handle)
  }, [state])

  useEffect(() => {
    if (state.status !== 'feedback') return
    if (state.session.records.length <= lastAudioRecordCount.current) return

    lastAudioRecordCount.current = state.session.records.length
    if (!preferences.muted) audioCuePlayer.play(state.answer.isCorrect ? 'correct' : 'incorrect')
  }, [audioCuePlayer, preferences.muted, state])

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
