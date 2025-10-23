/**
 * useAuth Hook
 *
 * Provides authentication state and methods
 */

import { useSession } from "../lib/auth-client";

export function useAuth() {
	const session = useSession();

	return {
		user: session.data?.user ?? null,
		session: session.data?.session ?? null,
		isAuthenticated: !!session.data?.user,
		isLoading: session.isPending,
		error: session.error,
	};
}
