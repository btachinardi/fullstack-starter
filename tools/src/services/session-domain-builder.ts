/**
 * Session Domain Builder
 *
 * Transforms raw session entries into enriched domain model with:
 * - Specialized message types (slash commands, subagent invocations, etc.)
 * - Thread management (main thread + subagent threads)
 * - Semantic grouping and linking
 *
 * This is "Phase 2" of the two-phase parsing architecture.
 */

import type {
  AssistantEntry,
  SessionEntry,
  SystemEntry,
  TaskToolInput,
  ToolResult,
  UserEntry,
} from '../types/session';
import {
  isAssistantEntry,
  isSystemEntry,
  isToolUse,
  isUserEntry,
} from '../types/session';
import type {
  AssistantTextMessage,
  AssistantThinkingMessage,
  DomainMessage,
  EnrichedSession,
  SessionThread,
  SlashCommandMessage,
  SubagentInvocationMessage,
  SubagentThread,
  SystemMessage,
  ToolCallMessage,
  ToolResultMessage,
  UserMessage,
} from '../types/session-domain';
import type { EnrichedToolUse, SessionParser } from './session-parser';

// ============================================================================
// Builder Class
// ============================================================================

export class SessionDomainBuilder {
  private entries: SessionEntry[] = [];
  private parser: SessionParser;

  constructor(parser: SessionParser) {
    this.parser = parser;
    this.entries = parser.getEntries();
  }

  /**
   * Build enriched session domain model
   */
  build(): EnrichedSession {
    // Get enriched tool uses for matching results
    const enrichedToolUses = this.parser.getEnrichedToolUses();
    const toolUseMap = new Map(enrichedToolUses.map((t) => [t.id, t]));

    // Build main thread messages
    const mainThreadMessages = this.buildMainThreadMessages(toolUseMap);

    // Extract subagent threads
    const subagentThreads = this.buildSubagentThreads();

    // Link subagent threads to their invocations in main thread
    this.linkSubagentThreads(mainThreadMessages, subagentThreads);

    // Get token usage
    const tokenUsage = this.parser.getTokenUsage();

    // Build session thread
    const mainThread: SessionThread = {
      type: 'main',
      messages: mainThreadMessages,
      rootUuid: mainThreadMessages[0]?.uuid || '',
      leafUuid: mainThreadMessages[mainThreadMessages.length - 1]?.uuid || '',
      metadata: {
        totalMessages: mainThreadMessages.length,
        startTime: mainThreadMessages[0]?.timestamp || '',
        endTime: mainThreadMessages[mainThreadMessages.length - 1]?.timestamp || '',
      },
    };

    // Calculate stats
    const stats = this.calculateStats(mainThreadMessages, subagentThreads);

    const session = this.parser.getParsedSession();

    return {
      sessionId: session.sessionId,
      version: session.version,
      cwd: session.cwd,
      gitBranch: session.gitBranch,
      startTime: session.startTime,
      endTime: session.endTime,
      mainThread,
      subagentThreads,
      stats: {
        ...stats,
        errors: session.metadata.errors,
      },
      tokens: {
        input: tokenUsage.totalInputTokens,
        output: tokenUsage.totalOutputTokens,
        cacheCreation: tokenUsage.totalCacheCreation,
        cacheRead: tokenUsage.totalCacheRead,
        total: tokenUsage.totalInputTokens + tokenUsage.totalOutputTokens,
      },
      rawEntries: this.entries,
    };
  }

