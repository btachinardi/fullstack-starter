/**
 * Session Tools
 *
 * Strongly-typed functions for working with Claude Code session files.
 * These are pure functions that the CLI dispatches to.
 */

import { SessionParser } from '../services/session-parser.js';

// ============================================================================
// Types
// ============================================================================

export interface SessionInfoResult {
  sessionId: string;
  version: string;
  cwd: string;
  gitBranch?: string;
  startTime: string;
  endTime: string;
  stats: {
    totalEntries: number;
    userMessages: number;
    assistantMessages: number;
    systemMessages: number;
    toolUses: number;
    toolResults: number;
    errors: number;
  };
  tokens: {
    input: number;
    output: number;
    cacheCreation: number;
    cacheRead: number;
    total: number;
  };
}

export interface ToolUsage {
  toolName: string;
  count: number;
}

export interface FileAccessResult {
  read: string[];
  written: string[];
  edited: string[];
}

export interface SubagentInvocation {
  subagentType: string;
  description: string;
  prompt: string;
  timestamp: string;
  sessionId: string;
  invocationId: string;
  entryUuid: string;
}

export interface ConversationMessage {
  timestamp: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface BashCommand {
  command: string;
  description?: string;
}

// ============================================================================
// Tool Functions
// ============================================================================

/**
 * Get comprehensive session information
 */
export async function sessionInfo(filePath: string): Promise<SessionInfoResult> {
  const parser = new SessionParser();
  const session = await parser.load(filePath);
  const tokens = parser.getTokenUsage();

  return {
    sessionId: session.sessionId,
    version: session.version,
    cwd: session.cwd,
    gitBranch: session.gitBranch,
    startTime: session.startTime,
    endTime: session.endTime,
    stats: {
      totalEntries: session.metadata.totalEntries,
      userMessages: session.metadata.userMessages,
      assistantMessages: session.metadata.assistantMessages,
      systemMessages: session.metadata.systemMessages,
      toolUses: session.metadata.toolUses,
      toolResults: session.metadata.toolResults,
      errors: session.metadata.errors,
    },
    tokens: {
      input: tokens.totalInputTokens,
      output: tokens.totalOutputTokens,
      cacheCreation: tokens.totalCacheCreation,
      cacheRead: tokens.totalCacheRead,
      total: tokens.totalInputTokens + tokens.totalOutputTokens,
    },
  };
}

/**
 * Get tool usage statistics
 */
export async function sessionTools(
  filePath: string,
  options: { includeCount: boolean } = { includeCount: false }
): Promise<{ tools: string[] } | { toolUsage: ToolUsage[] }> {
  const parser = new SessionParser();
  await parser.load(filePath);

  const toolUses = parser.getToolUses();

  if (options.includeCount) {
    const toolCounts = new Map<string, number>();
    for (const tool of toolUses) {
      toolCounts.set(tool.name, (toolCounts.get(tool.name) || 0) + 1);
    }

    const toolUsage = Array.from(toolCounts.entries())
      .map(([toolName, count]) => ({ toolName, count }))
      .sort((a, b) => b.count - a.count);

    return { toolUsage };
  }

  const uniqueTools = Array.from(new Set(toolUses.map((t) => t.name))).sort();
  return { tools: uniqueTools };
}

/**
 * Get file access information
 */
export async function sessionFiles(
  filePath: string,
  options: {
    filterRead?: boolean;
    filterWritten?: boolean;
    filterEdited?: boolean;
  } = {}
): Promise<FileAccessResult | { files: string[] }> {
  const parser = new SessionParser();
  await parser.load(filePath);

  const filesRead = parser.getFilesRead();
  const filesWritten = parser.getFilesWritten();
  const filesEdited = parser.getFilesEdited();

  // If specific filter is requested, return only that
  if (options.filterRead) {
    return { files: filesRead };
  }
  if (options.filterWritten) {
    return { files: filesWritten };
  }
  if (options.filterEdited) {
    return { files: filesEdited };
  }

  // Return all
  return {
    read: filesRead,
    written: filesWritten,
    edited: filesEdited,
  };
}

/**
 * Get subagent invocations
 */
export async function sessionAgents(filePath: string): Promise<SubagentInvocation[]> {
  const parser = new SessionParser();
  const session = await parser.load(filePath);

  const invocations = parser.getSubagentInvocations();

  return invocations.map((inv) => ({
    subagentType: inv.subagentType,
    description: inv.description,
    prompt: inv.prompt,
    timestamp: inv.entry.timestamp,
    sessionId: session.sessionId,
    invocationId: inv.tool.id,
    entryUuid: inv.entry.uuid,
  }));
}

/**
 * Get conversation flow
 */
export async function sessionConversation(
  filePath: string,
  options: { limit?: number } = {}
): Promise<ConversationMessage[]> {
  const parser = new SessionParser();
  await parser.load(filePath);

  const conversation = parser.getConversationFlow();

  if (options.limit) {
    return conversation.slice(0, options.limit);
  }

  return conversation;
}

/**
 * Get bash commands executed
 */
export async function sessionBash(filePath: string): Promise<BashCommand[]> {
  const parser = new SessionParser();
  await parser.load(filePath);

  return parser.getBashCommands();
}

/**
 * Export session as JSON
 */
export async function sessionExport(
  filePath: string,
  options: { pretty?: boolean } = {}
): Promise<string> {
  const parser = new SessionParser();
  const session = await parser.load(filePath);

  return options.pretty ? JSON.stringify(session, null, 2) : JSON.stringify(session);
}

/**
 * List session files (requires project path)
 */
export async function sessionList(projectPath?: string): Promise<string[]> {
  const { readdir } = await import('node:fs/promises');
  const { join, basename } = await import('node:path');
  const { homedir } = await import('node:os');

  const projectDir = projectPath || process.cwd();
  const projectName = basename(projectDir).replace(/\//g, '-');

  const sessionsDir = join(
    homedir(),
    '.claude',
    'projects',
    `C--Users-bruno-Documents-Work-Projects-${projectName}`
  );

  try {
    const files = await readdir(sessionsDir);
    const sessionFiles = files.filter((f) => f.endsWith('.jsonl'));
    return sessionFiles.map((f) => join(sessionsDir, f));
  } catch {
    return [];
  }
}
