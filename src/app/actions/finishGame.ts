'use server'

import { db } from "@/lib/db"
import { assignTitles } from "@/lib/scoring"

export async function finishGame({ gameId }: { gameId: string }) {
  const players = await db.player.findMany({
    where: { gameId },
    select: { id: true, name: true, score: true, isAI: true },
  })

  const rounds = await db.round.findMany({
    where: { gameId },
    select: { id: true },
  })
  const roundIds = rounds.map((r) => r.id)

  const votes = await db.vote.findMany({
    where: { roundId: { in: roundIds } },
    select: { voterId: true, votedForId: true, roundId: true },
  })

  const aiPlayer = players.find((p) => p.isAI)
  if (!aiPlayer) {
    throw new Error("AI player not found")
  }
  const aiPlayerId = aiPlayer.id

  const titles = assignTitles({
    players: players.map((p) => ({ id: p.id, name: p.name, score: p.score })),
    allRoundVotes: votes,
    aiPlayerId,
  })

  for (const { playerId, title } of titles) {
    await db.player.update({
      where: { id: playerId },
      data: { title },
    })
  }

  await db.game.update({
    where: { id: gameId },
    data: { status: 'FINISHED' },
  })

  return { ok: true }
}