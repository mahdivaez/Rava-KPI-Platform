/// <reference types="node" />
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create PrismaClient if DATABASE_URL is set and not dummy
const shouldCreatePrisma = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('dummy')

export const prisma = shouldCreatePrisma ? (globalForPrisma.prisma ?? new PrismaClient({
  log: (process.env as any).NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})) : null

if (shouldCreatePrisma && (process.env as any).NODE_ENV !== 'production') globalForPrisma.prisma = prisma

