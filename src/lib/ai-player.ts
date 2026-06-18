import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

interface PriorMessage {
  playerName: string;
  content: string;
}

interface GenerateAIMessageParams {
  prompt: string;
  priorMessages: PriorMessage[];
}

/**
 * Generates a response for an AI player in a party game context.
 * The AI acts as a human player, responding casually to the round prompt
 * while considering the context of previous messages in the round.
 */
export async function generateAIMessage({
  prompt,
  priorMessages,
}: GenerateAIMessageParams): Promise<string> {
  const systemPrompt = `You are a human player at a party game. 
    Answer the following round prompt in 1–3 casual sentences. 
    Do not mention being an AI, an LLM, or a language model. 
    Stay in character as a person participating in the game.`;

  let contextString = '';
  if (priorMessages.length > 0) {
    const chatExcerpt = priorMessages
      .map((m) => `${m.playerName}: ${m.content}`)
      .join('\n');
    contextString = `\n\nPrior chat excerpt:\n${chatExcerpt}`;
  }

  const userContent = `Round Prompt: ${prompt}${contextString}`;

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userContent,
      },
    ],
  });

  return text.trim();
}