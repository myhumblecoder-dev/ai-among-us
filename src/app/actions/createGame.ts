'use server'

import { db } from '@/lib/db'
import { generateGameCode } from '@/lib/game-code'
import { createGameSchema } from '@/lib/validation'

export async function createGame({ hostName }: { hostName: string }) {
  const validation = createGameSchema.safeParse({ hostName: hostName.trim() })

  if (!validation.success) {
    return { error: 'Invalid input' }
  }

  const code = generateGameCode()

  const game = await db.game.create({
    data: {
      code,
      status: 'LOBBY',
    },
  })

  const player = await db.player.create({
    data: {
      gameId: game.id,
      name: hostName.trim(),
      isAI: false,
    },
  })

  return {
    gameId: game.id,
    code: game.code,
    playerId: player.id,
  }
}