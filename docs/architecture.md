# Architecture — almost-human

*Party game where 6 players (1 LLM + 5 humans) chat each round then vote to identify the AI. Per-round scoring, leaderboard, and titles.*

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, `src/`, TypeScript) | React 19; RSC default |
| UI | **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) | utilities + shadcn only; no bespoke CSS files |
| Data | **Prisma ORM v6** + **PostgreSQL** (Neon serverless) | single client via singleton; pin Prisma v6 |
| Mutations/reads | **Server Actions** (`src/app/actions/*.ts`) | no REST route handlers for game logic |
| Polling | **Next.js route handler** `GET /api/game/[code]/state` | lightweight SSE/long-poll for real-time updates |
| Validation | **Zod** — `z.string().trim().min(1)` (trim BEFORE min) | validate every action input; never trust raw form |
| AI | **Vercel AI SDK** `generateText` from `'ai'`; provider `import { anthropic } from '@ai-sdk/anthropic'` | generates AI player responses each round |
| Tests | **Vitest** + **React Testing Library**, co-located `*.test.tsx` / `*.test.ts` | gates: lint + build + test |
| CI/CD | **GitHub Actions** → **Vercel** | scaffolded by bootstrap |
| Auth | **None** — join by game code + player name | no session/user model; explicit Brief decision |

### Footgun mandates (applied every story)

- **Validation:** `zod` — always `z.string().trim().min(1)` (trim first). Never hand-rolled `if (!x)` chains.
- **AI calls:** Vercel AI SDK `generateText`/`streamText` from `'ai'`; provider ALWAYS `import { anthropic } from '@ai-sdk/anthropic'` (NOT `'ai/providers/anthropic'`).
- **Prisma:** exact accessor names from schema (see §2). Access via `src/lib/db.ts` singleton. DB-mutating actions MUST have a `*.test.ts` with DB-mocked ACs.

---

## 2. Data model — `prisma/schema.prisma`

```prisma
model Game {
  id        String     @id @default(cuid())
  code      String     @unique
  status    GameStatus @default(LOBBY)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  players   Player[]
  rounds    Round[]
}

enum GameStatus { LOBBY  IN_PROGRESS  FINISHED }

model Player {
  id       String   @id @default(cuid())
  gameId   String
  name     String
  isAI     Boolean  @default(false)
  score    Int      @default(0)
  title    String?
  joinedAt DateTime @default(now())
  game     Game     @relation(fields: [gameId], references: [id])
  messages Message[]
  votes    Vote[]   @relation("VoterVotes")
  votedBy  Vote[]   @relation("VotedForVotes")
  @@index([gameId])
}

model Round {
  id        String      @id @default(cuid())
  gameId    String
  number    Int
  prompt    String
  status    RoundStatus @default(CHAT)
  createdAt DateTime    @default(now())
  game      Game        @relation(fields: [gameId], references: [id])
  messages  Message[]
  votes     Vote[]
  @@unique([gameId, number])
  @@index([gameId])
}

enum RoundStatus { CHAT  VOTING  REVEAL }

model Message {
  id        String   @id @default(cuid())
  roundId   String
  playerId  String
  content   String
  createdAt DateTime @default(now())
  round     Round    @relation(fields: [roundId], references: [id])
  player    Player   @relation(fields: [playerId], references: [id])
  @@index([roundId])
}

model Vote {
  id         String   @id @default(cuid())
  roundId    String
  voterId    String
  votedForId String
  createdAt  DateTime @default(now())
  round      Round    @relation(fields: [roundId], references: [id])
  voter      Player   @relation("VoterVotes",    fields: [voterId],    references: [id])
  votedFor   Player   @relation("VotedForVotes", fields: [votedForId], references: [id])
  @@unique([roundId, voterId])
  @@index([roundId])
}
```

**Prisma accessor names (exact — coder must use these):**
- `db.game` · `db.player` · `db.round` · `db.message` · `db.vote`
- Field names: `Game.code`, `Game.status`, `Player.isAI`, `Player.score`, `Player.title`, `Round.number`, `Round.prompt`, `Round.status`, `Vote.voterId`, `Vote.votedForId`

---

## 3. File & folder inventory

**Canonical path universe. Every story's `**Files to create/modify:**` MUST draw paths from here.**

