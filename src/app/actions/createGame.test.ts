import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import { createGame } from './createGame'
import type { Game, Player } from '@prisma/client'

vi.mock('@/lib/db', () => ({
  db: {
    game: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    player: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    round: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    message: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    vote: {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock generateGameCode to be deterministic for the test
vi.mock('@/lib/game-code', () => ({
  generateGameCode: () => 'ABC123',
}))

describe('createGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error and does not call db.game.create when hostName is invalid (empty/whitespace)', async () => {
    const result = await createGame({ hostName: '   ' })

    expect(result).toEqual({ error: 'Invalid input' })
    expect(db.game.create).not.toHaveBeenCalled()
  })

  it('successfully creates a game and a player for a valid hostName', async () => {
    const mockGame = { id: 'g1', code: 'ABC123' } as Game
    const mockPlayer = { id: 'p1' } as Player

    vi.mocked(db.game.create).mockResolvedValue(mockGame)
    vi.mocked(db.player.create).mockResolvedValue(mockPlayer)

    const hostName = 'Alice'
    const result = await createGame({ hostName: hostName })

    // Verify return value
    expect(result).toEqual({
      gameId: 'g1',
      code: 'ABC123',
      playerId: 'p1',
    })

    // Verify DB calls
    expect(db.game.create).toHaveBeenCalledWith({
      data: {
        code: 'ABC123',
        status: 'LOBBY',
      },
    })

    expect(db.player.create).toHaveBeenCalledWith({
      data: {
        gameId: 'g1',
        name: 'Alice',
        isAI: false,
      },
    })
  })
})
