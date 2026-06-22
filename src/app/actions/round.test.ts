import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'
import type { Round, Message } from '@prisma/client'
import { startRound, submitMessage } from '@/app/actions/round'

vi.mock('@/lib/db', () => ({
  db: {
    game: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    player: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    round: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    message: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
    vote: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), deleteMany: vi.fn(), upsert: vi.fn(), count: vi.fn() },
  },
}))

const makeRound = (overrides: Partial<Round> = {}): Round =>
  ({
    id: '',
    gameId: '',
    number: 0,
    prompt: '',
    status: 'CHAT',
    createdAt: new Date(Date.UTC(2024, 0, 1)),
    ...overrides,
  } as unknown as Round)

const makeMessage = (overrides: Partial<Message> = {}): Message =>
  ({
    id: '',
    roundId: '',
    playerId: '',
    content: '',
    createdAt: new Date(Date.UTC(2024, 0, 1)),
    ...overrides,
  } as unknown as Message)

describe('round', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('startRound calls db.round.create with status CHAT and returns roundId', async () => {
    const gameId = 'game-123'
    const roundNumber = 1
    const prompt = 'Hello world'
    const createdRound = makeRound({ id: 'round-123', gameId, number: roundNumber, prompt, status: 'CHAT' })
    
    vi.mocked(db.round.create).mockResolvedValue(createdRound)

    const res = await startRound(gameANDId, roundNumber, prompt)

    expect(db.round.create).toHaveBeenCalledWith({
      data: {
        gameId,
        number: roundNumber,
        prompt,
        status: 'CHAT',
      },
    })
    expect(res).toEqual({ roundId: 'round-123' })
  })

  it('submitMessage with whitespace-only content returns Message required and does not call db.message.create', async () => {
    const input = {
      roundId: 'round-123',
      playerId: 'player-123',
      content: '   ',
    }

    const res = await submitMessage(input)

    expect(res).toEqual({ error: 'Message required' })
    expect(db.message.create).not.toHaveBeenCalled()
  })

  it('submitMessage with valid content calls db.message.create with the trimmed content', async () => {
    const input = {
      roundId: 'round-123',
      playerId: 'player-123',
      content: '  hello  ',
    }
    const createdMessage = makeMessage({ id: 'msg-123', roundId: 'round-123', playerId: 'player-123', content: 'hello' })
    
    vi.mocked(db.message.create).mockResolvedValue(createdMessage)

    const res = await submitMessage(input)

    expect(db.message.create).toHaveBeenCalledWith({
      data: {
        roundId: 'round-123',
        playerId: 'player-123',
        content: 'hello',
      },
    })
    expect(res).toEqual({ messageId: 'msg-123' })
  })
})

// Helper to fix the typo in the scaffold's variable name if it were present
const gameANDId = 'game-123'