/**
 * Log Query Tools
 *
 * Provides functions to query and filter structured logs.
 */

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { LogEntry, LogLevel } from '../services/logger.js';
import { getDefaultLogDir } from '../services/logger.js';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a JSONL log file
 */
async function parseLogFile(filePath: string): Promise<LogEntry[]> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  return lines.map((line) => JSON.parse(line) as LogEntry);
}

/**
 * Get all log files in the log directory
 */
async function getLogFiles(logDir: string): Promise<string[]> {
  if (!existsSync(logDir)) {
    return [];
  }

  const files = await readdir(logDir);
  return files
    .filter((f) => f.endsWith('.jsonl'))
    .sort()
    .map((f) => join(logDir, f));
}

/**
 * Filter log entries based on query options
 */
function filterEntries(entries: LogEntry[], options: LogQueryOptions): LogEntry[] {
  let filtered = entries;

  if (options.source) {
    filtered = filtered.filter((e) => e.source === options.source);
  }

  if (options.level) {
    filtered = filtered.filter((e) => e.level === options.level);
  }

  if (options.toolName) {
    filtered = filtered.filter((e) => e.context?.toolName === options.toolName);
  }

  if (options.sessionId) {
    filtered = filtered.filter((e) => e.context?.sessionId === options.sessionId);
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.message.toLowerCase().includes(searchLower) ||
        JSON.stringify(e.data || {})
          .toLowerCase()
          .includes(searchLower),
    );
  }

  if (options.limit) {
    filtered = filtered.slice(-options.limit);
  }

  return filtered;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Query logs with filters
 */
export async function queryLogs(options: LogQueryOptions = {}): Promise<LogEntry[]> {
  const logDir = options.logDir || getDefaultLogDir();
  const files = await getLogFiles(logDir);

  // Filter files by date range
  let filesToRead = files;
  if (options.startDate || options.endDate) {
    filesToRead = files.filter((f) => {
      const fileName = f.split(/[\\/]/).pop()?.replace('.jsonl', '');
      if (!fileName) return false;
      if (options.startDate && fileName < options.startDate) return false;
      if (options.endDate && fileName > options.endDate) return false;
      return true;
    });
  }

  // Read and parse all log files
  const allEntries: LogEntry[] = [];
  for (const file of filesToRead) {
    const entries = await parseLogFile(file);
    allEntries.push(...entries);
  }

  // Sort by timestamp
  allEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Apply filters
  return filterEntries(allEntries, options);
}

/**
 * Get the last N log entries (tail)
 */
export async function tailLogs(options: LogTailOptions = {}): Promise<LogEntry[]> {
  const logDir = options.logDir || getDefaultLogDir();
  const lines = options.lines || 20;

  const files = await getLogFiles(logDir);
  if (files.length === 0) {
    return [];
  }

  // Read the most recent log file
  const latestFile = files[files.length - 1];
  if (!latestFile) {
    return [];
  }

  const entries = await parseLogFile(latestFile);

  // Return last N entries
  return entries.slice(-lines);
}

/**
 * Get log statistics
 */
export async function logStats(options: { logDir?: string } = {}): Promise<LogStatsResult> {
  const logDir = options.logDir || getDefaultLogDir();
  const files = await getLogFiles(logDir);

  const byLevel: Record<LogLevel, number> = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
  };
  const bySource: Record<string, number> = {};
  const byTool: Record<string, number> = {};

  let totalEntries = 0;
  let firstTimestamp = '';
  let lastTimestamp = '';

  for (const file of files) {
    const entries = await parseLogFile(file);
    totalEntries += entries.length;

    for (const entry of entries) {
      byLevel[entry.level]++;

      bySource[entry.source] = (bySource[entry.source] || 0) + 1;

      if (entry.context?.toolName) {
        const toolName = entry.context.toolName as string;
        byTool[toolName] = (byTool[toolName] || 0) + 1;
      }

      if (!firstTimestamp || entry.timestamp < firstTimestamp) {
        firstTimestamp = entry.timestamp;
      }
      if (!lastTimestamp || entry.timestamp > lastTimestamp) {
        lastTimestamp = entry.timestamp;
      }
    }
  }

  return {
    totalEntries,
    byLevel,
    bySource,
    byTool,
    dateRange: {
      start: firstTimestamp,
      end: lastTimestamp,
    },
  };
}

/**
 * List all unique sources in logs
 */
export async function listSources(options: { logDir?: string } = {}): Promise<string[]> {
  const logDir = options.logDir || getDefaultLogDir();
  const files = await getLogFiles(logDir);

  const sources = new Set<string>();

  for (const file of files) {
    const entries = await parseLogFile(file);
    for (const entry of entries) {
      sources.add(entry.source);
    }
  }

  return Array.from(sources).sort();
}

/**
 * List all unique tools in logs
 */
export async function listTools(options: { logDir?: string } = {}): Promise<string[]> {
  const logDir = options.logDir || getDefaultLogDir();
  const files = await getLogFiles(logDir);

  const tools = new Set<string>();

  for (const file of files) {
    const entries = await parseLogFile(file);
    for (const entry of entries) {
      if (entry.context?.toolName) {
        tools.add(entry.context.toolName as string);
      }
    }
  }

  return Array.from(tools).sort();
}
