import { z } from "zod"

export const createGameSchema = z.object({
  hostName: z.string().trim().min(1),
})

export const joinGameSchema = z.object({
  code: z.string().trim().length(6),
  playerName: z.string().trim().min(1),
})

export const submitMessageSchema = z.object({
  roundId: z.string().trim().min(1),
  playerId: z.string().trim().min(1),
  content: z.string().trim().min(1),
})

export const submitVoteSchema = z.object({
  roundId: z.string().trim().min(1),
  voterId: z.string().trim().min(1),
  votedForId: z.string().trim().min(1),
})

export type CreateGameInput = z.infer<typeof createGameSchema>
export type JoinGameInput = z.infer<typeof joinGameSchema>
export type SubmitMessageInput = z.infer<typeof submitMessageSchema>
export type SubmitVoteInput = z.infer<typeof submitVoteSchema>