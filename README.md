# 靈機一選 WispWise

Mobile-friendly observation and deduction game built with React, TypeScript, and Vite. It includes a balanced 10-card solo round, first-play interactive tutorial, explanations, preferences, timing, results, and original object art.

The multiplayer backend is under active development with Cloudflare Workers and Durable Objects. Room rules are server-authoritative: up to eight answering players, 15-second rounds, one answer per player, 1,000 points for a correct answer, and total correct-response time as the score tie-breaker.

## Local development

```bash
npm install
npm run dev
```

Run the multiplayer backend locally in another terminal:

```bash
npm run dev:worker
```

The frontend runs at `http://localhost:5173`; the local Worker runs at `http://localhost:8787`.
For a deployed frontend, copy `.env.example` and set `VITE_MULTIPLAYER_API_URL` to the deployed Worker URL during the GitHub Pages build.

## Quality checks

```bash
npm run check
npm run test:e2e
```

`npm run check` covers linting, browser and Worker type checks, unit tests, Cloudflare runtime integration tests, and the production frontend build. Cloudflare tests run locally with Miniflare and do not deploy or incur cloud usage.

The frontend is deployed to GitHub Pages. The Worker is not deployed yet.

Only mute, explanation, and tutorial preferences are stored in the browser. Game history is not persisted.
