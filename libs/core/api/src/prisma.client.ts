import { PrismaClient } from "./generated/prisma";

/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma Client instance is used across the application.
 * This prevents connection pool exhaustion and maintains consistent database connections.
 *
 * Usage:
 * ```typescript
 * import { prisma } from '@libs/core/api';
 *
 * const users = await prisma.user.findMany();
 * ```
 */
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
