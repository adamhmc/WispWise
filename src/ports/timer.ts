export interface TimerPort {
  schedule(callback: () => void, delayMs: number): unknown
  cancel(handle: unknown): void
}
