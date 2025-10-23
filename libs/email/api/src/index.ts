/**
 * @libs/email/api
 *
 * Email service for sending transactional emails using Resend
 *
 * Exports:
 * - EmailService: Service for sending emails
 * - EmailModule: NestJS module for email functionality
 */

export { EmailModule } from "./email.module";
export type { EmailConfig, SendEmailOptions } from "./email.service";
export { EmailService } from "./email.service";
