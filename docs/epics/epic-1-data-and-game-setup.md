# Epic 1 — Data & Game Setup

*Prisma singleton, utilities, and the game creation + join flow. After this epic the DB is reachable, a game can be created, and players can join a lobby.*

---

## Story 1 — Prisma client singleton + game-code util

**Depends on:** (none)

**Files to create:**
- `src/lib/db.ts`
- `src/lib/game-code.ts`
- `src/lib/game-code.test.ts`

**Acceptance Criteria:**
- `src/lib/db.ts` exports a single `PrismaClient` instance via the `globalThis` guard pattern (`(globalThis as any).__db ??= new PrismaClient()`); importing it twice from different modules returns the same instance.
- `src/lib/game-code.ts` exports `generateGameCode(): string` which returns a 6-character uppercase alphanumeric string (chars from `[A-Z0-9]`).
- `game-code.test.ts` covers: `generateGameCode()` returns a string of length exactly 6; all characters match `/^[A-Z0-9]$/`; 100 calls produce no duplicates (collision resistance spot-check).

---

## Story 2 — Validation schemas

**Depends on:** (none)

**Files to create:**
- `src/lib/validation.ts`

**Acceptance Criteria:**
- `src/lib/validation.ts` exports `createGameSchema` (`z.object({ hostName: z.string().trim().min(1) })`), `joinGameSchema` (`z.object({ code: z.string().trim().length(6), playerName: z.string().trim().min(1) })`), `submitMessageSchema` (`z.object({ roundId: z.string().trim().min(1), playerId: z.string().trim().min(1), content: z.string().trim().min(1) })`), and `submitVoteSchema` (`z.object({ roundId: z.string().trim().min(1), voterId: z.string().trim().min(1), votedForId: z.string().trim().min(1) })`).
- All schemas use `z.string().trim().min(1)` ordering (trim BEFORE min) so whitespace-only strings are rejected.
- Export type aliases: `CreateGameInput = z.infer<typeof createGameSchema>`, `JoinGameInput = z.infer<typeof joinGameSchema>`, `SubmitMessageInput = z.infer<typeof submitMessageSchema>`, `SubmitVoteInput = z.infer<typeof submitVoteSchema>`.
- No test file required for this story (pure schema declarations; tested implicitly by action tests).

---

## Story 3 — Game creation + join server actions

**Depends on:** Story 1, Story 2

**Files to create:**
- `src/app/actions/game.ts`
- `src/app/actions/game.test.ts`

**Acceptance Criteria:**
- `createGame({ hostName })` validates input with `createGameSchema`; rejects whitespace-only `hostName` (returns `{ error: "Invalid input" }`); on success calls `db.game.create(...)` with a generated code (via `generateGameCode()`), creates a `Player` row with `name = hostName, isAI = false`, returns `{ gameId, code, playerId }`.
- `joinGame({ code, playerName })` validates with `joinGameSchema`; rejects invalid code/name; calls `db.game.findUnique({ where: { code } })`; returns `{ error: "Game not found" }` for unknown code; returns `{ error: "Game already started" }` if `game.status !== "LOBBY"`; calls `db.player.create(...)` with `name = playerName, isAI = false`, returns `{ gameId, playerId }`.
- `startGame({ gameId, hostPlayerId })` sets `db.game.update({ where: { id: gameId }, data: { status: "IN_PROGRESS" } })`, creates the AI player row `db.player.create({ data: { gameId, name: "ARIA", isAI: true } })`, returns `{ ok: true }`.
- `game.test.ts` uses `vi.mock('@/lib/db')` to mock `db.game.create`, `db.game.findUnique`, `db.game.update`, `db.player.create`. Tests: `createGame` with empty hostName does NOT call `db.game.create`; `createGame` with `hostName: "Alice"` calls `db.game.create` and `db.player.create`; `joinGame` with unknown code returns `{ error: "Game not found" }`; `startGame` calls `db.game.update` with `status: "IN_PROGRESS"` and `db.player.create` with `isAI: true`.

---

## Story 16 — Home page form components (CreateGameForm + JoinGameForm)

**Depends on:** Story 3

**Files to create:**
- `src/components/CreateGameForm.tsx`
- `src/components/CreateGameForm.test.tsx`
- `src/components/JoinGameForm.tsx`
- `src/components/JoinGameForm.test.tsx`

**Acceptance Criteria:**
- `CreateGameForm` renders a text input (label "Your name") and a "Create Game" button. On submit calls `createGame({ hostName })` and on success navigates to `/lobby/[code]` (using `useRouter().push`). Whitespace-only name shows error `"Name is required"` without calling `createGame`.
- `JoinGameForm` renders two text inputs (labels "Game code" and "Your name") and a "Join Game" button. On submit calls `joinGame({ code, playerName })`; on success navigates to `/lobby/[code]`. Whitespace-only inputs or code length ≠ 6 shows `"Invalid code or name"`.
- `CreateGameForm.test.tsx`: renders form, enters name, submit button enabled; submitting whitespace name shows error, does NOT call `createGame`.
- `JoinGameForm.test.tsx`: renders form, submitting empty inputs shows error; submitting valid code + name calls `joinGame`.

---

## Story 17 — Home page (renders form components)

**Depends on:** Story 16

**Files to modify:**
- `src/app/page.tsx`

**Acceptance Criteria:**
- `page.tsx` renders both `<CreateGameForm />` and `<JoinGameForm />` side by side with a heading `"Almost Human"`.
- No DB access in this page — static render is fine; do NOT add `export const dynamic = 'force-dynamic'`.
