/**
 * @libs/email/templates
 *
 * Email templates built with React Email
 *
 * Exports:
 * - Email components: EmailLayout, EmailButton
 * - Email templates: VerificationEmail, PasswordResetEmail, WelcomeEmail
 */

export type { EmailButtonProps } from "./components/email-button";
export { EmailButton } from "./components/email-button";
// Types
export type { EmailLayoutProps } from "./components/email-layout";
// Shared components
export { EmailLayout } from "./components/email-layout";
export type { PasswordResetEmailProps } from "./emails/password-reset-email";
export { PasswordResetEmail } from "./emails/password-reset-email";
export type { VerificationEmailProps } from "./emails/verification-email";
// Email templates
export { VerificationEmail } from "./emails/verification-email";
export type { WelcomeEmailProps } from "./emails/welcome-email";
export { WelcomeEmail } from "./emails/welcome-email";
