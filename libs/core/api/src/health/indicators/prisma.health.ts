import { Injectable } from "@nestjs/common";
import {
	HealthCheckError,
	HealthIndicator,
	type HealthIndicatorResult,
} from "@nestjs/terminus";

/**
 * Generic Prisma health indicator that can work with any Prisma client.
 * Usage in your app:
 *
 * ```typescript
 * import { PrismaHealthIndicator } from '@libs/api';
 * import { PrismaService } from './prisma.service';
 *
 * @Controller('health')
 * export class AppHealthController {
 *   constructor(
 *     private health: HealthCheckService,
 *     private prismaHealth: PrismaHealthIndicator,
 *     private prisma: PrismaService
 *   ) {}
 *
 *   @Get()
 *   @HealthCheck()
 *   check() {
 *     return this.health.check([
 *       () => this.prismaHealth.pingCheck('database', this.prisma)
 *     ]);
 *   }
 * }
 * ```
 */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
	/**
	 * Performs a health check on the Prisma database connection.
	 * Executes a simple SELECT 1 query to verify database connectivity.
	 *
	 * @param key - Identifier for this health check (e.g., 'database', 'postgres')
	 * @param prismaClient - Any Prisma client instance with $queryRaw method
	 * @returns Promise resolving to health check result
	 * @throws HealthCheckError if database is unreachable
	 */
	async pingCheck(
		key: string,
		prismaClient: {
			$queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
		},
	): Promise<HealthIndicatorResult> {
		try {
			await prismaClient.$queryRaw`SELECT 1`;
			return this.getStatus(key, true);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			throw new HealthCheckError(
				`${key} check failed`,
				this.getStatus(key, false, { message: errorMessage }),
			);
		}
	}
}
