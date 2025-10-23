import { Public } from "@libs/core/api";
import { Controller, Get } from "@nestjs/common";
import {
	type DiskHealthIndicator,
	HealthCheck,
	type HealthCheckResult,
	type HealthCheckService,
	type MemoryHealthIndicator,
} from "@nestjs/terminus";
import type { PrismaHealthIndicator } from "./prisma-health.indicator";

/**
 * Health check controller providing various health endpoints.
 * All endpoints are public and do not require authentication.
 */
@Controller("health")
@Public()
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly memory: MemoryHealthIndicator,
		private readonly disk: DiskHealthIndicator,
		private readonly prismaHealth: PrismaHealthIndicator,
	) {}

	/**
	 * Overall health check endpoint
	 * Checks memory, disk, and database connectivity
	 */
	@Get()
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		return this.health.check([
			// Memory check: Heap should not exceed 150MB
			() => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
			// Memory check: RSS should not exceed 150MB
			() => this.memory.checkRSS("memory_rss", 150 * 1024 * 1024),
			// Disk check: Storage should not exceed 90% on root path
			() =>
				this.disk.checkStorage("disk_storage", {
					path: process.platform === "win32" ? "C:\\" : "/",
					thresholdPercent: 0.9,
				}),
			// Database connectivity check
			() => this.prismaHealth.isHealthy("database"),
		]);
	}

	/**
	 * Database health check endpoint
	 * Tests database connectivity only
	 */
	@Get("db")
	@HealthCheck()
	async database(): Promise<HealthCheckResult> {
		return this.health.check([() => this.prismaHealth.isHealthy("database")]);
	}

	/**
	 * Readiness probe endpoint
	 * Checks if service is ready to accept traffic
	 */
	@Get("ready")
	@HealthCheck()
	async readiness(): Promise<HealthCheckResult> {
		return this.health.check([
			() => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
			() => this.prismaHealth.isHealthy("database"),
		]);
	}

	/**
	 * Liveness probe endpoint
	 * Simple check that returns healthy if app is running
	 */
	@Get("live")
	@HealthCheck()
	async liveness(): Promise<HealthCheckResult> {
		return this.health.check([]);
	}
}
