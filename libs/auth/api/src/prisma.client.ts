import { PrismaClient } from "../prisma/generated/client";

/**
 * Prisma Client Singleton for Auth Module
 *
 * Ensures a single Prisma Client instance is used throughout the application.
 * This prevents multiple connections and improves performance.
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