  /**
   * Build main thread messages from timeline entries
   */
  private buildMainThreadMessages(
    toolUseMap: Map<string, EnrichedToolUse>
  ): DomainMessage[] {
    const messages: DomainMessage[] = [];
    const timelineEntries = this.parser.getTimelineEntries();

    // Track entries to skip (for merged slash commands)
    const skipUuids = new Set<string>();

    for (let i = 0; i < timelineEntries.length; i++) {
      const entry = timelineEntries[i];

      // Guard against undefined (TypeScript strict mode)
      if (!entry) {
        continue;
      }

      // Skip sidechain messages (subagent threads)
      if ('isSidechain' in entry && entry.isSidechain) {
        continue;
      }

      // Skip if already processed (merged slash commands)
      if ('uuid' in entry && skipUuids.has(entry.uuid)) {
        continue;
      }

      if (isUserEntry(entry)) {
        // Check for slash command pattern
        const nextEntry = timelineEntries[i + 1];
        const slashCommand = this.detectSlashCommand(entry, nextEntry);
        if (slashCommand) {
          messages.push(slashCommand);
          // Skip the next entry (command prompt)
          if (nextEntry && 'uuid' in nextEntry) {
            skipUuids.add((nextEntry as UserEntry).uuid);
          }
          continue;
        }

        // Check if this is a tool result message
        if (this.isToolResultUserMessage(entry)) {
          const toolResultMsg = this.buildToolResultMessage(entry);
          if (toolResultMsg) {
            messages.push(toolResultMsg);
          }
          continue;
        }

        // Regular user message
        messages.push(this.buildUserMessage(entry));
      } else if (isAssistantEntry(entry)) {
        // Process assistant entry content blocks
        const assistantMessages = this.buildAssistantMessages(entry, toolUseMap);
        messages.push(...assistantMessages);
      } else if (isSystemEntry(entry)) {
        messages.push(this.buildSystemMessage(entry));
      }
    }

    return messages;
  }

  /**
   * Detect and merge slash command messages
   */
  private detectSlashCommand(
    entry: UserEntry,
    nextEntry?: SessionEntry
  ): SlashCommandMessage | null {
    const content = entry.message.content;

    // Check if content contains <command-message> and <command-name>
    if (typeof content !== 'string') {
      return null;
    }

    const commandMessageMatch = content.match(/<command-message>([^<]+)<\/command-message>/);
    const commandNameMatch = content.match(/<command-name>\/([^<]+)<\/command-name>/);

    if (!commandMessageMatch || !commandNameMatch) {
      return null;
    }

    const commandName = commandNameMatch[1];

    // Next entry should be the command prompt (isMeta: true)
    if (!nextEntry || !isUserEntry(nextEntry) || !nextEntry.isMeta) {
      return null;
    }

    const commandPrompt = typeof nextEntry.message.content === 'string'
      ? nextEntry.message.content
      : '';

    return {
      type: 'slash_command',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      commandName,
      commandPrompt,
      sourceUuids: [entry.uuid, nextEntry.uuid],
    };
  }

  /**
   * Check if user entry is a tool result
   */
  private isToolResultUserMessage(entry: UserEntry): boolean {
    const content = entry.message.content;

    if (typeof content === 'string') {
      return false;
    }

    if (Array.isArray(content) && content.length > 0) {
      const firstItem = content[0];
      return (
        typeof firstItem === 'object' &&
        firstItem !== null &&
        'type' in firstItem &&
        firstItem.type === 'tool_result'
      );
    }

    return (
      typeof content === 'object' &&
      content !== null &&
      'type' in content &&
      content.type === 'tool_result'
    );
  }

  /**
   * Build tool result message from user entry
   */
  private buildToolResultMessage(entry: UserEntry): ToolResultMessage | null {
    const content = entry.message.content;

    if (typeof content === 'string') {
      return null;
    }

    const results: ToolResult[] = [];

    if (Array.isArray(content)) {
      for (const item of content) {
        if (
          typeof item === 'object' &&
          item !== null &&
          'type' in item &&
          item.type === 'tool_result' &&
          'tool_use_id' in item &&
          'content' in item
        ) {
          results.push(item as unknown as ToolResult);
        }
      }
    } else if (
      typeof content === 'object' &&
      content !== null &&
      'type' in content &&
      content.type === 'tool_result'
    ) {
      // This branch is for the object case (not array, not string)
      // But TypeScript can't narrow the union type properly
      // Skip this case as it's less common
    }

    if (results.length === 0) {
      return null;
    }

    return {
      type: 'tool_result_message',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      results,
      rawEntry: entry,
    };
  }

