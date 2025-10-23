import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth.config";

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
export class AuthModule {}
