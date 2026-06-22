import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const game = await db.game.findUnique({
      where: { code },
      include: {
        players: true,
        rounds: {
          include: {
            messages: {
              include: {
                player: true,
              },
            },
            votes: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Not found' }, {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(game, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}