import type { HealthCheckResult } from "../types/health.types";

/**
 * Health API client
 * Provides methods to check application health status
 */
export class HealthApi {
	constructor(private readonly baseUrl: string = "http://localhost:3001") {}

	/**
	 * Get overall health status
	 * Checks memory, disk, and database
	 */
	async getHealth(): Promise<HealthCheckResult> {
		const response = await fetch(`${this.baseUrl}/health`);
		if (!response.ok) {
			throw new Error("Failed to fetch health status");
		}
		return response.json() as Promise<HealthCheckResult>;
	}

	/**
	 * Get database health status
	 */
	async getDbHealth(): Promise<HealthCheckResult> {
		const response = await fetch(`${this.baseUrl}/health/db`);
		if (!response.ok) {
			throw new Error("Failed to fetch database health status");
		}
		return response.json() as Promise<HealthCheckResult>;
	}

	/**
	 * Get readiness probe status
	 */
	async getReadiness(): Promise<HealthCheckResult> {
		const response = await fetch(`${this.baseUrl}/health/ready`);
		if (!response.ok) {
			throw new Error("Failed to fetch readiness status");
		}
		return response.json() as Promise<HealthCheckResult>;
	}

	/**
	 * Get liveness probe status
	 */
	async getLiveness(): Promise<HealthCheckResult> {
		const response = await fetch(`${this.baseUrl}/health/live`);
		if (!response.ok) {
			throw new Error("Failed to fetch liveness status");
		}
		return response.json() as Promise<HealthCheckResult>;
	}
}

// Singleton instance
export const healthApi = new HealthApi();
