/**
 * Health check status
 */
export type HealthStatus = "ok" | "error" | "shutting_down";

/**
 * Individual health indicator result
 */
export interface HealthIndicator {
	status: HealthStatus;
	[key: string]: unknown;
}

/**
 * Health check result structure
 */
export interface HealthCheckResult {
	status: HealthStatus;
	info?: Record<string, HealthIndicator>;
	error?: Record<string, HealthIndicator>;
	details: Record<string, HealthIndicator>;
}
