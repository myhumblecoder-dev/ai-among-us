import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateText } from 'ai'
import { generateAIMessage } from './ai-player'

vi.mock('ai', () => ({
  generateText: vi.fn(),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn().mockReturnValue('claude-haiku-4-5'),
}))

describe('ai-player', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls generateText with the correct prompt and prior chat context', async () => {
    const prompt = 'What is your favorite food?'
    const priorMessages = [
      { playerName: 'Alice', content: 'I love pizza!' },
      { playerName: 'Bob', content: 'Tacos are the best.' },
    ]

    vi.mocked(generateText).mockResolvedValue({
      text: '  I am a huge fan of sushi. It is so fresh!  ',
    })

    const result = await generateAIMessage({ prompt, priorMessages })

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: expect.stringContaining(
              'Round Prompt: What is your favorite food?\n\nPrior chat excerpt:\nAlice: I love pizza!\nBob: Tacos are the best.',
            ),
          },
        ],
      }),
    )
    expect(result).toBe('I am a huge fan of sushi. It is so fresh!')
  })

  it('works correctly when priorMessages is empty', async () => {
    const prompt = 'Tell a joke.'
    const priorMessages: { playerName: string; content: string }[] = []

    vi.mocked(generateText).mockResolvedValue({
      text: 'Why did the chicken cross the road? To get to the other side!',
    })

    await generateAIMessage({ prompt, priorMessages })

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: 'user',
            content: 'Round Prompt: Tell a joke.',
          },
        ],
      }),
    )
  })

  it('returns the trimmed text from the generated response', async () => {
    const prompt = 'Test prompt'
    vi.mocked(generateText).mockResolvedValue({
      text: '   Spaced response   ',
    })

    const result = await generateAIMessage({ prompt, priorMessages: [] })
    expect(result).toBe('Spaced response')
  })
})
