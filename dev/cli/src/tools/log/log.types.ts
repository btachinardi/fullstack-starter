/**
 * Log Tool Types
 *
 * Type definitions for log query and analysis functionality.
 */

import type { LogLevel } from "../../shared/services/logger.js";

export interface LogQueryOptions {
	logDir?: string;
	source?: string;
	level?: LogLevel;
	toolName?: string;
	sessionId?: string;
	startDate?: string;
	endDate?: string;
	limit?: number;
	search?: string;
}

export interface LogTailOptions {
	logDir?: string;
	lines?: number;
	follow?: boolean;
}

export interface LogStatsResult {
	totalEntries: number;
	byLevel: Record<LogLevel, number>;
	bySource: Record<string, number>;
	byTool: Record<string, number>;
	dateRange: {
		start: string;
		end: string;
	};
}
