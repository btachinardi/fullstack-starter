/**
 * Session Tool Types
 *
 * Type definitions for session management functionality.
 */

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
	role: "user" | "assistant";
	content: string;
}

export interface BashCommand {
	command: string;
	description?: string;
}

export interface SessionListItem {
	index: number;
	filePath: string;
	fileName: string;
	timestamp: string;
	title: string;
	sessionId: string;
}

export interface SessionMarkdownOptions {
	includeThinking?: boolean;
	includeToolDetails?: boolean;
	includeSystemMessages?: boolean;
	maxOutputLength?: number;
	noTruncate?: boolean;
}

export interface SessionToolsOptions {
	includeCount: boolean;
}

export interface SessionFilesOptions {
	filterRead?: boolean;
	filterWritten?: boolean;
	filterEdited?: boolean;
}

export interface SessionConversationOptions {
	limit?: number;
}

export interface SessionExportOptions {
	pretty?: boolean;
}

export interface EnrichedMarkdownResult {
	mainMarkdown: string;
	subagentFiles: Array<{
		filename: string;
		content: string;
		subagentType: string;
	}>;
	filesWritten: string[];
}