  /**
   * Build regular user message
   */
  private buildUserMessage(entry: UserEntry): UserMessage {
    const content = typeof entry.message.content === 'string'
      ? entry.message.content
      : JSON.stringify(entry.message.content);

    return {
      type: 'user_message',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      content,
      rawEntry: entry,
    };
  }

  /**
   * Build assistant messages from entry
   */
  private buildAssistantMessages(
    entry: AssistantEntry,
    toolUseMap: Map<string, EnrichedToolUse>
  ): DomainMessage[] {
    const messages: DomainMessage[] = [];
    const content = entry.message.content;

    if (typeof content === 'string') {
      messages.push({
        type: 'assistant_text',
        uuid: entry.uuid,
        timestamp: entry.timestamp,
        content,
        rawEntry: entry,
      });
      return messages;
    }

    // Process each content block
    for (const block of content) {
      if (block.type === 'text' && 'text' in block) {
        messages.push({
          type: 'assistant_text',
          uuid: entry.uuid,
          timestamp: entry.timestamp,
          content: block.text,
          rawEntry: entry,
        } satisfies AssistantTextMessage);
      } else if (block.type === 'thinking' && 'thinking' in block) {
        messages.push({
          type: 'assistant_thinking',
          uuid: entry.uuid,
          timestamp: entry.timestamp,
          thinking: block.thinking,
          rawEntry: entry,
        } satisfies AssistantThinkingMessage);
      } else if (isToolUse(block)) {
        // Check if this is a subagent invocation (Task tool)
        if (block.name === 'Task') {
          // Will be linked to thread later
          const taskInput = block.input as unknown as TaskToolInput;
          messages.push({
            type: 'subagent_invocation',
            uuid: entry.uuid,
            timestamp: entry.timestamp,
            toolUse: block,
            subagentType: taskInput.subagent_type || 'unknown',
            prompt: taskInput.prompt || '',
            description: taskInput.description || '',
            thread: {
              type: 'subagent',
              subagentType: taskInput.subagent_type || 'unknown',
              invocationId: block.id,
              prompt: taskInput.prompt || '',
              messages: [],
              rootUuid: '',
              leafUuid: '',
              metadata: {
                totalMessages: 0,
                startTime: '',
                endTime: '',
              },
            },
            rawEntry: entry,
          } satisfies SubagentInvocationMessage);
        } else {
          // Regular tool call
          const enriched = toolUseMap.get(block.id);
          messages.push({
            type: 'tool_call',
            uuid: entry.uuid,
            timestamp: entry.timestamp,
            toolUse: block,
            result: enriched?.result,
            resultTimestamp: enriched?.resultTimestamp,
            rawEntry: entry,
          } satisfies ToolCallMessage);
        }
      }
    }

    return messages;
  }

  /**
   * Build system message
   */
  private buildSystemMessage(entry: SystemEntry): SystemMessage {
    return {
      type: 'system_message',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      level: entry.level || 'info',
      content: entry.content,
      rawEntry: entry,
    };
  }

