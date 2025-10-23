import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Auth Middleware
 *
 * Protects routes that require authentication.
 * Redirects unauthenticated users to the login page.
 */
export function middleware(request: NextRequest) {
	// Check for Better Auth session cookie
	const sessionToken = request.cookies.get("better-auth.session_token");

	// If no session and trying to access protected route, redirect to login
	if (!sessionToken && isProtectedRoute(request.nextUrl.pathname)) {
		const loginUrl = new URL("/login", request.url);
		// Save the intended destination to redirect after login
		loginUrl.searchParams.set("from", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	// If has session and trying to access auth pages, redirect to dashboard
	if (sessionToken && isAuthRoute(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

/**
 * Check if route is protected and requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
	const protectedRoutes = ["/dashboard", "/profile", "/settings"];
	return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is an auth page (login, signup)
 */
function isAuthRoute(pathname: string): boolean {
	const authRoutes = ["/login", "/signup"];
	return authRoutes.some((route) => pathname.startsWith(route));
}

// Configure which routes use this middleware
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
