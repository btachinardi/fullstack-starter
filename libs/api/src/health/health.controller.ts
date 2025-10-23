import { Controller, Get } from "@nestjs/common";
import {
	type DiskHealthIndicator,
	HealthCheck,
	type HealthCheckResult,
	type HealthCheckService,
	type MemoryHealthIndicator,
} from "@nestjs/terminus";

@Controller("health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly memory: MemoryHealthIndicator,
		private readonly disk: DiskHealthIndicator,
	) {}

	@Get()
	@HealthCheck()
	check(): Promise<HealthCheckResult> {
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
		]);
	}

	@Get("ready")
	@HealthCheck()
	readiness(): Promise<HealthCheckResult> {
		// Readiness probe - checks if the service is ready to accept traffic
		return this.health.check([
			() => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
		]);
	}

	@Get("live")
	@HealthCheck()
	liveness(): Promise<HealthCheckResult> {
		// Liveness probe - checks if the service is alive
		// This is a simple check that always returns healthy if the app is running
		return this.health.check([]);
	}
}
