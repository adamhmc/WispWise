import { describe, expect, it } from 'vitest'
import {
  clearRoomInviteFromUrl,
  createRoomInviteUrl,
  invitedRoomCodeFromUrl,
  normalizeInvitedRoomCode,
} from './invite'

describe('multiplayer invite links', () => {
  it('creates a same-page invite URL and reads its normalized room code', () => {
    const invite = createRoomInviteUrl('https://adamhmc.github.io/WispWise/?old=1#top', 'abc234')
    expect(invite).toBe('https://adamhmc.github.io/WispWise/?room=ABC234')
    expect(invitedRoomCodeFromUrl(invite)).toBe('ABC234')
  })

  it('rejects ambiguous or malformed room codes', () => {
    expect(normalizeInvitedRoomCode('ABC234')).toBe('ABC234')
    expect(normalizeInvitedRoomCode('ROOM01')).toBeNull()
    expect(normalizeInvitedRoomCode('SHORT')).toBeNull()
  })

  it('removes only the room parameter when leaving', () => {
    expect(clearRoomInviteFromUrl('https://example.test/WispWise/?room=WISP42&source=share'))
      .toBe('https://example.test/WispWise/?source=share')
  })
})
