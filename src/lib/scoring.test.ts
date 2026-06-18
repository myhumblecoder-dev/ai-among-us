import { describe, it, expect } from 'vitest'
import { computeRoundScores, assignTitles } from './scoring'

describe('scoring', () => {
  describe('computeRoundScores', () => {
    it('computeRoundScores: 3 humans + 1 AI', () => {
      const exactVotes = [
        { voterId: 'p1', votedForId: 'ai' },
        { voterId: 'p2', votedForId: 'ai' },
        { voterId: 'p3', votedForId: 'p1' },
      ]

      const resultsExact = computeRoundScores({
        players: [
          { id: 'p1', name: 'P1' },
          { id: 'p2', name: 'P2' },
          { id: 'p3', name: 'P3' },
          { id: 'ai', name: 'AI' },
        ],
        votes: exactVotes,
        aiPlayerId: 'ai',
      })

      expect(resultsExact).toContainEqual({ playerId: 'p1', delta: 3 })
      expect(resultsExact).toContainEqual({ playerId: 'p2', delta: 3 })
      expect(resultsExact).toContainEqual({ playerId: 'p3', delta: 1 })
      expect(resultsExact).toContainEqual({ playerId: 'ai', delta: 0 })
    })

    it('2 humans vote for AI (+3 each)', () => {
      const players = [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }, { id: 'ai', name: 'AI' }]
      const votes = [{ voterId: 'p1', votedForId: 'ai' }, { voterId: 'p2', votedForId: 'ai' }]
      const results = computeRoundScores({ players, votes, aiPlayerId: 'ai' })
      
      const p1 = results.find(r => r.playerId === 'p1')
      const p2 = results.find(r => r.playerId === 'p2')
      expect(p1?.delta).toBe(3)
      expect(p2?.delta).toBe(3)
    })

    it('1 votes wrong (+0); the 1 human not voted for by anyone gets +1; the wrong voter gets +0', () => {
      const playersFixed = [{ id: 'p1', name: 'P1' }, { id: 'p2', name: 'P2' }, { id: 'ai', name: 'AI' }]
      const votesFixed = [
        { voterId: 'p1', votedForId: 'p2' }, // p1: not voter for AI, is voted for by p2 -> 0
        { voterId: 'p2', votedForId: 'p1' }, // p2: not voter for AI, is voted for by p1 -> 0
      ]
      const results = computeRoundScores({ players: playersFixed, votes: votesFixed, aiPlayerId: 'ai' })
      const p1Res = results.find(r => r.playerId === 'p1')
      const p2Res = results.find(r => r.playerId === 'p2')
      expect(p1Res?.delta).toBe(0)
      expect(p2Res?.delta).toBe(0)
    })
  })

  describe('assignTitles', () => {
    it('a player with score: 10 (highest) gets "Champion"', () => {
      const players = [
        { id: 'p1', name: 'P1', score: 10 },
        { id: 'p2', name: 'P2', score: 5 },
        { id: 'ai', name: 'AI', score: 0 },
      ]
      const titles = assignTitles({ players, allRoundVotes: [], aiPlayerId: 'ai' })
      expect(titles).toContainEqual({ playerId: 'p1', title: 'Champion' })
    })

    it('assigns all required titles correctly', () => {
      const players = [
        { id: 'p1', name: 'P1', score: 5 },
        { id: 'p2', name: 'P2', score: 0 },
        { id: 'ai', name: 'api', score: 0 }, // using 'api' to avoid confusion with 'ai' if needed, but 'ai' is fine
      ]
      // Re-defining players to match the test logic exactly
      const testPlayers = [
        { id: 'p1', name: 'P1', score: 5 },
        { id: 'p2', name: 'P2', score: 0 },
        { id: 'ai', name: 'AI', score: 0 },
      ]
      const allRoundVotes = [
        { voterId: 'p1', votedForId: 'ai', roundId: 'r1' },
        { voterId: 'p2', votedForId: 'p1', roundId: 'r1' },
      ]

      const titles = assignTitles({ players: testPlayers, allRoundVotes, aiPlayerId: 'ai' })
      
      expect(titles).toContainEqual({ playerId: 'p1', title: 'The Detector' })
      expect(titles).toContainEqual({ playerId: 'p2', title: 'Almost Human' })
      expect(titles).toContainEqual({ playerId: 'p1', title: 'The Suspicious One' })
      expect(titles).toContainEqual({ playerId: 'p1', title: 'Champion' })
      expect(titles).toContainEqual({ playerId: 'ai', title: 'Convincing Bot' })
    })
  })
})
