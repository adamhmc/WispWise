export function estimateRemainingSeconds(
  serverRemainingMs: number | undefined,
  snapshotReceivedAtMs: number,
  nowMs: number,
): number {
  if (serverRemainingMs === undefined) return 0
  const elapsedSinceSnapshotMs = Math.max(0, nowMs - snapshotReceivedAtMs)
  return Math.max(0, Math.ceil((serverRemainingMs - elapsedSinceSnapshotMs) / 1000))
}
