import { describe, expect, it } from 'vitest'
import { createClientCommandId } from './commandId'

describe('createClientCommandId', () => {
  it('creates non-empty unique IDs without the Web Crypto UUID API', () => {
    const first = createClientCommandId(1_000, 0.25)
    const second = createClientCommandId(1_000, 0.25)

    expect(first).toMatch(/^cmd-/)
    expect(second).not.toBe(first)
  })
})
