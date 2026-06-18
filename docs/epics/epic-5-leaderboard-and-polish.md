# Epic 5 — Leaderboard & Polish

*Final leaderboard with titles, game-end flow, and state polling for real-time updates.*

---

## Story 13 — Title assignment at game end

**Depends on:** Story 10, Story 3

**Files to modify:**
- `src/app/actions/game.ts`
- `src/app/actions/game.test.ts`

**Acceptance Criteria:**
- Add `finishGame({ gameId })` to `game.ts`: loads all rounds + votes + players for the game; calls `assignTitles` from `src/lib/scoring.ts`; for each player with an assigned title calls `db.player.update({ where: { id: playerId }, data: { title } })`; calls `db.game.update({ where: { id: gameId }, data: { status: "FINISHED" } })`; returns `{ ok: true }`.
- `game.test.ts` additional tests (add to existing file): `finishGame` calls `db.game.update` with `status: "FINISHED"`; calls `db.player.update` for each player that receives a title from `assignTitles` (mock `assignTitles` to return `[{ playerId: "p1", title: "Champion" }]` and assert `db.player.update` was called with `{ where: { id: "p1" }, data: { title: "Champion" } }`).

---

## Story 25 — Leaderboard component

**Depends on:** (none)

**Files to create:**
- `src/components/Leaderboard.tsx`
- `src/components/Leaderboard.test.tsx`

**Acceptance Criteria:**
- `Leaderboard` accepts `players: { id: string; name: string; score: number; title: string | null; isAI: boolean }[]`. Renders players sorted by `score` descending; each row shows `name`, `score`, and `title` (if present). The AI player row shows `"🤖"` prefix on the name.
- `Leaderboard.test.tsx`: renders players sorted by score descending; player with title shows it; AI player name is prefixed with `"🤖"`; player with no title renders their row without a title column.

---

## Story 26 — Final game-over page (leaderboard view)

**Depends on:** Story 25, Story 13, Story 24

**Files to modify:**
- `src/app/game/[code]/results/page.tsx`

**Acceptance Criteria:**
- `results/page.tsx` already has `export const dynamic = 'force-dynamic'` (from Story 24).
- When `game.status === "FINISHED"`, replace the game-over stub with a full render: `<h1>Game Over!</h1>` heading followed by `<Leaderboard players={game.players} />`.
- The REVEAL branch (from Story 24) continues to render `<RoundReveal ... />` when `round.status === "REVEAL"`.

---

## Story 28 — Game page client-side polling

**Depends on:** Story 22, Story 18

**Files to modify:**
- `src/app/game/[code]/page.tsx`

**Acceptance Criteria:**
- Convert `game/[code]/page.tsx` to a client component (`"use client"` directive at top).
- Use `useEffect` + `setInterval` to poll `/api/game/[code]/state` every **3000ms**; on each poll update local `gameState` via `useState`.
- Stop polling (clear interval) when `game.status === "FINISHED"` or on unmount.
- The rest of the render logic (ChatPanel, MessageInput, Waiting message) remains driven by `gameState`.
