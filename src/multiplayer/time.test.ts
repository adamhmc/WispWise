import { describe, expect, it } from 'vitest'
import { estimateRemainingSeconds } from './time'

describe('estimateRemainingSeconds', () => {
  it('counts down from server-provided duration without comparing device epochs', () => {
    expect(estimateRemainingSeconds(15_000, 1_000_000, 1_000_000)).toBe(15)
    expect(estimateRemainingSeconds(15_000, 1_000_000, 1_004_200)).toBe(11)
    expect(estimateRemainingSeconds(15_000, 1_000_000, 1_020_000)).toBe(0)
  })

  it('does not increase when a device clock moves backwards', () => {
    expect(estimateRemainingSeconds(15_000, 1_000_000, 900_000)).toBe(15)
  })
})
