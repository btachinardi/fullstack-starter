import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../database/prisma.client";

/**
 * Better Auth Configuration
 *
 * This file configures the Better Auth instance with:
 * - Database adapter (Prisma with PostgreSQL)
 * - Authentication methods (email/password)
 * - Session management
 * - Environment-based settings
 *
 * Environment Variables Required:
 * - BETTER_AUTH_SECRET: Secret key for encryption and hashing
 * - BETTER_AUTH_URL: Base URL of the application (e.g., http://localhost:3001)
 * - DATABASE_URL: PostgreSQL connection string
 *
 * Usage in NestJS:
 * ```typescript
 * import { auth } from '@libs/api';
 * ```
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		// Require email verification before allowing sign-in
		requireEmailVerification: false, // Set to true in production
	},
	// Social providers can be added here
	// socialProviders: {
	//   github: {
	//     clientId: process.env.GITHUB_CLIENT_ID as string,
	//     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
	//   },
	// },
	// Advanced options
	advanced: {
		// Use secure cookies in production
		useSecureCookies: process.env.NODE_ENV === "production",
		// CORS configuration
		crossSubDomainCookies: {
			enabled: false,
		},
	},
	// Customize session duration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update session every 24 hours
	},
});
