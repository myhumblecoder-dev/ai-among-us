interface Player {
  id: string;
  name: string;
  isAI: boolean;
}

interface PlayerListProps {
  players: Player[];
  revealAI?: boolean;
}

export function PlayerList({ players, revealAI = false }: PlayerListProps) {
  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li key={player.id} className="text-sm">
          {player.name}
          {player.isAI && revealAI && " (AI)"}
        </li>
      ))}
    </ul>
  );
}