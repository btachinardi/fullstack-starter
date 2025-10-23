/**
 * @libs/auth/web
 *
 * Authentication components and hooks for React using Better Auth
 *
 * Exports:
 * - authClient: Better Auth client instance
 * - Auth methods: signIn, signUp, signOut
 * - Hooks: useAuth, useSession
 * - Components: LoginPage, LoginForm, SignupPage, SignupForm
 * - Layout: AuthLayout, AuthBranding
 */

// Types
export type { AuthBranding, AuthLayoutProps } from "./components/auth-layout";
export { AuthLayout } from "./components/auth-layout";
export type { ForgotPasswordPageProps } from "./components/forgot-password-form";
export {
	ForgotPasswordForm,
	ForgotPasswordPage,
} from "./components/forgot-password-form";
export type { LoginPageProps } from "./components/login-form";
// Components
export { LoginForm, LoginPage } from "./components/login-form";
export type { LogoutButtonProps } from "./components/logout-button";
export { LogoutButton } from "./components/logout-button";
export type { ResetPasswordPageProps } from "./components/reset-password-form";
export {
	ResetPasswordForm,
	ResetPasswordPage,
} from "./components/reset-password-form";
export type { SignupPageProps } from "./components/signup-form";
export { SignupForm, SignupPage } from "./components/signup-form";
export type { VerifyEmailPageProps } from "./components/verify-email-form";
export {
	VerifyEmailForm,
	VerifyEmailPage,
} from "./components/verify-email-form";
// Hooks
export { useAuth } from "./hooks/use-auth";
// Auth client and methods
export {
	authClient,
	signIn,
	signOut,
	signUp,
	useSession,
} from "./lib/auth-client";
