import { Inject, Module, type OnModuleInit, Optional } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth, setEmailVerificationCallback } from "./auth.config";

/**
 * Authentication Module
 *
 * Integrates Better Auth with NestJS using the @thallesp/nestjs-better-auth package.
 *
 * Features:
 * - Global authentication guard (all routes protected by default)
 * - Session management via decorators
 * - Email/password authentication
 * - Route-level access control with @AllowAnonymous() and @OptionalAuth()
 *
 * Usage in Controllers:
 * ```typescript
 * import { Session, UserSession, AllowAnonymous } from '@thallesp/nestjs-better-auth';
 *
 * @Controller('users')
 * export class UserController {
 *   @Get('me')
 *   async getProfile(@Session() session: UserSession) {
 *     return { user: session.user };
 *   }
 *
 *   @Get('public')
 *   @AllowAnonymous()
 *   async getPublic() {
 *     return { message: 'Public route' };
 *   }
 * }
 * ```
 *
 * Note: Body parser must be disabled in main.ts for Better Auth to work:
 * ```typescript
 * const app = await NestFactory.create(AppModule, {
 *   bodyParser: false,
 * });
 * ```
 */
@Module({
	imports: [
		BetterAuthModule.forRoot({
			auth,
		}),
	],
	exports: [BetterAuthModule],
})
export class AuthModule implements OnModuleInit {
	constructor(
		@Optional()
		@Inject("EmailService")
		private emailService?: {
			sendEmail: (params: {
				to: string;
				subject: string;
				template: unknown;
			}) => Promise<unknown>;
		},
	) {}

	async onModuleInit() {
		// Configure email verification callback if EmailService is available
		if (this.emailService) {
			setEmailVerificationCallback(async ({ user, url }) => {
				// Dynamically import email template to avoid circular dependency
				const { VerificationEmail } = await import("@libs/email/templates");

				const template = VerificationEmail({
					name: user.name,
					code: url.split("?")[1]?.split("=")[1] || "VERIFY", // Extract token from URL
					verificationUrl: url,
				});

				await this.emailService?.sendEmail({
					to: user.email,
					subject: "Verify your email address",
					template,
				});
			});

			console.log("✅ Email verification configured with EmailService");
		} else {
			console.warn(
				"⚠️  EmailService not available. Email verification will not send emails.",
			);
		}
	}
}
