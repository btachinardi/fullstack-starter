/**
 * Session Domain Types
 *
 * Enhanced domain model for Claude Code sessions with specialized message types,
 * thread management, and semantic grouping. This represents the "Phase 2" types
 * that are built from the raw session entries.
 */

import type {
	AssistantEntry,
	SessionEntry,
	SystemEntry,
	ToolResult,
	ToolUse,
	UserEntry,
} from "./session";

// ============================================================================
// Thread and Message Identification
// ============================================================================

/**
 * Unique identifier for messages within a thread
 */
export type MessageId = string;

/**
 * Thread context identifying whether a message belongs to main or subagent thread
 */
export interface ThreadContext {
	/** Thread type: main conversation or subagent execution */
	type: "main" | "subagent";
	/** For subagent threads: the Tool ID that started the thread */
	parentToolId?: string;
	/** For subagent threads: the subagent type */
	subagentType?: string;
}

// ============================================================================
// Context Tracking (for output attribution)
// ============================================================================

/**
 * Command context - tracks which slash command initiated this message
 * Used for output attribution in self-improving agentic systems
 */
export interface CommandContext {
	/** Command name with slash (e.g., "/git:commit") */
	command: string;
	/** UUID of the command invocation message */
	commandUuid: string;
}

/**
 * Subagent context - tracks if message is from a subagent
 */
export interface SubagentContext {
	/** Subagent type (e.g., "commit-grouper") */
	subagent: string;
	/** Subagent invocation ID */
	invocationId: string;
}

// ============================================================================
// Specialized Message Types
// ============================================================================

/**
 * Slash command invocation with merged command name and prompt
 */
export interface SlashCommandMessage {
	type: "slash_command";
	uuid: MessageId;
	timestamp: string;
	/** Command name without slash (e.g., "git:commit") */
	commandName: string;
	/** Full command prompt/definition */
	commandPrompt: string;
	/** Original user entry UUIDs that were merged */
	sourceUuids: [string, string]; // [invocation uuid, prompt uuid]
	/** Command context (always set for slash commands) */
	commandContext: CommandContext;
	/** Subagent context (undefined for main thread) */
	subagentContext?: SubagentContext;
}

/**
 * Regular user message (not a tool result or slash command)
 */
export interface UserMessage {
	type: "user_message";
	uuid: MessageId;
	timestamp: string;
	content: string;
	/** Raw entry for additional metadata */
	rawEntry: UserEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Tool result message (user message containing tool results)
 */
export interface ToolResultMessage {
	type: "tool_result_message";
	uuid: MessageId;
	timestamp: string;
	/** Tool results contained in this message */
	results: ToolResult[];
	/** Raw entry for additional metadata */
	rawEntry: UserEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Assistant text response (not including tool uses/thinking)
 */
export interface AssistantTextMessage {
	type: "assistant_text";
	uuid: MessageId;
	timestamp: string;
	content: string;
	/** Raw entry for additional metadata */
	rawEntry: AssistantEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Assistant thinking block
 */
export interface AssistantThinkingMessage {
	type: "assistant_thinking";
	uuid: MessageId;
	timestamp: string;
	thinking: string;
	/** Raw entry for additional metadata */
	rawEntry: AssistantEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Tool call message (assistant calling a tool)
 */
export interface ToolCallMessage {
	type: "tool_call";
	uuid: MessageId;
	timestamp: string;
	/** The tool being called */
	toolUse: ToolUse;
	/** Matched result (if available) */
	result?: ToolResult;
	/** Timestamp of result */
	resultTimestamp?: string;
	/** Raw entry for additional metadata */
	rawEntry: AssistantEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Subagent invocation (special case of tool call for Task tool)
 */
export interface SubagentInvocationMessage {
	type: "subagent_invocation";
	uuid: MessageId;
	timestamp: string;
	/** The tool use that started the subagent */
	toolUse: ToolUse;
	/** Subagent type */
	subagentType: string;
	/** Prompt passed to subagent */
	prompt: string;
	/** Short description of task */
	description: string;
	/** The subagent's message thread */
	thread: SubagentThread;
	/** Raw entry for additional metadata */
	rawEntry: AssistantEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (always undefined for invocation in main thread) */
	subagentContext?: SubagentContext;
}

/**
 * System message (info, warning, error)
 */
export interface SystemMessage {
	type: "system_message";
	uuid: MessageId;
	timestamp: string;
	level: "info" | "warning" | "error";
	content: string;
	/** Raw entry for additional metadata */
	rawEntry: SystemEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Clear command invocation (special case of user message)
 */
export interface ClearCommandMessage {
	type: "clear_command";
	uuid: MessageId;
	timestamp: string;
	/** Raw entry for additional metadata */
	rawEntry: UserEntry;
	/** Command context (cleared after this message) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Command stdout message (local command output, hidden in rendering)
 */
export interface CommandStdoutMessage {
	type: "command_stdout";
	uuid: MessageId;
	timestamp: string;
	content: string;
	/** Raw entry for additional metadata */
	rawEntry: UserEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Request interrupted message (user interrupted tool use)
 */
export interface RequestInterruptedMessage {
	type: "request_interrupted";
	uuid: MessageId;
	timestamp: string;
	/** Raw entry for additional metadata */
	rawEntry: UserEntry;
	/** Command context (if message is within a command invocation) */
	commandContext?: CommandContext;
	/** Subagent context (if message is in a subagent thread) */
	subagentContext?: SubagentContext;
}

/**
 * Union type for all domain message types
 */
export type DomainMessage =
	| SlashCommandMessage
	| UserMessage
	| ToolResultMessage
	| AssistantTextMessage
	| AssistantThinkingMessage
	| ToolCallMessage
	| SubagentInvocationMessage
	| SystemMessage
	| ClearCommandMessage
	| CommandStdoutMessage
	| RequestInterruptedMessage;

// ============================================================================
// Thread Types
// ============================================================================

/**
 * A linked list of messages forming a conversation thread
 */
export interface MessageThread {
	/** Messages in chronological order */
	messages: DomainMessage[];
	/** First message UUID (thread root) */
	rootUuid: string;
	/** Last message UUID (thread leaf) */
	leafUuid: string;
	/** Thread metadata */
	metadata: {
		/** Total messages in thread */
		totalMessages: number;
		/** Start time */
		startTime: string;
		/** End time */
		endTime: string;
	};
}

/**
 * Main session conversation thread
 */
export interface SessionThread extends MessageThread {
	type: "main";
}

/**
 * Subagent execution thread
 */
export interface SubagentThread extends MessageThread {
	type: "subagent";
	/** Subagent type (e.g., "commit-grouper") */
	subagentType: string;
	/** Tool invocation ID that started this thread */
	invocationId: string;
	/** Original prompt passed to subagent */
	prompt: string;
}

// ============================================================================
// Enhanced Session Structure
// ============================================================================

/**
 * Fully transformed session with domain model
 */
export interface EnrichedSession {
	/** Session metadata */
	sessionId: string;
	version: string;
	cwd: string;
	gitBranch?: string;
	startTime: string;
	endTime: string;

