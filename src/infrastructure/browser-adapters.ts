import type { Clock, RandomSource, TimerPort } from '@/ports'

export const browserClock: Clock = {
  now: () => performance.now(),
}

export const browserRandomSource: RandomSource = {
  next: () => Math.random(),
}

export const browserTimer: TimerPort = {
  schedule: (callback, delayMs) => window.setTimeout(callback, delayMs),
  cancel: (handle) => window.clearTimeout(handle as number),
}
