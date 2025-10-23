import { type DynamicModule, Module } from "@nestjs/common";
import { type EmailConfig, EmailService } from "./email.service";

/**
 * Email Module
 *
 * Provides email sending functionality using Resend
 */
@Module({})
export class EmailModule {
	/**
	 * Configure the email module with Resend credentials
	 */
	static forRoot(config: EmailConfig): DynamicModule {
		return {
			module: EmailModule,
			providers: [
				{
					provide: EmailService,
					useValue: new EmailService(config),
				},
			],
			exports: [EmailService],
			global: true, // Make available throughout the app
		};
	}
}
