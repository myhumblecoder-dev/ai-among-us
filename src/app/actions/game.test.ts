import { describe, it, expect } from 'vitest'
import { createGame, joinGame, startGame, finishGame } from './game'

describe('game', () => {
  it('the barrel re-exports createGame joinGame and startGame each as a function', () => {
    expect(typeof createGame).toBe('function')
    expect(typeof joinGame).toBe('function')
    expect(typeof startGame).toBe('function')
  })

  it('the barrel re-exports finishGame as a function', () => {
    expect(typeof finishGame).toBe('function')
  })
})
