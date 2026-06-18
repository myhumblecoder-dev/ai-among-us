import { describe, it, expect } from 'vitest'
import { generateGameCode } from './game-code'

describe('game-code', () => {
  it('generateGame eslint/logic: returns a string of length exactly 6; all characters match /^[A-Z0-9]$/; 100 calls produce no duplicates (collision resistance spot-check)', () => {
    const codes = new Set<string>()
    const iterations = 100
    const alphanumericRegex = /^[A-Z0-9]+$/

    for (let i = 0; i < iterations; i++) {
      const code = generateGameCode()

      // Verify length
      expect(code).toHaveLength(6)

      // Verify character set
      expect(code).toMatch(alphanumericRegex)

      // Collect for collision check
      codes.add(code)
    }

    // Verify no duplicates in 100 runs
    expect(codes.size).toBe(iterations)
  })
})