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
import { isAssistantEntry, isSystemEntry, isToolUse, isUserEntry } from '../types/session';
import type {
  AssistantTextMessage,
  AssistantThinkingMessage,
  ClearCommandMessage,
  CommandContext,
  CommandStdoutMessage,
  DomainMessage,
  EnrichedSession,
  RequestInterruptedMessage,
  SessionThread,
  SlashCommandMessage,
  SubagentContext,
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
  private buildMainThreadMessages(toolUseMap: Map<string, EnrichedToolUse>): DomainMessage[] {
    const messages: DomainMessage[] = [];
    const timelineEntries = this.parser.getTimelineEntries();

    // Track entries to skip (for merged slash commands)
    const skipUuids = new Set<string>();

    // Track current command context for output attribution
    let currentCommandContext: CommandContext | undefined = undefined;

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
        const nextEntry = timelineEntries[i + 1];
        const { message, skipNext } = this.processUserEntry(entry, nextEntry);

        // Handle special context changes
        if (message.type === 'clear_command') {
          // Apply current context before clearing
          message.commandContext = currentCommandContext;
          // Reset command context after /clear
          currentCommandContext = undefined;
        } else if (message.type === 'slash_command') {
          // Slash command sets its own context (don't overwrite)
          // Update current context for subsequent messages
          currentCommandContext = message.commandContext;
        } else {
          // Apply current command context to all other message types
          message.commandContext = currentCommandContext;
        }

        messages.push(message);

        // Skip next entry if needed (for slash commands and clear commands with prompts)
        if (skipNext && nextEntry && 'uuid' in nextEntry) {
          skipUuids.add((nextEntry as UserEntry).uuid);
        }
      } else if (isAssistantEntry(entry)) {
        // Process assistant entry content blocks
        const assistantMessages = this.buildAssistantMessages(entry, toolUseMap);
        // Apply command context to all assistant messages
        for (const msg of assistantMessages) {
          msg.commandContext = currentCommandContext;
        }
        messages.push(...assistantMessages);
      } else if (isSystemEntry(entry)) {
        const sysMsg = this.buildSystemMessage(entry);
        // Apply command context
        sysMsg.commandContext = currentCommandContext;
        messages.push(sysMsg);
      }
    }

    return messages;
  }

  /**
   * Process user entry and return appropriate message type
   * Handles tool results, clear commands, stdout, interrupts, etc.
   */
  private processUserEntry(
    entry: UserEntry,
    nextEntry?: SessionEntry
  ): { message: DomainMessage; skipNext: boolean } {
    // Check for /clear command pattern
    const clearCommand = this.detectClearCommand(entry);
    if (clearCommand) {
      if (nextEntry && isUserEntry(nextEntry) && nextEntry.isMeta) {
        return { message: clearCommand, skipNext: true };
      }
      return { message: clearCommand, skipNext: false };
    }

    // Check for command stdout pattern
    const stdoutMsg = this.detectCommandStdout(entry);
    if (stdoutMsg) {
      return { message: stdoutMsg, skipNext: false };
    }

    // Check for request interrupted pattern
    const interruptedMsg = this.detectRequestInterrupted(entry);
    if (interruptedMsg) {
      return { message: interruptedMsg, skipNext: false };
    }

    // Check for slash command pattern
    const slashCommand = this.detectSlashCommand(entry, nextEntry);
    if (slashCommand) {
      return { message: slashCommand, skipNext: true };
    }

    // Check if this is a tool result message
    if (this.isToolResultUserMessage(entry)) {
      const toolResultMsg = this.buildToolResultMessage(entry);
      if (toolResultMsg) {
        return { message: toolResultMsg, skipNext: false };
      }
    }

    // Regular user message
    const userMsg = this.buildUserMessage(entry);
    return { message: userMsg, skipNext: false };
  }

  /**
   * Detect /clear command pattern
   */
  private detectClearCommand(entry: UserEntry): ClearCommandMessage | null {
    const content = entry.message.content;

    if (typeof content !== 'string') {
      return null;
    }

    // Check for <command-name>/clear</command-name> pattern
    const commandNameMatch = content.match(/<command-name>\/clear<\/command-name>/);
    const commandMessageMatch = content.match(/<command-message>.*?clear.*?<\/command-message>/);

    if (!commandNameMatch || !commandMessageMatch) {
      return null;
    }

    return {
      type: 'clear_command',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      rawEntry: entry,
    };
  }

  /**
   * Detect command stdout pattern
   */
  private detectCommandStdout(entry: UserEntry): CommandStdoutMessage | null {
    const content = entry.message.content;

    if (typeof content !== 'string') {
      return null;
    }

    // Check for <local-command-stdout> pattern
    const stdoutMatch = content.match(/<local-command-stdout>(.*?)<\/local-command-stdout>/s);

    if (!stdoutMatch) {
      return null;
    }

    return {
      type: 'command_stdout',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      content: stdoutMatch[1] || '',
      rawEntry: entry,
    };
  }

  /**
   * Detect request interrupted pattern
   */
  private detectRequestInterrupted(entry: UserEntry): RequestInterruptedMessage | null {
    const content = entry.message.content;

    // Check if content is an array of content blocks
    if (typeof content === 'string' || !Array.isArray(content)) {
      return null;
    }

    // Check if first block has the interrupted pattern
    const firstBlock = content[0];
    if (
      !firstBlock ||
      typeof firstBlock !== 'object' ||
      !('type' in firstBlock) ||
      !('text' in firstBlock) ||
      firstBlock.type !== 'text'
    ) {
      return null;
    }

    const text = firstBlock.text;
    if (typeof text !== 'string' || text !== '[Request interrupted by user for tool use]') {
      return null;
    }

    return {
      type: 'request_interrupted',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      rawEntry: entry,
    };
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

    if (!commandMessageMatch || !commandNameMatch || !commandNameMatch[1]) {
      return null;
    }

    const commandName = commandNameMatch[1];

    // Next entry should be the command prompt (isMeta: true)
    if (!nextEntry || !isUserEntry(nextEntry) || !nextEntry.isMeta) {
      return null;
    }

    const commandPrompt =
      typeof nextEntry.message.content === 'string' ? nextEntry.message.content : '';

    return {
      type: 'slash_command',
      uuid: entry.uuid,
      timestamp: entry.timestamp,
      commandName,
      commandPrompt,
      sourceUuids: [entry.uuid, nextEntry.uuid],
      commandContext: {
        command: `/${commandName}`,
        commandUuid: entry.uuid,
      },
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
    }
    // Note: content can only be string or array based on UserEntry type definition
    // So no need to handle plain object case

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
    const content =
      typeof entry.message.content === 'string'
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
    // Only include conversation entries (user, assistant, system)
    const sidechainEntries = this.entries.filter(
      (e): e is UserEntry | AssistantEntry | SystemEntry =>
        'isSidechain' in e &&
        e.isSidechain === true &&
        (isUserEntry(e) || isAssistantEntry(e) || isSystemEntry(e))
    );

    // Build thread map by following parentUuid links
    const threadMap = new Map<string, (UserEntry | AssistantEntry | SystemEntry)[]>();

    for (const entry of sidechainEntries) {
      if (!('parentUuid' in entry) || !('uuid' in entry)) {
        continue;
      }

      // Find root of this thread
      let rootUuid = entry.uuid;
      let current = entry;

      while (current && 'parentUuid' in current && current.parentUuid) {
        const parent = sidechainEntries.find((e) => 'uuid' in e && e.uuid === current.parentUuid);
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
      if (!firstEntry || !isUserEntry(firstEntry)) {
        continue;
      }

      const prompt =
        typeof firstEntry.message.content === 'string' ? firstEntry.message.content : '';

      // Build messages for this thread
      const messages: DomainMessage[] = [];
      const enrichedToolUses = this.parser.getEnrichedToolUses();
      const toolUseMap = new Map(enrichedToolUses.map((t) => [t.id, t]));

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry) continue;

        // Entries are already filtered to user/assistant/system only
        if (isUserEntry(entry)) {
          const nextEntry = entries[i + 1];
          const { message } = this.processUserEntry(entry, nextEntry);
          messages.push(message);
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

            // Create subagent context for this thread
            const subagentContext: SubagentContext = {
              subagent: msg.subagentType,
              invocationId: msg.toolUse.id,
            };

            // Apply subagent context and propagate command context to all messages in thread
            for (const threadMsg of thread.messages) {
              threadMsg.subagentContext = subagentContext;
              // Propagate command context from invocation message
              if (msg.commandContext) {
                threadMsg.commandContext = msg.commandContext;
              }
            }

            // Delete old entry keyed by rootUuid to avoid duplicates
            subagentThreads.delete(_rootUuid);
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
