import type { TimerPort } from '@/ports'
import type { GameEvent, GameState } from './state'

export const AUTO_ADVANCE_DELAY_MS = 1_200

export class AutoAdvanceController {
  private handle: unknown
  private activeKey: string | null = null

  constructor(
    private readonly timer: TimerPort,
    private readonly dispatch: (event: GameEvent) => void,
  ) {}

  sync(state: GameState): void {
    const key =
      state.status === 'feedback' && !state.session.explanationsEnabled
        ? `${state.session.id}:${state.questionIndex}`
        : null

    if (key === this.activeKey) return

    this.cancelPending()

    if (!key) return

    this.activeKey = key
    this.handle = this.timer.schedule(() => {
      this.handle = undefined
      this.activeKey = null
      this.dispatch({ type: 'AUTO_ADVANCE' })
    }, AUTO_ADVANCE_DELAY_MS)
  }

  dispose(): void {
    this.cancelPending()
  }

  private cancelPending(): void {
    if (this.handle !== undefined) {
      this.timer.cancel(this.handle)
    }

    this.handle = undefined
    this.activeKey = null
  }
}
