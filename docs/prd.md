# PRD — almost-human

*Lean scope anchor. The architecture + epics are the implementation guide; this bounds the MVP.*

---

## 1. Problem

A party game for 6 players where 1 is secretly an LLM and 5 are human. Each round all players respond to a prompt, then everyone votes to expose the AI. Points reward accurate detection (and successful deception). A leaderboard + titles close each session.

---

## 2. Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | Host creates a game and receives a 6-char join code |
| FR-2 | Up to 5 human players join via code + name; 1 AI player auto-joins on game start |
| FR-3 | Each round: all players (human + AI) respond to a prompt in a shared chat panel |
| FR-4 | After chat phase: every human player casts one vote for who they think is the AI |
| FR-5 | After voting: a reveal screen shows who the AI was, vote distribution, and score deltas |
| FR-6 | Scoring: +3 for correct AI ID; +1 human "blended in" bonus; AI score tracked internally |
| FR-7 | Titles assigned at game end: The Detector, Almost Human, The Suspicious One, Champion, Convincing Bot |
| FR-8 | Final leaderboard shows all players, cumulative scores, and assigned titles |
| FR-9 | Game state is pollable by all clients via `GET /api/game/[code]/state` |
| FR-10 | AI response is generated per-round via Vercel AI SDK (anthropic model) with full round chat context |

---

## 3. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Stack: Next.js 16 App Router + TypeScript + Tailwind v4 + shadcn/ui + Prisma v6 + Vercel AI SDK |
| NFR-2 | No auth — players identified by name + game code; `playerId` stored client-side in sessionStorage |
| NFR-3 | 6-player sessions only (1 AI + 5 humans); no spectators for MVP |
| NFR-4 | Validation via Zod; `trim().min(1)` ordering enforced |
| NFR-5 | All DB-mutating server actions must have co-located DB-mocked Vitest tests |

---

## 4. MVP scope (in)

- Create and join games via 6-char code
- Lobby waiting room (shows joined players, start button for host)
- Per-round prompt-based chat (3–5 rounds per session)
- AI auto-joins on start; generates one message per round via Vercel AI SDK
- Human-only voting phase; one vote per player per round
- Round reveal: who was AI + vote tallies + score deltas
- Per-round scoring + title computation
- Final leaderboard page with titles

---

## 5. Out of scope (explicit)

- Authentication / user accounts
- Spectator mode
- Real-time WebSocket push (polling is sufficient for MVP)
- Custom round prompts (host-supplied) — prompts are predefined
- Mobile-native app
- Payments or premium features
- Persistent cross-session player history
