import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Leaderboard } from './Leaderboard'

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Leaderboard renders', async () => {
    const players = [
      { id: '1', name: 'Alice', score: 100, title: 'Champion', isAI: false },
      { id: '2', name: 'Bot', score: 200, title: null, isAI: true },
      { id: '3', name: 'Bob', score: 150, title: 'Runner-up', isAI: false },
    ]

    render(<Leaderboard players={players} />)

    // Verify sorting (200, 150, 100)
    const rows = screen.getAllByRole('row')
    // Index 0 is the header row, so index 1 is the first player
    expect(rows[1]).toHaveTextContent('🤖 Bot')
    expect(rows[2]).toHaveTextContent('Bob')
    expect(rows[3]).toHaveTextContent('Alice')

    // Verify scores
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()

    // Verify titles
    expect(screen.getByText('Champion')).toBeInTheDocument()
    expect(screen.getByText('Runner-up')).toBeInTheDocument()

    // Verify AI prefix
    expect(screen.getByText('🤖 Bot')).toBeInTheDocument()

    // Verify column presence (Title column should exist because some players have titles)
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument()
  })

  it('renders without title column when no players have titles', async () => {
    const players = [
      { id: '1', name: 'Alice', score: 100, title: null, isAI: false },
      { id: '2', name: 'Bot', score: 200, title: null, isAI: true },
    ]

    render(<Leaderboard players={players} />)

    expect(screen.queryByRole('columnheader', { name: 'Title' })).toBeNull()
  })
})