| Path | Kind | Purpose |
|---|---|---|
| `prisma/schema.prisma` | data | Game/Player/Round/Message/Vote models |
| `src/lib/db.ts` | lib | Prisma client singleton (`globalThis` guard) |
| `src/lib/game-code.ts` | lib | generate unique 6-char game codes |
| `src/lib/scoring.ts` | lib | per-round score deltas + title assignment logic |
| `src/lib/ai-player.ts` | lib | generate AI chat message via Vercel AI SDK |
| `src/lib/validation.ts` | lib | Zod schemas for all action inputs |
| `src/app/actions/game.ts` | server | `createGame`, `joinGame`, `startGame` |
| `src/app/actions/round.ts` | server | `startRound`, `submitMessage`, `submitVote`, `revealRound` |
| `src/app/actions/ai.ts` | server | `generateAIMessage` — calls `ai-player.ts`, saves Message |
| `src/app/api/game/[code]/state/route.ts` | route | GET: returns current game state JSON for polling |
| `src/app/layout.tsx` | route | root layout |
| `src/app/page.tsx` | route | home — create or join a game |
| `src/app/lobby/[code]/page.tsx` | route | lobby waiting room (shows players, start button) |
| `src/app/game/[code]/page.tsx` | route | active game — chat + voting per round |
| `src/app/game/[code]/results/page.tsx` | route | post-round reveal + leaderboard |
| `src/components/CreateGameForm.tsx` (+ `.test.tsx`) | client | form to create a new game |
| `src/components/JoinGameForm.tsx` (+ `.test.tsx`) | client | form to join by code + name |
| `src/components/PlayerList.tsx` (+ `.test.tsx`) | server | lists players in lobby/leaderboard |
| `src/components/ChatPanel.tsx` (+ `.test.tsx`) | client | scrollable message list for a round |
| `src/components/MessageInput.tsx` (+ `.test.tsx`) | client | text input → `submitMessage`; disabled after submit |
| `src/components/VotingPanel.tsx` (+ `.test.tsx`) | client | shows player list; each vote → `submitVote` |
| `src/components/RoundReveal.tsx` (+ `.test.tsx`) | client | shows who was AI, score deltas, per-player title |
| `src/components/Leaderboard.tsx` (+ `.test.tsx`) | server | final game leaderboard with titles |
| `src/components/ui/*` | ui | shadcn primitives (button, input, card, badge, avatar) — add as stories need |
| `src/lib/game-code.test.ts` | test | unit tests for game code generator |
| `src/lib/scoring.test.ts` | test | unit tests for scoring + title logic |
| `src/lib/ai-player.test.ts` | test | unit tests for AI message generation (mocked AI SDK) |
| `src/app/actions/game.test.ts` | test | DB-mocked tests for game actions |
| `src/app/actions/round.test.ts` | test | DB-mocked tests for round actions |
| `src/app/actions/ai.test.ts` | test | DB-mocked tests for AI message action |

---

## 4. Conventions (coder house rules)

- **Data access:** all game-state mutations go through Server Actions in `src/app/actions/*.ts`. No `app/api/*` route handlers for mutations (the state polling endpoint is read-only).
- **Prisma client:** exactly one, via `src/lib/db.ts` — `globalThis` singleton pattern.
- **Validation:** every action validates input with a Zod schema from `src/lib/validation.ts`. Order: `z.string().trim().min(1)` — trim FIRST, min after. Return early with error if invalid.
- **AI calls:** use `generateText` from `'ai'`; model `import { anthropic } from '@ai-sdk/anthropic'`. Never fetch Anthropic's REST API directly.
- **Components:** Server Components by default; add `"use client"` only for interactive forms/panels. Read-only displays (PlayerList, Leaderboard) are server components.
- **Styling:** shadcn/ui for primitives, Tailwind utilities for layout. No standalone `.css` files beyond the scaffold's `globals.css`.
- **Tests:** co-located `*.test.tsx` / `*.test.ts` beside source; Vitest + RTL; DB-mutating actions get `vi.mock('@/lib/db')` mocked tests.
- **Imports:** `@/*` alias for everything under `src/`.
- **Game sessions are ephemeral** — no auth; players identify by `playerId` stored in `sessionStorage` client-side.

---

## 5. Game flow (overview)

```
Host creates game → gets 6-char code
Players join lobby (code + name) → Player rows created
Host starts game → Game.status = IN_PROGRESS; AI player auto-created
  For each round (3–5 rounds):
    startRound → Round created (prompt assigned), Round.status = CHAT
    All 6 players submit a message (humans + AI via generateAIMessage)
    Host advances → Round.status = VOTING
    Each player votes for who they think is AI
    Host advances → Round.status = REVEAL; scores computed
    RoundReveal shows: who was AI, vote distribution, score deltas
  After all rounds → Game.status = FINISHED
  Leaderboard + titles displayed
```

---

## 6. Scoring & titles

**Per-round scoring (in `src/lib/scoring.ts`):**
- Human correctly identifies AI (+3 points)
- Human who nobody voted for (+1 bonus — blended in well)
- AI was not identified by majority (−1 penalty for humans who voted wrong; +2 for AI "player" internal score tracking)

**Titles (assigned at game end, from `src/lib/scoring.ts`):**
- 🥇 `"The Detector"` — human with most correct AI identifications
- 🤖 `"Almost Human"` — human nobody ever voted for
- 🕵️ `"The Suspicious One"` — human most voted for across all rounds
- 👑 `"Champion"` — overall highest score
- 🦾 `"Convincing Bot"` — AI was identified by fewest players across all rounds

---

## 7. Epic decomposition

- **Epic 1 — Data & game setup:** Prisma singleton + schema migrations + game/player creation actions + home page.
- **Epic 2 — Lobby & round chat:** join game → lobby page → start round → chat panel with message submission for all players.
- **Epic 3 — AI player:** AI message generation via Vercel AI SDK, context-aware response blending with humans.
- **Epic 4 — Voting & scoring:** voting panel → round reveal → score computation + titles.
- **Epic 5 — Leaderboard & polish:** final leaderboard page, per-player title badges, game restart.