	/** Main conversation thread */
	mainThread: SessionThread;

	/** All subagent threads (indexed by invocation ID) */
	subagentThreads: Map<string, SubagentThread>;

	/** Statistics */
	stats: {
		totalMessages: number;
		userMessages: number;
		assistantMessages: number;
		systemMessages: number;
		slashCommands: number;
		subagentInvocations: number;
		toolCalls: number;
		errors: number;
	};

	/** Token usage */
	tokens: {
		input: number;
		output: number;
		cacheCreation: number;
		cacheRead: number;
		total: number;
	};

	/** Raw session entries (for fallback/debugging) */
	rawEntries: SessionEntry[];
}

// ============================================================================
// Type Guards
// ============================================================================

export function isSlashCommandMessage(
	msg: DomainMessage,
): msg is SlashCommandMessage {
	return msg.type === "slash_command";
}

export function isUserMessage(msg: DomainMessage): msg is UserMessage {
	return msg.type === "user_message";
}

export function isToolResultMessage(
	msg: DomainMessage,
): msg is ToolResultMessage {
	return msg.type === "tool_result_message";
}

export function isAssistantTextMessage(
	msg: DomainMessage,
): msg is AssistantTextMessage {
	return msg.type === "assistant_text";
}

export function isAssistantThinkingMessage(
	msg: DomainMessage,
): msg is AssistantThinkingMessage {
	return msg.type === "assistant_thinking";
}

export function isToolCallMessage(msg: DomainMessage): msg is ToolCallMessage {
	return msg.type === "tool_call";
}

export function isSubagentInvocationMessage(
	msg: DomainMessage,
): msg is SubagentInvocationMessage {
	return msg.type === "subagent_invocation";
}

export function isSystemMessage(msg: DomainMessage): msg is SystemMessage {
	return msg.type === "system_message";
}

export function isClearCommandMessage(
	msg: DomainMessage,
): msg is ClearCommandMessage {
	return msg.type === "clear_command";
}

export function isCommandStdoutMessage(
	msg: DomainMessage,
): msg is CommandStdoutMessage {
	return msg.type === "command_stdout";
}

export function isRequestInterruptedMessage(
	msg: DomainMessage,
): msg is RequestInterruptedMessage {
	return msg.type === "request_interrupted";
}
