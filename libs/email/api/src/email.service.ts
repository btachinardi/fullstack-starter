import { Injectable } from "@nestjs/common";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

export interface EmailConfig {
	/**
	 * Resend API key
	 */
	apiKey: string;
	/**
	 * Default from address
	 */
	from: string;
	/**
	 * Product name for emails
	 */
	productName?: string;
	/**
	 * Logo URL for emails
	 */
	logoUrl?: string;
}

export interface SendEmailOptions {
	/**
	 * Recipient email address
	 */
	to: string;
	/**
	 * Email subject
	 */
	subject: string;
	/**
	 * React email component
	 */
	template: ReactElement;
}

/**
 * Email Service
 *
 * Handles sending transactional emails using Resend
 */
@Injectable()
export class EmailService {
	private resend: Resend;
	private config: EmailConfig;

	constructor(config: EmailConfig) {
		this.config = config;
		this.resend = new Resend(config.apiKey);
	}

	/**
	 * Send verification email
	 * Templates should be passed from the caller to avoid import issues
	 */
	async sendVerificationEmail(params: {
		to: string;
		subject: string;
		template: ReactElement;
	}) {
		return this.sendEmail(params);
	}

	/**
	 * Send password reset email
	 */
	async sendPasswordResetEmail(params: {
		to: string;
		subject: string;
		template: ReactElement;
	}) {
		return this.sendEmail(params);
	}

	/**
	 * Send welcome email
	 */
	async sendWelcomeEmail(params: {
		to: string;
		subject: string;
		template: ReactElement;
	}) {
		return this.sendEmail(params);
	}

	/**
	 * Send a custom email with any template
	 */
	async sendEmail({ to, subject, template }: SendEmailOptions) {
		try {
			// Render React component to HTML
			const html = await render(template);

			// Send via Resend
			const result = await this.resend.emails.send({
				from: this.config.from,
				to,
				subject,
				html,
			});

			if (result.error) {
				throw new Error(`Failed to send email: ${result.error.message}`);
			}

			return result.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			throw new Error(`Email service error: ${message}`);
		}
	}
}
