/**
 * Structured Logging Service
 *
 * Provides structured JSON logging with rich metadata for all tools and hooks.
 * Logs are stored in platform-appropriate app data directories as JSONL files.
 *
 * Log Location:
 * - Windows: %APPDATA%/<workspace>/tools/logs/YYYY-MM-DD.jsonl
 * - macOS: ~/Library/Application Support/<workspace>/tools/logs/YYYY-MM-DD.jsonl
 * - Linux: ~/.local/share/<workspace>/tools/logs/YYYY-MM-DD.jsonl
 *
 * Features:
 * - Structured JSON logs with timestamps and context
 * - Multiple log levels (debug, info, warn, error)
 * - Automatic daily log rotation
 * - Rich metadata (source, tool name, session ID, etc.)
 * - Easy querying and filtering
 */

import { existsSync } from 'node:fs';
import { appendFile, mkdir } from 'node:fs/promises';
import { homedir, platform } from 'node:os';
import { basename, join } from 'node:path';

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  sessionId?: string;
  toolName?: string;
  invocationId?: string;
  transcriptPath?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  context?: LogContext;
  data?: unknown;
}

/**
 * Type guard to check if value is a valid LogEntry
 */
export function isLogEntry(value: unknown): value is LogEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    'timestamp' in value &&
    'level' in value &&
    'source' in value &&
    'message' in value &&
    typeof (value as LogEntry).timestamp === 'string' &&
    typeof (value as LogEntry).level === 'string' &&
    typeof (value as LogEntry).source === 'string' &&
    typeof (value as LogEntry).message === 'string'
  );
}

export interface LoggerOptions {
  source: string;
  context?: LogContext;
  logDir?: string;
  minLevel?: LogLevel;
}

// ============================================================================
// Platform-Specific Paths
// ============================================================================

/**
 * Get platform-appropriate app data directory
 */
function getAppDataDir(): string {
  const plat = platform();
  const home = homedir();

  switch (plat) {
    case 'win32':
      return process.env.APPDATA || join(home, 'AppData', 'Roaming');
    case 'darwin':
      return join(home, 'Library', 'Application Support');
    case 'linux':
      return process.env.XDG_DATA_HOME || join(home, '.local', 'share');
    default:
      return join(home, '.local', 'share');
  }
}

/**
 * Get workspace name from current working directory
 */
function getWorkspaceName(): string {
  return basename(process.cwd());
}

/**
 * Get default log directory for the current workspace
 */
export function getDefaultLogDir(): string {
  const appData = getAppDataDir();
  const workspace = getWorkspaceName();
  return join(appData, workspace, 'tools', 'logs');
}

// ============================================================================
// Logger Class
// ============================================================================

export class Logger {
  private source: string;
  private context: LogContext;
  private logDir: string;
  private minLevel: LogLevel;

  private static readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options: LoggerOptions) {
    this.source = options.source;
    this.context = options.context || {};
    this.logDir = options.logDir || getDefaultLogDir();
    this.minLevel = options.minLevel || 'info';
  }

  /**
   * Get the log file path for today
   */
  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return join(this.logDir, `${date}.jsonl`);
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDir(): Promise<void> {
    if (!existsSync(this.logDir)) {
      await mkdir(this.logDir, { recursive: true });
    }
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return Logger.LOG_LEVELS[level] >= Logger.LOG_LEVELS[this.minLevel];
  }

  /**
   * Write a log entry
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    await this.ensureLogDir();
    const logFile = this.getLogFilePath();
    const logLine = `${JSON.stringify(entry)}\n`;

    try {
      await appendFile(logFile, logLine, 'utf-8');
    } catch (error) {
      // Fallback to stderr if we can't write to log file
      console.error('[Logger] Failed to write log:', error);
      console.error('[Logger] Log entry:', logLine);
    }
  }

  /**
   * Create a log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
    extraContext?: LogContext
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      source: this.source,
      message,
      context: { ...this.context, ...extraContext },
      data,
    };
  }

  /**
   * Log at debug level
   */
  async debug(message: string, data?: unknown, context?: LogContext): Promise<void> {
    await this.writeLog(this.createEntry('debug', message, data, context));
  }

  /**
   * Log at info level
   */
  async info(message: string, data?: unknown, context?: LogContext): Promise<void> {
    await this.writeLog(this.createEntry('info', message, data, context));
  }

  /**
   * Log at warn level
   */
  async warn(message: string, data?: unknown, context?: LogContext): Promise<void> {
    await this.writeLog(this.createEntry('warn', message, data, context));
  }

  /**
   * Log at error level
   */
  async error(message: string, data?: unknown, context?: LogContext): Promise<void> {
    await this.writeLog(this.createEntry('error', message, data, context));
  }

  /**
   * Update the logger's context
   */
  updateContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Create a child logger with additional context
   */
  child(source?: string, context?: LogContext): Logger {
    return new Logger({
      source: source || this.source,
      context: { ...this.context, ...context },
      logDir: this.logDir,
      minLevel: this.minLevel,
    });
  }

  /**
   * Get the log directory path
   */
  getLogDir(): string {
    return this.logDir;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a logger for a specific source
 */
export function createLogger(source: string, context?: LogContext): Logger {
  return new Logger({ source, context });
}

/**
 * Create a logger for a hook
 */
export function createHookLogger(
  hookName: string,
  sessionId?: string,
  transcriptPath?: string
): Logger {
  return new Logger({
    source: hookName,
    context: {
      sessionId,
      transcriptPath,
    },
    minLevel: 'debug', // Enable debug logging for hooks
  });
}

/**
 * Create a logger for a CLI tool
 */
export function createToolLogger(toolName: string): Logger {
  return createLogger(`tool:${toolName}`);
}
