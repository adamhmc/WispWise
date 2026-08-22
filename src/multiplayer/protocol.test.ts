import { describe, expect, it } from 'vitest'
import { calculateCorrectAnswerPoints, parseClientMessage } from './protocol'

describe('parseClientMessage', () => {
  it('normalizes a valid join message', () => {
    expect(parseClientMessage({ type: 'join-room', nickname: '  Ada  ' })).toEqual({
      type: 'join-room',
      nickname: 'Ada',
    })
  })

  it('accepts a valid answer command', () => {
    expect(
      parseClientMessage({
        type: 'submit-answer',
        commandId: 'command-1',
        roundId: 'round-1',
        answer: 'ghost',
      }),
    ).toEqual({
      type: 'submit-answer',
      commandId: 'command-1',
      roundId: 'round-1',
      answer: 'ghost',
    })
  })

  it.each([
    [{ type: 'set-auto-advance', seconds: null }, { type: 'set-auto-advance', seconds: null }],
    [{ type: 'set-auto-advance', seconds: 3 }, { type: 'set-auto-advance', seconds: 3 }],
    [{ type: 'set-auto-advance', seconds: 5 }, { type: 'set-auto-advance', seconds: 5 }],
    [{ type: 'set-auto-advance', seconds: 10 }, { type: 'set-auto-advance', seconds: 10 }],
  ])('accepts Host auto-advance setting %#', (message, expected) => {
    expect(parseClientMessage(message)).toEqual(expected)
  })

  it('accepts a Host rematch command', () => {
    expect(parseClientMessage({ type: 'reset-game' })).toEqual({ type: 'reset-game' })
  })

  it('keeps full points through 0.5 seconds and then decreases linearly to zero', () => {
    expect(calculateCorrectAnswerPoints(0)).toBe(1_000)
    expect(calculateCorrectAnswerPoints(500)).toBe(1_000)
    expect(calculateCorrectAnswerPoints(7_750)).toBe(500)
    expect(calculateCorrectAnswerPoints(15_000)).toBe(0)
  })

  it.each([
    null,
    {},
    { type: 'join-room', nickname: '  ' },
    { type: 'submit-answer', commandId: '1', roundId: 'round-1', answer: 'purple' },
    { type: 'set-auto-advance', seconds: 4 },
    { type: 'unknown' },
  ])('rejects malformed input %#', (message) => {
    expect(parseClientMessage(message)).toBeNull()
  })
})
