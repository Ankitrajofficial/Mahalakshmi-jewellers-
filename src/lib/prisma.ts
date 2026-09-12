import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma'

/**
 * Prisma is optional at runtime. When DATABASE_URL is absent (a fresh clone, a
 * preview build, or local design work) the repository layer in src/lib/repo.ts
 * transparently falls back to the seeded catalog so every route still renders.
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL)

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient | null {
  if (!hasDatabase) return null
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma: PrismaClient | null = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production' && prisma) globalForPrisma.prisma = prisma

/** Narrowing helper for call sites that require a live connection. */
export function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('DATABASE_URL is not configured. Set it in .env to use database-backed features.')
  }
  return prisma
}
