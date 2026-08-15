import type { PublicPlayer, PublicRoomSnapshot, RoundResult } from './protocol'

export function shouldApplyRoomSnapshot(
  current: PublicRoomSnapshot | null,
  next: PublicRoomSnapshot,
): boolean {
  return !current || current.roomCode !== next.roomCode || next.revision >= current.revision
}

export function findPlayerResult(
  snapshot: PublicRoomSnapshot,
  playerId: string | null,
): RoundResult | undefined {
  if (!playerId) return undefined
  return snapshot.results?.find((result) => result.playerId === playerId)
}

export function hasPlayerAnswered(
  snapshot: PublicRoomSnapshot,
  playerId: string | null,
): boolean {
  return Boolean(playerId && snapshot.round?.answeredPlayerIds.includes(playerId))
}

export function rankPublicPlayers(players: readonly PublicPlayer[]): PublicPlayer[] {
  return [...players].sort(
    (left, right) =>
      right.score - left.score ||
      left.correctElapsedTotalMs - right.correctElapsedTotalMs ||
      left.nickname.localeCompare(right.nickname),
  )
}
