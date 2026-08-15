import { describe, expect, it } from 'vitest'
import { parseClientMessage } from './protocol'

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
    null,
    {},
    { type: 'join-room', nickname: '  ' },
    { type: 'submit-answer', commandId: '1', roundId: 'round-1', answer: 'purple' },
    { type: 'unknown' },
  ])('rejects malformed input %#', (message) => {
    expect(parseClientMessage(message)).toBeNull()
  })
})
