'use server'

import { db } from '@/lib/db'
import { joinGameSchema } from '@/lib/validation'

export async function joinGame(input: { code: string; playerName: string }) {
  const result = joinGameSchema.safeParse(input)
  if (!result.success) {
    return { error: 'Invalid input' }
  }

  const { code, playerName } = result.data

  const game = await db.game.findUnique({ where: { code } })
  if (!game) {
    return { error: 'Game not found' }
  }

  if (game.status !== 'LOBBY') {
    return { error: 'Game already started' }
  }

  const player = await db.player.create({
    data: {
      gameId: game.id,
      name: playerName,
      isAI: false,
    },
  })

  return { gameId: game.id, playerId: player.id }
}
