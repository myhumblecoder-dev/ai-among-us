# Epic 5 — Leaderboard & Polish

*Final leaderboard with titles, game-end flow, and state polling for real-time updates.*

---

## Story 5.1 — Title assignment at game end

**Depends on:** Story 4.1, Story 1.3

**Files to modify:**
- `src/app/actions/game.ts`
- `src/app/actions/game.test.ts`

**Acceptance Criteria:**
- Add `finishGame({ gameId })` to `game.ts`: loads all rounds + votes + players for the game; calls `assignTitles` from `src/lib/scoring.ts`; for each player with an assigned title calls `db.player.update({ where: { id: playerId }, data: { title } })`; calls `db.game.update({ where: { id: gameId }, data: { status: "FINISHED" } })`; returns `{ ok: true }`.
- `game.test.ts` additional tests (add to existing file): `finishGame` calls `db.game.update` with `status: "FINISHED"`; calls `db.player.update` for each player that receives a title from `assignTitles` (mock `assignTitles` to return a predictable array).

---

## Story 5.2 — Leaderboard component + final results page

**Depends on:** Story 5.1

**Files to create:**
- `src/components/Leaderboard.tsx`
- `src/components/Leaderboard.test.tsx`

**Files to modify:**
- `src/app/game/[code]/results/page.tsx`

**Acceptance Criteria:**
- `Leaderboard` accepts `players: { id: string; name: string; score: number; title: string | null; isAI: boolean }[]`. Renders players sorted by `score` descending; each row shows `name`, `score`, and `title` (if present). The AI player row shows `"🤖"` prefix on the name.
- `results/page.tsx` (modify): when `game.status === "FINISHED"` renders `<Leaderboard players={game.players} />` with a heading `"Game Over!"`.
- `Leaderboard.test.tsx`: renders players sorted by score descending; player with title shows it; AI player name is prefixed with `"🤖"`; player with no title renders their row without a title column.

---

## Story 5.3 — State polling route + client-side auto-refresh

**Depends on:** Story 2.1

**Files to modify:**
- `src/app/api/game/[code]/state/route.ts`
- `src/app/game/[code]/page.tsx`

**Acceptance Criteria:**
- `state/route.ts` (update): add a `Cache-Control: no-store` header to the response so clients always get fresh state.
- `game/[code]/page.tsx` (update): add a `"use client"` directive; use `useEffect` + `setInterval` to poll `/api/game/[code]/state` every **3000ms**; update local state on each response; stop polling when `game.status === "FINISHED"`.
- No test file change required for this story — it's a pure integration layer.
