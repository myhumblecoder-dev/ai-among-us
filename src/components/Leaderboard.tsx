import React from 'react'

interface Player {
  id: string
  name: string
  score: number
  title: string | null
  isAI: boolean
}

interface LeaderboardProps {
  players: Player[]
}

export function Leaderboard({ players }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Player</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">Score</th>
            {players.some((p) => p.title !== null) && (
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Title</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedPlayers.map((player) => (
            <tr key={player.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-2 font-medium">
                {player.isAI ? `🤖 ${player.name}` : player.name}
              </td>
              <td className="px-4 py-2 text-right tabular-nums">
                {player.score.toLocaleString()}
              </td>
              {player.title !== null && (
                <td className="px-4 py-2 text-muted-foreground italic">
                  {player.title}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}