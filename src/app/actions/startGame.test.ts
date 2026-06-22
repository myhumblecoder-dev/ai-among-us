import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { startGame } from './startGame'

vi.mock('@/lib/db', () => ({
  db: {
    game: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    player: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    round: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    message: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    vote: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
  },
}))

describe('startGame', () => {
  beforeEach(() => {
    vi.mocked(db.game.update).mockClear()
    vi.mocked(db.player.create).mockClear()
    vi.mocked(db.game.update).mockResolvedValue({
      id: 'g1',
      code: 'ABCD',
      status: 'IN_PROGRESS' as never,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    })
    vi.mocked(db.player.create).mockResolvedValue({
      id: 'ai-player-1',
      gameId: 'g1',
      name: 'ARIA',
      isAI: true,
      score: 0,
      title: null,
      joinedAt: new Date(0),
    })
  })

  it('returns { ok: true }', async () => {
    const result = await startGame({ gameId: 'g1', hostPlayerId: 'p1' })
    expect(result).toEqual({ ok: true })
  })

  it('calls db.game.update once with the correct arguments to set status to IN_PROGRESS', async () => {
    await startGame({ gameId: 'g1', hostPlayerId: 'p1' })
    expect(vi.mocked(db.game.update)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(db.game.update)).toHaveBeenCalledWith({
      where: { id: 'g1' },
      data: { status: 'IN_PROGRESS' },
    })
  })

  it('calls db.player.create once with gameId, name ARIA, and isAI true', async () => {
    await startGame({ gameId: 'g1', hostPlayerId: 'p1' })
    expect(vi.mocked(db.player.create)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(db.player.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gameId: 'g1',
          name: 'ARIA',
          isAI: true,
        }),
      })
    )
  })
})
