# Epic 2 — Lobby & Round Chat

*Lobby waiting room, game start, round creation, and human chat message submission. After this epic the full human-side chat flow works end-to-end.*

---

## Story 18 — Game state API route

**Depends on:** Story 3

**Files to create:**
- `src/app/api/game/[code]/state/route.ts`

**Acceptance Criteria:**
- `GET /api/game/[code]/state` reads `code` from params, calls `db.game.findUnique({ where: { code }, include: { players: true, rounds: { include: { messages: { include: { player: true } }, votes: true } } } })`, and returns the full game state as JSON with status 200, or `{ error: "Not found" }` with status 404 if the game doesn't exist.
- Response includes `Content-Type: application/json` and `Cache-Control: no-store` headers.

---

## Story 19 — PlayerList component

**Depends on:** (none)

**Files to create:**
- `src/components/PlayerList.tsx`
- `src/components/PlayerList.test.tsx`

**Acceptance Criteria:**
- `PlayerList` accepts `players: { id: string; name: string; isAI: boolean }[]` and `revealAI?: boolean`. Renders each player's name as a `<li>` element. When `revealAI` is `true`, the AI player row includes text `"(AI)"` after the name.
- `PlayerList.test.tsx` covers: renders all player names; does NOT show `"(AI)"` when `revealAI` is omitted or false; shows `"(AI)"` next to the AI player's name when `revealAI` is `true`.

---

## Story 20 — Lobby page

**Depends on:** Story 18, Story 19, Story 3

**Files to create:**
- `src/app/lobby/[code]/page.tsx`

**Acceptance Criteria:**
- `export const dynamic = 'force-dynamic'` is declared at the top of the file (DB read per request).
- `lobby/[code]/page.tsx` is a server component that fetches `/api/game/[code]/state` using the `code` route param, renders `<PlayerList players={game.players} revealAI={false} />`, shows the game code in a `<code>` element with label `"Game code:"`, and renders a `"Start Game"` button visible only when `game.players.length >= 2`. The Start Game button calls `startGame({ gameId: game.id, hostPlayerId: ... })` as a server action.

---

## Story 6 — Round actions (start + message submission)

**Depends on:** Story 3

**Files to create:**
- `src/app/actions/round.ts`
- `src/app/actions/round.test.ts`

**Acceptance Criteria:**
- `startRound({ gameId, roundNumber, prompt })` creates a `Round` row via `db.round.create({ data: { gameId, number: roundNumber, prompt, status: "CHAT" } })`, returns `{ roundId }`.
- `submitMessage({ roundId, playerId, content })` validates with `submitMessageSchema` (zod `trim().min(1)` for content); rejects whitespace-only content (returns `{ error: "Message required" }` without calling `db.message.create`); on success calls `db.message.create({ data: { roundId, playerId, content } })`, returns `{ messageId }`.
- `round.test.ts` uses `vi.mock('@/lib/db')` to mock `db.round.create` and `db.message.create`. Tests: `startRound` calls `db.round.create` with `status: "CHAT"`; `submitMessage` with whitespace-only content does NOT call `db.message.create` and returns `{ error: "Message required" }`; `submitMessage` with valid content calls `db.message.create` with the trimmed content.

---

## Story 21 — ChatPanel + MessageInput components

**Depends on:** Story 6

**Files to create:**
- `src/components/ChatPanel.tsx`
- `src/components/ChatPanel.test.tsx`
- `src/components/MessageInput.tsx`
- `src/components/MessageInput.test.tsx`

**Acceptance Criteria:**
- `ChatPanel` accepts `messages: { id: string; content: string; player: { name: string; isAI: boolean } }[]` and renders each message as `"<playerName>: <content>"` in a scrollable list. AI messages are rendered identically to human messages (no AI marker in chat phase).
- `MessageInput` accepts `roundId: string`, `playerId: string`, and `onSent: () => void`. Renders a textarea and "Send" button. On submit calls `submitMessage({ roundId, playerId, content })`; on success clears the textarea and calls `onSent()`; disables both textarea and button after a successful send (one message per round). Whitespace-only input shows error `"Message cannot be empty"` without calling `submitMessage`.
- `ChatPanel.test.tsx`: renders messages in order; each message shows `"<name>: <content>"`.
- `MessageInput.test.tsx`: renders textarea + button; submitting whitespace shows error without calling `submitMessage`; after successful send, textarea and button are disabled.

---

## Story 22 — Active game page

**Depends on:** Story 20, Story 21

**Files to create:**
- `src/app/game/[code]/page.tsx`

**Acceptance Criteria:**
- `export const dynamic = 'force-dynamic'` is declared at the top of the file (DB read per request).
- `game/[code]/page.tsx` is a server component that fetches current game state from `/api/game/[code]/state`. When the active round has `status === "CHAT"`, renders `<ChatPanel messages={round.messages} />` and `<MessageInput roundId={round.id} playerId={...} onSent={...} />`. When no active round or `status !== "CHAT"` shows a `"Waiting..."` message.
