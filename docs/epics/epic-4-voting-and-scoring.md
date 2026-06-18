# Epic 4 — Voting & Scoring

*Voting panel, round reveal, score computation, and title assignment. After this epic a full round lifecycle works: chat → vote → reveal with points.*

---

## Story 10 — Scoring + title logic lib

**Depends on:** (none)

**Files to create:**
- `src/lib/scoring.ts`
- `src/lib/scoring.test.ts`

**Acceptance Criteria:**
- `src/lib/scoring.ts` exports `computeRoundScores({ players, votes, aiPlayerId }: { players: { id: string; name: string }[]; votes: { voterId: string; votedForId: string }[]; aiPlayerId: string }): { playerId: string; delta: number }[]`.
  - Human correctly identifies AI (`votedForId === aiPlayerId`): delta = **+3**.
  - Human not voted for by anyone in this round: delta = **+1**.
  - Human who voted wrong (`votedForId !== aiPlayerId`): delta = **0**.
  - AI player row: delta = **0** (AI internal score; tracked but humans can't vote for themselves).
- Also exports `assignTitles({ players, allRoundVotes, aiPlayerId }: { players: { id: string; name: string; score: number }[]; allRoundVotes: { voterId: string; votedForId: string; roundId: string }[]; aiPlayerId: string }): { playerId: string; title: string }[]`.
  - `"The Detector"` → human with most rounds where they correctly identified the AI.
  - `"Almost Human"` → human never voted for across all rounds.
  - `"The Suspicious One"` → human most voted for across all rounds.
  - `"Champion"` → player with highest `score`.
  - `"Convincing Bot"` → the AI player (always assigned).
  - Ties: first player in list order wins the title. A player may hold multiple titles.
- `scoring.test.ts` covers:
  - `computeRoundScores`: 3 humans + 1 AI, 2 humans vote for AI (+3 each), 1 votes wrong (+0); the 1 human not voted for by anyone gets +1; the wrong voter gets +0.
  - Exact return: `[{ playerId: "p1", delta: 3 }, { playerId: "p2", delta: 3 }, { playerId: "p3", delta: 1 }, { playerId: "ai", delta: 0 }]` for `votes = [{ voterId: "p1", votedForId: "ai" }, { voterId: "p2", votedForId: "ai" }, { voterId: "p3", votedForId: "p1" }]` with `aiPlayerId: "ai"` (player "p1" voted wrong AND was voted for, so no +1 bonus).
  - `assignTitles`: a player with `score: 10` (highest) gets `"Champion"`.

---

## Story 11 — submitVote + revealRound actions

**Depends on:** Story 10, Story 6

**Files to modify:**
- `src/app/actions/round.ts`
- `src/app/actions/round.test.ts`

**Acceptance Criteria:**
- Add `submitVote({ roundId, voterId, votedForId })` to `round.ts`: validates with `submitVoteSchema` (`zod` `trim().min(1)` on all three fields); calls `db.vote.create({ data: { roundId, voterId, votedForId } })`; returns `{ voteId }` on success. Returns `{ error: "Already voted" }` if `db.vote.findUnique({ where: { roundId_voterId: { roundId, voterId } } })` returns a row.
- Add `revealRound({ roundId })` to `round.ts`: sets `db.round.update({ where: { id: roundId }, data: { status: "REVEAL" } })`; loads all votes + players for the round; calls `computeRoundScores` from `src/lib/scoring.ts`; for each non-zero delta calls `db.player.update({ where: { id: playerId }, data: { score: { increment: delta } } })`; returns `{ ok: true }`.
- `round.test.ts` additional tests (add to existing file): `submitVote` with valid input calls `db.vote.create`; `submitVote` when `db.vote.findUnique` returns a row returns `{ error: "Already voted" }` without calling `db.vote.create`; `revealRound` calls `db.round.update` with `status: "REVEAL"` and calls `db.player.update` for each player with a non-zero delta.

---

## Story 23 — VotingPanel + RoundReveal components

**Depends on:** Story 11

**Files to create:**
- `src/components/VotingPanel.tsx`
- `src/components/VotingPanel.test.tsx`
- `src/components/RoundReveal.tsx`
- `src/components/RoundReveal.test.tsx`

**Acceptance Criteria:**
- `VotingPanel` accepts `players: { id: string; name: string }[]`, `currentPlayerId: string`, `roundId: string`. Renders each player's name as a clickable button (excluding `currentPlayerId`). Clicking a player calls `submitVote({ roundId, voterId: currentPlayerId, votedForId: player.id })`; after a vote is cast, all buttons are disabled and a `"Vote cast!"` message is shown.
- `RoundReveal` accepts `players: { id: string; name: string; isAI: boolean }[]`, `votes: { voterId: string; votedForId: string }[]`, `scores: { playerId: string; delta: number }[]`, `aiPlayerId: string`. Renders: the AI player's name with label `"🤖 This was the AI!"`, vote counts per player (e.g. `"Alice: 3 votes"`), and score deltas for each player (e.g. `"+3"` in green, `"0"` in gray).
- `VotingPanel.test.tsx`: renders player buttons excluding self; clicking a button calls `submitVote` with the correct `votedForId`; after clicking, all buttons are disabled and `"Vote cast!"` is visible.
- `RoundReveal.test.tsx`: renders `"🤖 This was the AI!"` with the AI player's name; shows vote counts; shows `"+3"` for a player with delta 3.

---

## Story 24 — Round results page (reveal view)

**Depends on:** Story 23, Story 18

**Files to create:**
- `src/app/game/[code]/results/page.tsx`

**Acceptance Criteria:**
- `export const dynamic = 'force-dynamic'` is declared at the top of the file (DB read per request).
- `results/page.tsx` is a server component that fetches game state from `/api/game/[code]/state`. When the most recent round has `status === "REVEAL"`, renders `<RoundReveal players={...} votes={round.votes} scores={computedScores} aiPlayerId={...} />`. When `game.status === "FINISHED"` shows a `"Game over — see leaderboard"` message. When round is not in REVEAL status shows `"Reveal pending..."`.
