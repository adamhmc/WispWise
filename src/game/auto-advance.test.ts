import type { TimerPort } from '@/ports'
import { AutoAdvanceController, AUTO_ADVANCE_DELAY_MS } from './auto-advance'
import { gameReducer } from './reducer'
import { createGameSession } from './session'
import { INITIAL_GAME_STATE, type GameEvent, type GameState } from './state'

class FakeTimer implements TimerPort {
  callback: (() => void) | null = null
  delayMs: number | null = null
  cancelCount = 0

  schedule(callback: () => void, delayMs: number): unknown {
    this.callback = callback
    this.delayMs = delayMs
    return 'timer-handle'
  }

  cancel(): void {
    this.cancelCount += 1
    this.callback = null
  }

  fire(): void {
    const callback = this.callback
    this.callback = null
    callback?.()
  }
}

function feedbackState(explanationsEnabled: boolean): GameState {
  const session = createGameSession({
    id: 'session-1',
    explanationsEnabled,
    random: { next: () => 0.25 },
  })
  let state: GameState = gameReducer(INITIAL_GAME_STATE, { type: 'START_GAME', session })
  state = gameReducer(state, { type: 'QUESTION_READY', nowMs: 0 })
  if (state.status !== 'answering') throw new Error('Expected answering state')
  return gameReducer(state, {
    type: 'SUBMIT_ANSWER',
    objectId: state.session.questions[0].evaluation.answer,
    nowMs: 100,
  })
}

describe('AutoAdvanceController', () => {
  it('schedules exactly one 1.2 second transition when explanations are disabled', () => {
    const timer = new FakeTimer()
    const events: GameEvent[] = []
    const controller = new AutoAdvanceController(timer, (event) => events.push(event))
    const state = feedbackState(false)

    controller.sync(state)
    controller.sync(state)

    expect(timer.delayMs).toBe(AUTO_ADVANCE_DELAY_MS)
    timer.fire()
    expect(events).toEqual([{ type: 'AUTO_ADVANCE' }])
  })

  it('does not schedule while explanations are enabled', () => {
    const timer = new FakeTimer()
    const controller = new AutoAdvanceController(timer, () => undefined)

    controller.sync(feedbackState(true))

    expect(timer.callback).toBeNull()
  })

  it('cancels a pending transition when state changes or controller disposes', () => {
    const timer = new FakeTimer()
    const controller = new AutoAdvanceController(timer, () => undefined)

    controller.sync(feedbackState(false))
    controller.sync(INITIAL_GAME_STATE)
    expect(timer.cancelCount).toBe(1)

    controller.sync(feedbackState(false))
    controller.dispose()
    expect(timer.cancelCount).toBe(2)
  })
})
