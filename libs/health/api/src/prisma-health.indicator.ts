import { Inject, Injectable } from "@nestjs/common";
import {
	HealthCheckError,
	HealthIndicator,
	type HealthIndicatorResult,
} from "@nestjs/terminus";

/**
 * Prisma database health indicator.
 * Checks database connectivity using a simple SELECT 1 query.
 */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
	constructor(
		@Inject("PRISMA_CLIENT")
		private readonly prisma: {
			$queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
		},
	) {
		super();
	}

	/**
	 * Performs a health check on the Prisma database connection.
	 * Executes a simple SELECT 1 query to verify database connectivity.
	 *
	 * @param key - Identifier for this health check (e.g., 'database', 'postgres')
	 * @returns Promise resolving to health check result
	 * @throws HealthCheckError if database is unreachable
	 */
	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return this.getStatus(key, true, { message: "Database is healthy" });
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
