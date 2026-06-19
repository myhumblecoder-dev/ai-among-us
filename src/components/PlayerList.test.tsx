import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlayerList } from './PlayerList'

describe('PlayerList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all player names; does NOT show (AI) when revealAI is omitted or false; shows (AI) next to the AI player\'s name when revealAI is true', async () => {
    const players = [
      { id: '1', name: 'Alice', isAI: false },
      { id: '2', name: 'Bot', isAI: true },
    ]

    // 1. Test: renders all player names; does NOT show (AI) when revealAI is omitted
    const { rerender } = render(<PlayerList players={players} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bot')).toBeInTheDocument()
    expect(screen.queryByText(/\(AI\)/)).toBeNull()

    // 2. Test: does NOT show (AI) when revealAI is false
    rerender(<PlayerList players={players} revealAI={false} />)
    expect(screen.queryByText(/\(AI\)/)).toBeNull()

    // 3. Test: shows (AI) next to the AI player's name when revealAI is true
    rerender(<PlayerList players={players} revealAI={true} />)
    expect(screen.getByText('Bot (AI)')).toBeInTheDocument()
  })
})
