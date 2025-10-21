/**
 * Session Parser Service
 *
 * Parses Claude Code session .jsonl files and provides strongly-typed access
 * to session data with filtering, querying, and analysis capabilities.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type {
  AssistantEntry,
  ParsedSession,
  SessionEntry,
  SystemEntry,
  ToolName,
  ToolUse,
  UserEntry,
} from '../types/session.js';
import {
  isAssistantEntry,
  isSessionEntry,
  isSummaryEntry,
  isSystemEntry,
  isToolUse,
  isUserEntry,
} from '../types/session.js';

export class SessionParser {
  private entries: SessionEntry[] = [];
  private sessionId = '';
  private version = '';
  private cwd = '';
  private gitBranch?: string;

  /**
   * Load and parse a session .jsonl file
   */
  async load(filePath: string): Promise<ParsedSession> {
    const absolutePath = resolve(filePath);
    const content = await readFile(absolutePath, 'utf-8');

    // Parse JSONL (each line is a JSON object)
    const lines = content.split('\n').filter((line) => line.trim());

    this.entries = [];

    for (const line of lines) {
      try {
        const parsed: unknown = JSON.parse(line);
        if (!isSessionEntry(parsed)) {
          console.warn(`Skipping invalid session entry: ${line.substring(0, 100)}...`);
          continue;
        }
        this.entries.push(parsed);

        // Extract session metadata from first entry with these fields
        if (entry.type !== 'summary' && 'sessionId' in entry) {
          if (!this.sessionId) this.sessionId = entry.sessionId;
          if (!this.version) this.version = entry.version;
          if (!this.cwd) this.cwd = entry.cwd;
          if (!this.gitBranch && entry.gitBranch) this.gitBranch = entry.gitBranch;
        }
      } catch (_error) {
        console.warn(`Skipping invalid JSON line: ${line.substring(0, 100)}...`);
      }
    }

    return this.getParsedSession();
  }

  /**
   * Get the complete parsed session
   */
  getParsedSession(): ParsedSession {
    const userMessages = this.entries.filter(isUserEntry).length;
    const assistantMessages = this.entries.filter(isAssistantEntry).length;
    const systemMessages = this.entries.filter(isSystemEntry).length;

    const toolUses = this.getToolUses().length;
    const toolResults = this.entries.filter((e) => {
      if (!isAssistantEntry(e)) return false;
      const content = e.message.content;
      if (typeof content === 'string') return false;
      return content.some((c) => c.type === 'tool_result');
    }).length;

    const errors = this.entries.filter((e) => isSystemEntry(e) && e.level === 'error').length;

    const timestamps = this.entries
      .filter((e) => 'timestamp' in e && e.timestamp)
      .map((e) => ('timestamp' in e ? e.timestamp : ''));

    return {
      sessionId: this.sessionId,
      version: this.version,
      cwd: this.cwd,
      gitBranch: this.gitBranch,
      startTime: timestamps[0] || '',
      endTime: timestamps[timestamps.length - 1] || '',
      entries: this.entries,
      metadata: {
        totalEntries: this.entries.length,
        userMessages,
        assistantMessages,
        systemMessages,
        toolUses,
        toolResults,
        errors,
      },
    };
  }

  /**
   * Get all user messages
   */
  getUserMessages(): UserEntry[] {
    return this.entries.filter(isUserEntry);
  }

  /**
   * Get all assistant messages
   */
  getAssistantMessages(): AssistantEntry[] {
    return this.entries.filter(isAssistantEntry);
  }

  /**
   * Get all system messages
   */
  getSystemMessages(): SystemEntry[] {
    return this.entries.filter(isSystemEntry);
  }

  /**
   * Get all tool uses across all assistant messages
   */
  getToolUses(): ToolUse[] {
    const toolUses: ToolUse[] = [];

    for (const entry of this.entries) {
      if (!isAssistantEntry(entry)) continue;

      const content = entry.message.content;
      if (typeof content === 'string') continue;

      for (const item of content) {
        if (isToolUse(item)) {
          toolUses.push(item);
        }
      }
    }

    return toolUses;
  }

  /**
   * Get tool uses filtered by tool name
   */
  getToolUsesByName(toolName: ToolName): ToolUse[] {
    return this.getToolUses().filter((tool) => tool.name === toolName);
  }

  /**
   * Get all task/subagent invocations
   */
  getSubagentInvocations(): Array<{
    entry: AssistantEntry;
    tool: ToolUse;
    subagentType: string;
    prompt: string;
    description: string;
  }> {
    const invocations: Array<{
      entry: AssistantEntry;
      tool: ToolUse;
      subagentType: string;
      prompt: string;
      description: string;
    }> = [];

    for (const entry of this.getAssistantMessages()) {
      const content = entry.message.content;
      if (typeof content === 'string') continue;

      for (const item of content) {
        if (isToolUse(item) && item.name === 'Task') {
          const input = item.input as {
            subagent_type?: string;
            prompt?: string;
            description?: string;
          };

          invocations.push({
            entry,
            tool: item,
            subagentType: input.subagent_type || 'unknown',
            prompt: input.prompt || '',
            description: input.description || '',
          });
        }
      }
    }

    return invocations;
  }

  /**
   * Get all files that were read during the session
   */
  getFilesRead(): string[] {
    const files = new Set<string>();

    for (const tool of this.getToolUsesByName('Read')) {
      const input = tool.input as { file_path?: string };
      if (input.file_path) {
        files.add(input.file_path);
      }
    }

    return Array.from(files);
  }

  /**
   * Get all files that were written during the session
   */
  getFilesWritten(): string[] {
    const files = new Set<string>();

    for (const tool of this.getToolUsesByName('Write')) {
      const input = tool.input as { file_path?: string };
      if (input.file_path) {
        files.add(input.file_path);
      }
    }

    return Array.from(files);
  }

  /**
   * Get all files that were edited during the session
   */
  getFilesEdited(): string[] {
    const files = new Set<string>();

    for (const tool of this.getToolUsesByName('Edit')) {
      const input = tool.input as { file_path?: string };
      if (input.file_path) {
        files.add(input.file_path);
      }
    }

    return Array.from(files);
  }

  /**
   * Get all bash commands executed during the session
   */
  getBashCommands(): Array<{ command: string; description?: string }> {
    const commands: Array<{ command: string; description?: string }> = [];

    for (const tool of this.getToolUsesByName('Bash')) {
      const input = tool.input as { command?: string; description?: string };
      if (input.command) {
        commands.push({
          command: input.command,
          description: input.description,
        });
      }
    }

    return commands;
  }

  /**
   * Get conversation flow (user messages and assistant text responses)
   */
  getConversationFlow(): Array<{
    timestamp: string;
    role: 'user' | 'assistant';
    content: string;
  }> {
    const conversation: Array<{
      timestamp: string;
      role: 'user' | 'assistant';
      content: string;
    }> = [];

    for (const entry of this.entries) {
      if (isUserEntry(entry)) {
        conversation.push({
          timestamp: entry.timestamp,
          role: 'user',
          content: entry.message.content,
        });
      } else if (isAssistantEntry(entry)) {
        const content = entry.message.content;
        if (typeof content === 'string') {
          conversation.push({
            timestamp: entry.timestamp,
            role: 'assistant',
            content,
          });
        } else {
          // Extract text content
          const textParts = content
            .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
            .map((c) => c.text)
            .join('\n');

          if (textParts) {
            conversation.push({
              timestamp: entry.timestamp,
              role: 'assistant',
              content: textParts,
            });
          }
        }
      }
    }

    return conversation;
  }

  /**
   * Get thinking blocks (internal reasoning)
   */
  getThinkingBlocks(): Array<{ timestamp: string; thinking: string }> {
    const thinkingBlocks: Array<{ timestamp: string; thinking: string }> = [];

    for (const entry of this.getAssistantMessages()) {
      const content = entry.message.content;
      if (typeof content === 'string') continue;

      for (const item of content) {
        if (item.type === 'thinking' && 'thinking' in item) {
          thinkingBlocks.push({
            timestamp: entry.timestamp,
            thinking: item.thinking,
          });
        }
      }
    }

    return thinkingBlocks;
  }

  /**
   * Get token usage statistics
   */
  getTokenUsage(): {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCacheCreation: number;
    totalCacheRead: number;
  } {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheCreation = 0;
    let totalCacheRead = 0;

    for (const entry of this.getAssistantMessages()) {
      const usage = entry.message.usage;
      if (usage) {
        totalInputTokens += usage.input_tokens;
        totalOutputTokens += usage.output_tokens;
        totalCacheCreation += usage.cache_creation_input_tokens || 0;
        totalCacheRead += usage.cache_read_input_tokens || 0;
      }
    }

    return {
      totalInputTokens,
      totalOutputTokens,
      totalCacheCreation,
      totalCacheRead,
    };
  }

  /**
   * Find entries by timestamp range
   */
  getEntriesByTimeRange(start: string, end: string): SessionEntry[] {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    return this.entries.filter((entry) => {
      if (!('timestamp' in entry) || !entry.timestamp) return false;
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime >= startTime && entryTime <= endTime;
    });
  }

  /**
   * Search for entries containing specific text
   */
  searchEntries(searchText: string, caseSensitive = false): SessionEntry[] {
    const search = caseSensitive ? searchText : searchText.toLowerCase();

    return this.entries.filter((entry) => {
      const entryStr = caseSensitive ? JSON.stringify(entry) : JSON.stringify(entry).toLowerCase();
      return entryStr.includes(search);
    });
  }

  /**
   * Get summary of the session
   */
  getSummary(): string | null {
    const summaryEntry = this.entries.find(isSummaryEntry);
    return summaryEntry?.summary || null;
  }

  /**
   * Export session as JSON
   */
  toJSON(): ParsedSession {
    return this.getParsedSession();
  }

  /**
   * Get raw entries
   */
  getEntries(): SessionEntry[] {
    return this.entries;
  }
}

/**
 * Utility function to create a new parser instance and load a session
 */
export async function parseSession(filePath: string): Promise<ParsedSession> {
  const parser = new SessionParser();
  return parser.load(filePath);
}
