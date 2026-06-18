# Epic 2 — Lobby & Round Chat

*Lobby waiting room, game start, round creation, and human chat message submission. After this epic the full human-side chat flow works end-to-end.*

---

## Story 2.1 — Lobby page + PlayerList component

**Depends on:** Story 1.3

**Files to create:**
- `src/app/lobby/[code]/page.tsx`
- `src/components/PlayerList.tsx`
- `src/components/PlayerList.test.tsx`

**Files to modify:**
- `src/app/api/game/[code]/state/route.ts`

**Acceptance Criteria:**
- `src/app/api/game/[code]/state/route.ts` is a Next.js route handler that reads `code` from params, calls `db.game.findUnique({ where: { code }, include: { players: true, rounds: { include: { messages: { include: { player: true } }, votes: true } } } })`, and returns the full game state as JSON (200) or `{ error: "Not found" }` (404).
- `PlayerList` accepts `players: { id: string; name: string; isAI: boolean }[]` and renders each player's name as a list item; when `revealAI` prop is `true`, the AI player row includes text `"(AI)"` after the name.
- `lobby/[code]/page.tsx` is a server component that fetches `/api/game/[code]/state` (using the `code` param), renders `<PlayerList players={game.players} />`, shows the game code in a `<code>` element, and renders a "Start Game" button (calls `startGame`) visible only when `game.players.length >= 2`.
- `PlayerList.test.tsx` covers: renders all player names; does NOT show "(AI)" when `revealAI` is false; shows "(AI)" next to AI player name when `revealAI` is true.

---

## Story 2.2 — Round actions (start + message submission)

**Depends on:** Story 1.3

**Files to create:**
- `src/app/actions/round.ts`
- `src/app/actions/round.test.ts`

**Acceptance Criteria:**
- `startRound({ gameId, roundNumber, prompt })` creates a `Round` row via `db.round.create({ data: { gameId, number: roundNumber, prompt, status: "CHAT" } })`, returns `{ roundId }`.
- `submitMessage({ roundId, playerId, content })` validates with `submitMessageSchema` (zod `trim().min(1)` for content); rejects whitespace-only content (returns `{ error: "Message required" }` without calling `db.message.create`); on success calls `db.message.create({ data: { roundId, playerId, content } })`, returns `{ messageId }`.
- `round.test.ts` uses `vi.mock('@/lib/db')` to mock `db.round.create` and `db.message.create`. Tests: `startRound` calls `db.round.create` with `status: "CHAT"`; `submitMessage` with whitespace-only content does NOT call `db.message.create` and returns `{ error: "Message required" }`; `submitMessage` with valid content calls `db.message.create` with the trimmed content.

---

## Story 2.3 — Game page + ChatPanel + MessageInput

**Depends on:** Story 2.1, Story 2.2

**Files to create:**
- `src/app/game/[code]/page.tsx`
- `src/components/ChatPanel.tsx`
- `src/components/ChatPanel.test.tsx`
- `src/components/MessageInput.tsx`
- `src/components/MessageInput.test.tsx`

**Acceptance Criteria:**
- `ChatPanel` accepts `messages: { id: string; content: string; player: { name: string; isAI: boolean } }[]` and renders each message as `"<playerName>: <content>"` in a scrollable list. AI messages are rendered identically to human messages (no AI marker in chat phase).
- `MessageInput` accepts `roundId: string`, `playerId: string`, and `onSent: () => void`. Renders a textarea and "Send" button. On submit calls `submitMessage({ roundId, playerId, content })`; on success clears the textarea and calls `onSent()`; disables both textarea and button after a successful send (one message per round). Whitespace-only input shows error `"Message cannot be empty"` without calling `submitMessage`.
- `game/[code]/page.tsx` is a server component that fetches current game state, renders the active round's `<ChatPanel messages={...} />` and `<MessageInput ... />` when `round.status === "CHAT"`.
- `ChatPanel.test.tsx`: renders messages in order; each message shows `"<name>: <content>"`.
- `MessageInput.test.tsx`: renders textarea + button; submitting whitespace shows error without calling `submitMessage`; after successful send, textarea and button are disabled.
