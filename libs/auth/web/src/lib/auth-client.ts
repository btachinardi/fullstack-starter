/**
 * Better Auth Client Configuration
 *
 * This creates the Better Auth client for React applications.
 * The client handles authentication state, session management, and API calls.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Auth client instance
 * Configure baseURL to point to your API server
 */
export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});

/**
 * Export auth methods for convenience
 */
export const { signIn, signUp, signOut, useSession, $Infer } = authClient;