  /**
   * Build subagent threads from sidechain entries
   */
  private buildSubagentThreads(): Map<string, SubagentThread> {
    const threads = new Map<string, SubagentThread>();

    // Group sidechain entries by their root (find entries with isSidechain=true and parentUuid=null)
    const sidechainEntries = this.entries.filter(
      (e) => 'isSidechain' in e && e.isSidechain
    );

    // Build thread map by following parentUuid links
    const threadMap = new Map<string, SessionEntry[]>();

    for (const entry of sidechainEntries) {
      if (!('parentUuid' in entry) || !('uuid' in entry)) {
        continue;
      }

      // Find root of this thread
      let rootUuid = entry.uuid;
      let current = entry;

      while (current && 'parentUuid' in current && current.parentUuid) {
        const parent = sidechainEntries.find(
          (e) => 'uuid' in e && e.uuid === current.parentUuid
        );
        if (!parent || !('uuid' in parent)) break;
        current = parent;
        if ('uuid' in current) {
          rootUuid = current.uuid;
        }
      }

      if (!threadMap.has(rootUuid)) {
        threadMap.set(rootUuid, []);
      }
      threadMap.get(rootUuid)?.push(entry);
    }

    // Build SubagentThread for each thread
    for (const [rootUuid, entries] of threadMap) {
      // Sort entries by timestamp
      entries.sort((a, b) => {
        const timeA = 'timestamp' in a ? new Date(a.timestamp).getTime() : 0;
        const timeB = 'timestamp' in b ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });

      // First entry should be user message with prompt
      const firstEntry = entries[0];
      if (!isUserEntry(firstEntry)) {
        continue;
      }

      const prompt = typeof firstEntry.message.content === 'string'
        ? firstEntry.message.content
        : '';

      // Build messages for this thread
      const messages: DomainMessage[] = [];
      const enrichedToolUses = this.parser.getEnrichedToolUses();
      const toolUseMap = new Map(enrichedToolUses.map((t) => [t.id, t]));

      for (const entry of entries) {
        if (isUserEntry(entry)) {
          messages.push(this.buildUserMessage(entry));
        } else if (isAssistantEntry(entry)) {
          messages.push(...this.buildAssistantMessages(entry, toolUseMap));
        } else if (isSystemEntry(entry)) {
          messages.push(this.buildSystemMessage(entry));
        }
      }

      // Get UUIDs and timestamps safely
      const lastEntry = entries[entries.length - 1];
      const leafUuid = lastEntry && 'uuid' in lastEntry ? lastEntry.uuid : '';
      const startTime = firstEntry && 'timestamp' in firstEntry ? firstEntry.timestamp : '';
      const endTime = lastEntry && 'timestamp' in lastEntry ? lastEntry.timestamp : '';

      // We'll set invocationId and subagentType when linking
      threads.set(rootUuid, {
        type: 'subagent',
        subagentType: 'unknown', // Will be set during linking
        invocationId: '', // Will be set during linking
        prompt,
        messages,
        rootUuid,
        leafUuid,
        metadata: {
          totalMessages: messages.length,
          startTime,
          endTime,
        },
      });
    }

    return threads;
  }

  /**
   * Link subagent threads to their invocation messages
   */
  private linkSubagentThreads(
    mainMessages: DomainMessage[],
    subagentThreads: Map<string, SubagentThread>
  ): void {
    for (const msg of mainMessages) {
      if (msg.type === 'subagent_invocation') {
        // Find matching thread by prompt
        for (const [_rootUuid, thread] of subagentThreads) {
          if (thread.prompt === msg.prompt) {
            // Update invocation message with thread
            msg.thread = thread;
            // Update thread metadata
            thread.invocationId = msg.toolUse.id;
            thread.subagentType = msg.subagentType;
            // Re-add to map with invocation ID as key
            subagentThreads.set(msg.toolUse.id, thread);
            break;
          }
        }
      }
    }
  }

  /**
   * Calculate statistics
   */
  private calculateStats(
    mainMessages: DomainMessage[],
    _subagentThreads: Map<string, SubagentThread>
  ): {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    systemMessages: number;
    slashCommands: number;
    subagentInvocations: number;
    toolCalls: number;
  } {
    let userMessages = 0;
    let assistantMessages = 0;
    let systemMessages = 0;
    let slashCommands = 0;
    let subagentInvocations = 0;
    let toolCalls = 0;

    for (const msg of mainMessages) {
      switch (msg.type) {
        case 'user_message':
          userMessages++;
          break;
        case 'slash_command':
          slashCommands++;
          break;
        case 'assistant_text':
        case 'assistant_thinking':
          assistantMessages++;
          break;
        case 'tool_call':
          toolCalls++;
          break;
        case 'subagent_invocation':
          subagentInvocations++;
          break;
        case 'system_message':
          systemMessages++;
          break;
      }
    }

    return {
      totalMessages: mainMessages.length,
      userMessages,
      assistantMessages,
      systemMessages,
      slashCommands,
      subagentInvocations,
      toolCalls,
    };
  }
}

/**
 * Utility function to build enriched session from parser
 */
export function buildEnrichedSession(parser: SessionParser): EnrichedSession {
  const builder = new SessionDomainBuilder(parser);
  return builder.build();
}
