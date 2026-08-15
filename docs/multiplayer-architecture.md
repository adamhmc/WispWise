# Multiplayer architecture

## Scope of the first backend milestone

The browser app remains a static GitHub Pages site. A Cloudflare Worker routes each room to one Durable Object, which owns the authoritative game state and fans updates out to connected Host and Player browsers.

```text
GitHub Pages frontend
  ├─ Host screen ─── WebSocket ─┐
  └─ Player screens ─ WebSocket ├─ Worker router ─ Durable Object (one per room)
                               └─ HTTP create/join endpoints
```

No multiplayer match history is persisted. Durable Object storage contains only the active room, its ten questions, current scores, reconnect tokens, and presence state.

## Authoritative rules

- One display-only Host and up to eight answering players.
- The server selects ten legal questions: five direct matches and five exclusion questions.
- Each question accepts one answer per player for 15 seconds.
- The round settles immediately after all joined players answer, or when the alarm reaches the deadline.
- A correct answer awards 1,000 points; an incorrect or missing answer awards zero.
- Equal scores are ordered by the lower total elapsed time across correct answers.
- Joining after the Host starts is rejected.
- A disconnected Host pauses the room. Reconnection within 30 seconds restores the phase and shifts the active round clock; otherwise the room finishes.
- Results remain visible until the Host advances. This can later become a server timer without changing the scoring engine.

## Transport

The Worker exposes these local API routes:

- `POST /api/rooms` creates a room and returns the Host token.
- `POST /api/rooms/:code/join` joins during the lobby and returns a player reconnect token.
- `GET /api/rooms/:code` returns the public snapshot.
- `POST /api/rooms/:code/command` is an HTTP command path used by integration tests and as a fallback.
- `GET /api/rooms/:code/connect?role=...&token=...` upgrades to a hibernation-compatible WebSocket.

The frontend must store only its own Host or player token in `sessionStorage`. Public snapshots never contain reconnect tokens or the correct answer before settlement. Durable Object alarms enforce deadlines even when no browser is actively sending messages.

## Local verification

```bash
npm run dev:worker
npm run test:worker
npm run typecheck:worker
npm run check
```

The Worker test suite uses Cloudflare's local Workers runtime and isolated Durable Object storage. It does not contact or deploy to Cloudflare.

## Implemented multiplayer UI

The current local build includes the complete ten-round screen flow:

1. Choose solo or multiplayer, then choose Host or Player.
2. Create or join a room and synchronize the lobby roster over WebSocket.
3. Show the card, countdown, and answer progress only on the Host display.
4. Show only the five answer objects on Player devices and lock after one selection.
5. Publish the correct answer, response times, and awarded points to both roles.
6. Let the Host advance each round and show a score/time-ranked final leaderboard after round ten.
