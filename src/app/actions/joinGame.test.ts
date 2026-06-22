import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { joinGame } from './joinGame'

vi.mock('@/lib/db', () => ({
  db: {
    game: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    player: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    round: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    message: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    vote: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
  },
}))

describe('joinGame', () => {
  beforeEach(() => {
    vi.mocked(db.game.findUnique).mockClear()
    vi.mocked(db.player.create).mockClear()
  })

  it('returns { error: "Game not found" } when db.game.findUnique resolves null and does NOT call db.player.create', async () => {
    vi.mocked(db.game.findUnique).mockResolvedValue(null)

    const result = await joinGame({ code: 'ABCDEF', playerName: 'Bob' })

    expect(result).toEqual({ error: 'Game not found' })
    expect(db.game.findUnique).toHaveBeenCalledWith({ where: { code: 'ABCDEF' } })
    expect(db.player.create).not.toHaveBeenCalled()
  })

  it('returns { error: "Game already started" } when game.status is IN_PROGRESS and does NOT call db.player.create', async () => {
    vi.mocked(db.game.findUnique).mockResolvedValue({
      id: 'g1',
      status: 'IN_PROGRESS',
      code: 'ABCDEF',
      createdAt: new Date(Date.UTC(2024, 0, 1)),
      updatedAt: new Date(Date.UTC(2024, 0, 1)),
    } as never)

    const result = await joinGame({ code: 'ABCDEF', playerName: 'Bob' })

    expect(result).toEqual({ error: 'Game already started' })
    expect(db.player.create).not.toHaveBeenCalled()
  })

  it('calls db.player.create and returns { gameId, playerId } when game.status is LOBBY', async () => {
    vi.mocked(db.game.findUnique).mockResolvedValue({
      id: 'g1',
      status: 'LOBBY',
      code: 'ABCDEF',
      createdAt: new Date(Date.UTC(2024, 0, 1)),
      updatedAt: new Date(Date.UTC(2024, 0, 1)),
    } as never)
    vi.mocked(db.player.create).mockResolvedValue({
      id: 'p2',
      gameId: 'g1',
      name: 'Bob',
      isAI: false,
      score: 0,
      title: null,
      joinedAt: new Date(Date.UTC(2024, 0, 1)),
    } as never)

    const result = await joinGame({ code: 'ABCDEF', playerName: 'Bob' })

    expect(result).toEqual({ gameId: 'g1', playerId: 'p2' })
    expect(db.player.create).toHaveBeenCalledTimes(1)
    expect(db.player.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Bob',
        isAI: false,
        gameId: 'g1',
      }),
    })
  })

  it('returns { error: "Invalid input" } when code length is not 6 and does NOT call the DB', async () => {
    const result = await joinGame({ code: '12', playerName: 'Bob' })

    expect(result).toEqual({ error: 'Invalid input' })
    expect(db.game.findUnique).not.toHaveBeenCalled()
    expect(db.player.create).not.toHaveBeenCalled()
  })
})
