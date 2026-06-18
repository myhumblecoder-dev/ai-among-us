# Epic 3 — AI Player

*Vercel AI SDK integration: generate a context-aware AI chat message each round that blends in with human responses.*

---

## Story 8 — AI player message generator lib

**Depends on:** (none)

**Files to create:**
- `src/lib/ai-player.ts`
- `src/lib/ai-player.test.ts`

**Acceptance Criteria:**
- `src/lib/ai-player.ts` exports `generateAIMessage({ prompt, priorMessages }: { prompt: string; priorMessages: { playerName: string; content: string }[] }): Promise<string>`.
- Implementation uses `generateText` from `'ai'` and `import { anthropic } from '@ai-sdk/anthropic'` (NOT `'ai/providers/anthropic'`). Uses model `anthropic('claude-haiku-4-5')`.
- The system prompt instructs the AI to answer the round prompt in 1–3 casual sentences as if a human player at a party, without mentioning being AI, LLM, or language model.
- `priorMessages` are included in the user turn context as a formatted prior chat excerpt.
- Returns the generated text string (trimmed).
- `ai-player.test.ts` mocks `generateText` from `'ai'` via `vi.mock('ai', () => ({ generateText: vi.fn() }))`. Tests: calls `generateText` with a messages array that contains the prompt + prior chat context; returns the trimmed `text` from the resolved mock value; when `priorMessages` is empty the call still succeeds (only the prompt in context).

---

## Story 9 — generateAIMessage server action

**Depends on:** Story 8, Story 6

**Files to create:**
- `src/app/actions/ai.ts`
- `src/app/actions/ai.test.ts`

**Acceptance Criteria:**
- `generateAIMessage({ roundId, aiPlayerId })` loads the round via `db.round.findUnique({ where: { id: roundId }, include: { messages: { include: { player: true } }, game: { include: { players: true } } } })`; returns `{ error: "Round not found" }` for unknown `roundId`.
- Calls `generateAIMessage` from `src/lib/ai-player.ts` with the round's `prompt` and `priorMessages` shaped as `{ playerName: player.name, content: message.content }[]` (messages ordered by `createdAt` ascending).
- Saves the generated content via `db.message.create({ data: { roundId, playerId: aiPlayerId, content: generatedText } })`.
- Returns `{ messageId }` on success.
- `ai.test.ts` uses `vi.mock('@/lib/db')` and `vi.mock('@/lib/ai-player')`. Tests: calls `db.round.findUnique` with the correct `roundId`; calls `generateAIMessage` from the lib with the round prompt and prior messages; calls `db.message.create` with `playerId: aiPlayerId` and the generated content; returns `{ error: "Round not found" }` when `db.round.findUnique` resolves to `null`.
