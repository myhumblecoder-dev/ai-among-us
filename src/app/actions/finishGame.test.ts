import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import type { Game, Player, Round, Vote } from '@prisma/client'
import { finishGame } from './finishGame'

vi.mock('@/lib/db', () => ({
  db: {
    game: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    player: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    round: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    message: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    vote: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
  },
}))

const GAME_ID = 'g1';

const AI_PLAYER: Player =
  { id: 'ai1', name: 'Bot', score: 0, isAI: true, gameId: 'g1', title: null, joinedAt: new Date(0), updatedAt: new Date(0) } as Player;
const HUMAN_PLAYER: Player =
  { id: 'p1',  name: 'Alice', score: 3, isAI: false, gameId: 'g1', title: null, joinedAt: new Date(0), updatedAt: new Date(0) } as Player;

const ROUND: Round = { id: 'r1', gameId: 'g1', number: 1, prompt: '', status: 'CHAT', createdAt: new Date(0) } as Round;

const VOTE: Vote =
  { id: 'v1', voterId: 'p1', votedForId: 'p1', roundId: 'r1', createdAt: new Date(0) } as Vote;

describe('finishGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.player.findMany).mockResolvedValue([AI_PLAYER, HUMAN_PLAYER]);
    vi.mocked(db.round.findMany).mockResolvedValue([ROUND]);
    vi.mocked(db.vote.findMany).mockResolvedValue([VOTE]);
    vi.mocked(db.player.update).mockResolvedValue({ ...HUMAN_PLAYER, title: 'Winner' } as Player);
    vi.mocked(db.game.update).mockResolvedValue({ id: GAME_ID, code: 'ABC123', status: 'FINISHED', createdAt: new Date(0), updatedAt: new Date(0) } as Game);
  });

  it('finishGame updates game status to FINISHED', async () => {
    await finishGame({ gameId: GAME_ID });
    expect(vi.mocked(db.game.update)).toHaveBeenCalledOnce();
    expect(vi.mocked(db.game.update)).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: GAME_ID },
      data: { status: 'FINISHED' }
    }));
  });

  it('finishGame updates each player with assigned title', async () => {
    await finishGame({ gameId: GAME_ID });
    // assignTitles returns titles for players. In our fixture, only p1 (human) gets a title update call.
    // The AI player is excluded from the update loop by the logic in finishGame.ts
    expect(vi.mocked(db.player.update)).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'p1' }
    }));
  });
});