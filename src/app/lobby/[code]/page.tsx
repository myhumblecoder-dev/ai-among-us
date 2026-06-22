export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { PlayerList } from '@/components/PlayerList';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface LobbyPageProps {
  params: {
    code: string;
  };
}

async function getGameState(code: string) {
  const game = await db.game.findUnique({
    where: { code },
    include: {
      players: true,
    },
  });

  if (!game) {
    return null;
  }

  return game;
}

async function startGameAction(formData: FormData) {
  const gameId = formData.get('gameId') as string;
  const hostPlayerId = formData.get('hostPlayerId') as string;

  if (!gameId || !hostPlayerId) {
    throw new Error('Missing gameId or hostPlayerId');
  }

  await db.game.update({
    where: { id: gameId },
    data: {
      status: 'IN_PROGRESS',
    },
  });

  revalidatePath(`/lobby/${formData.get('code')}`);
  redirect(`/game/${gameId}`);
}

export default async function LobbyPage({ params: { code } }: LobbyPageProps) {
  const game = await getGameState(code);

  if (!game) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    );
  }

  // In a real app, we'd identify the current user's player ID from session/auth.
  // For this implementation, we'll pick the first player as the host if available.
  const hostPlayerId = game.players.length > 0 ? game.players[0].id : '';

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Lobby</h1>
        <div className="flex items-center justify-center gap-2">
          <label htmlFor="game-code" className="text-sm font-medium text-muted-foreground">
            Game code:
          </label>
          <code id="game-code" className="rounded bg-muted px-2 py-1 font-mono text-sm">
            {game.code}
          </code>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        <PlayerList players={game.players} revealAI={false} />

        {game.players.length >= 2 && (
          <form action={startGameAction} className="pt-4">
            <input type="hidden" name="gameId" value={game.id} />
            <input type="hidden" name="code" value={game.code} />
            <input type="hidden" name="hostPlayerId" value={hostPlayerId} />
            <Button type="submit" className="w-full text-lg py-6">
              Start Game
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
