import { AuthModule } from "@libs/auth/api";
import { HealthModule } from "@libs/health/api";
import { Module } from "@nestjs/common";
import { prisma } from "./prisma.client";

/**
 * BaseAppModule - Core module providing common functionality for all API applications.
 *
 * This module bundles essential features that every API app needs:
 * - Authentication (Better Auth with email/password, social providers)
 * - Health checks (readiness, liveness, custom indicators)
 * - Future: Logging, metrics, etc.
 *
 * Usage in your app:
 * ```typescript
 * import { BaseAppModule } from '@libs/api';
 *
 * @Module({
 *   imports: [BaseAppModule, YourFeatureModule],
 *   controllers: [AppController],
 *   providers: [AppService],
 * })
 * export class AppModule {}
 * ```
 *
 * IMPORTANT: When using AuthModule, you must disable body parser in main.ts:
 * ```typescript
 * const app = await NestFactory.create(AppModule, {
 *   bodyParser: false,
 * });
 * ```
 *
 * This approach ensures consistency across all API applications and makes it
 * easy to add new common functionality by updating this module.
 */
@Module({
	imports: [AuthModule, HealthModule.forRoot(prisma)],
	exports: [AuthModule, HealthModule],
})
export class BaseAppModule {}
