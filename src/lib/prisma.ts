/// <reference types="node" />
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create PrismaClient if DATABASE_URL is set and not dummy
const shouldCreatePrisma = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy')

if (!shouldCreatePrisma) {
  throw new Error('Database not configured. Please set DATABASE_URL environment variable.')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: (process.env as any).NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if ((process.env as any).NODE_ENV !== 'production') globalForPrisma.prisma = prisma

