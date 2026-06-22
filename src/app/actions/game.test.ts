import { describe, it, expect } from 'vitest'
import { createGame, joinGame, startGame } from './game'

describe('game', () => {
  it('the barrel re-exports createGame joinGame and startGame each as a function', () => {
    expect(typeof createGame).toBe('function')
    expect(typeof joinGame).toBe('function')
    expect(typeof startGame).toBe('function')
  })
})
