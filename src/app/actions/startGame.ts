'use server'

import { db } from '@/lib/db'

export async function startGame({ gameId, hostPlayerId: _hostPlayerId }: { gameId: string; hostPlayerId: string }) {
  await db.game.update({ where: { id: gameId }, data: { status: 'IN_PROGRESS' } })
  await db.player.create({ data: { gameId, name: 'ARIA', isAI: true } })
  return { ok: true }
}
