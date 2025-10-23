import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.client";

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
/**
 * Email verification callback
 * This will be injected by the module when EmailService is available
 */
let emailVerificationCallback:
	| ((params: {
			user: { email: string; name: string };
			url: string;
			token: string;
	  }) => Promise<void>)
	| undefined;

/**
 * Set the email verification callback
 * Called by AuthModule after EmailService is injected
 */
export function setEmailVerificationCallback(
	callback: typeof emailVerificationCallback,
) {
	emailVerificationCallback = callback;
}

export const auth: ReturnType<typeof betterAuth> = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		// Require email verification before allowing sign-in
		requireEmailVerification: false, // Set to true when email service is configured
	},
	// Email verification configuration
	emailVerification: {
		sendOnSignUp: true, // Send verification email on signup
		autoSignInAfterVerification: true, // Auto-login after verification
		sendVerificationEmail: async ({ user, url, token }) => {
			// Use injected callback if available
			if (emailVerificationCallback) {
				await emailVerificationCallback({ user, url, token });
			} else {
				console.warn(
					"Email verification callback not configured. Set up EmailService to send verification emails.",
				);
			}
		},
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
