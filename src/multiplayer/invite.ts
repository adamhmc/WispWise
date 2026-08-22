import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './protocol'

const ROOM_CODE_PATTERN = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`)

export function normalizeInvitedRoomCode(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? ''
  return ROOM_CODE_PATTERN.test(normalized) ? normalized : null
}

export function createRoomInviteUrl(currentHref: string, roomCode: string): string {
  const url = new URL(currentHref)
  url.search = ''
  url.hash = ''
  url.searchParams.set('room', normalizeInvitedRoomCode(roomCode) ?? roomCode.toUpperCase())
  return url.toString()
}

export function invitedRoomCodeFromUrl(currentHref: string): string | null {
  return normalizeInvitedRoomCode(new URL(currentHref).searchParams.get('room'))
}

export function clearRoomInviteFromUrl(currentHref: string): string {
  const url = new URL(currentHref)
  url.searchParams.delete('room')
  return url.toString()
}
