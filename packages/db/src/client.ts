import { Prisma, PrismaClient } from '@prisma/client';

export { Prisma };

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Connect Prisma client
 */
export async function connectPrisma() {
  await prisma.$connect();
}
