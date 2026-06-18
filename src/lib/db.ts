import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  __db: PrismaClient | undefined
}

export const db = globalForPrisma.__db ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.__db = db