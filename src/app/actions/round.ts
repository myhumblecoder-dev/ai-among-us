import { db } from "@/lib/db";
import { z } from "zod";

export const submitMessageSchema = z.object({
  roundId: z.string(),
  playerId: z.string(),
  content: z.string().trim().min(1),
});

export type SubmitMessageInput = z.infer<typeof submitMessageSchema>;

export async function startRound(
  gameId: string,
  roundNumber: number,
  prompt: string
) {
  const round = await db.round.create({
    data: {
      gameId,
      number: roundNumber,
      prompt,
      status: "CHAT",
    },
  });

  return {
    roundId: round.id,
  };
}

export async function submitMessage(input: unknown) {
  const result = submitMessageSchema.safeParse(input);

  if (!result.success) {
    // Check if the error is specifically about the content being empty/whitespace
    const contentError = result.error.format().content?._errors?.[0];
    if (contentError) {
      return { error: "Message required" };
    }
    return { error: "Invalid input" };
  }

  const { roundId, playerId, content } = result.data;

  const message = await db.message.create({
    data: {
      roundId,
      playerId,
      content,
    },
  });

  return {
    messageId: message.id,
  };
}