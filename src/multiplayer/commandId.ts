let commandSequence = 0

/**
 * Creates a request identifier without relying on crypto.randomUUID(), which
 * is unavailable in some mobile browsers when the app is opened over a LAN
 * HTTP address rather than a secure origin.
 */
export function createClientCommandId(
  nowMs = Date.now(),
  randomValue = Math.random(),
): string {
  commandSequence = (commandSequence + 1) % Number.MAX_SAFE_INTEGER
  const randomPart = Math.floor(randomValue * 0x1_0000_0000).toString(36)
  return `cmd-${nowMs.toString(36)}-${commandSequence.toString(36)}-${randomPart}`
}
