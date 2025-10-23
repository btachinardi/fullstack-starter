import { HttpModule } from "@nestjs/axios";
import { type DynamicModule, Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prisma-health.indicator";

/**
 * Health check module providing health monitoring endpoints.
 * Includes database, memory, and disk health checks.
 */
@Module({})
export class HealthModule {
	/**
	 * Register the health module with a Prisma client instance
	 * @param prismaClient - Prisma client instance for database health checks
	 */
	static forRoot(prismaClient: {
		$queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
	}): DynamicModule {
		return {
			module: HealthModule,
			imports: [
				TerminusModule.forRoot({
					errorLogStyle: "pretty",
					gracefulShutdownTimeoutMs: 1000,
				}),
				HttpModule,
			],
			controllers: [HealthController],
			providers: [
				{
					provide: "PRISMA_CLIENT",
					useValue: prismaClient,
				},
				PrismaHealthIndicator,
			],
			exports: [PrismaHealthIndicator],
		};
	}
}
