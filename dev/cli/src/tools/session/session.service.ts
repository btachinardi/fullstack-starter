/**
 * Session Service
 *
 * Business logic for working with Claude Code session files.
 * These are pure functions that the CLI dispatches to.
 */

import { buildEnrichedSession } from "./session.domain-builder.js";
import { SessionParser } from "./session.parser.js";
import type {
	BashCommand,
	ConversationMessage,
	EnrichedMarkdownResult,
	FileAccessResult,
	SessionConversationOptions,
	SessionExportOptions,
	SessionFilesOptions,
	SessionInfoResult,
	SessionListItem,
	SessionMarkdownOptions,
	SessionToolsOptions,
	SubagentInvocation,
	ToolUsage,
} from "./session.types.js";
import type {
	DomainMessage,
	SubagentInvocationMessage,
	SubagentThread,
	ToolCallMessage,
} from "./session-domain.types.js";
import {
	isAssistantTextMessage,
	isAssistantThinkingMessage,
	isClearCommandMessage,
	isCommandStdoutMessage,
	isRequestInterruptedMessage,
	isSlashCommandMessage,
	isSubagentInvocationMessage,
	isSystemMessage,
	isToolCallMessage,
	isUserMessage,
} from "./session-domain.types.js";

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Get comprehensive session information
 */
export async function sessionInfo(
	filePath: string,
): Promise<SessionInfoResult> {
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
	options: SessionToolsOptions = { includeCount: false },
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
	options: SessionFilesOptions = {},
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
export async function sessionAgents(
	filePath: string,
): Promise<SubagentInvocation[]> {
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
	options: SessionConversationOptions = {},
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
	options: SessionExportOptions = {},
): Promise<string> {
	const parser = new SessionParser();
	const session = await parser.load(filePath);

	return options.pretty
		? JSON.stringify(session, null, 2)
		: JSON.stringify(session);
}

/**
 * Export session to markdown format (using enriched domain model)
 */
export async function sessionToMarkdown(
	filePath: string,
	options: SessionMarkdownOptions = {},
): Promise<string> {
	const parser = new SessionParser();
	const session = await parser.load(filePath);
	const enrichedSession = buildEnrichedSession(parser);

	const {
		includeThinking = true,
		includeToolDetails = true,
		includeSystemMessages = true,
		maxOutputLength = 10000,
		noTruncate = true,
	} = options;

	let markdown = "";

	// Header
	markdown += `# Session: ${session.sessionId}\n\n`;
	markdown += `**Start:** ${new Date(session.startTime).toLocaleString()}\n`;
	markdown += `**End:** ${new Date(session.endTime).toLocaleString()}\n`;
	markdown += `**Working Directory:** \`${session.cwd}\`\n`;
	if (session.gitBranch) {
		markdown += `**Git Branch:** \`${session.gitBranch}\`\n`;
	}
	markdown += "\n---\n\n";

	// Use session ID prefix for subagent links
	const sessionPrefix = session.sessionId.substring(0, 8);

	// Process main thread messages using enriched domain model
	for (const msg of enrichedSession.mainThread.messages) {
		markdown += formatDomainMessage(
			msg,
			sessionPrefix,
			includeThinking,
			includeToolDetails,
			includeSystemMessages,
			maxOutputLength,
			noTruncate,
		);
	}

	return markdown;
}

/**
 * List session files with metadata (requires project path)
 */
export async function sessionList(
	projectPath?: string,
): Promise<SessionListItem[]> {
	const { readdir } = await import("node:fs/promises");
	const { join, resolve, basename } = await import("node:path");
	const { homedir } = await import("node:os");

	// Get absolute path and transform it to match Claude's project directory naming
	const projectDir = resolve(projectPath || process.cwd());
	// Transform: C:\Users\bruno\... -> C--Users-bruno-...
	const projectName = projectDir
		.replace(/\\/g, "-") // Replace backslashes
		.replace(/\//g, "-") // Replace forward slashes
		.replace(/:/g, "-"); // Replace colons

	const sessionsDir = join(homedir(), ".claude", "projects", projectName);

	console.log(`Looking for sessions in: ${sessionsDir}`);

	try {
		const files = await readdir(sessionsDir);
		const sessionFiles = files.filter((f) => f.endsWith(".jsonl"));
		console.log(`Found ${sessionFiles.length} session file(s)`);

		// Parse each session to get metadata
		const sessionItems: SessionListItem[] = [];

		for (const file of sessionFiles) {
			const filePath = join(sessionsDir, file);
			try {
				const parser = new SessionParser();
				const session = await parser.load(filePath);

				// Get first user message
				const conversation = parser.getConversationFlow();
				const firstUserMessage = conversation.find(
					(msg) => msg.role === "user",
				);
				const title = firstUserMessage
					? firstUserMessage.content.substring(0, 80).replace(/\n/g, " ")
					: "No user message found";

				sessionItems.push({
					index: 0, // Will be set after sorting
					filePath,
					fileName: basename(file, ".jsonl"),
					timestamp: session.startTime,
					title,
					sessionId: session.sessionId,
				});
			} catch (error) {
				console.log(
					`Failed to parse session ${file}: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		}

		// Sort by timestamp (most recent first)
		sessionItems.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);

		// Add index numbers
		sessionItems.forEach((item, index) => {
			item.index = index + 1;
		});

		return sessionItems;
	} catch (error) {
		console.log(
			`Failed to read sessions directory: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return [];
	}
}

/**
 * Export session to enriched markdown format with subagent threads
 */
export async function sessionToEnrichedMarkdown(
	filePath: string,
	options: SessionMarkdownOptions & { outputDir?: string } = {},
): Promise<EnrichedMarkdownResult> {
	const parser = new SessionParser();
	const session = await parser.load(filePath);
	const enrichedSession = buildEnrichedSession(parser);

	const {
		includeThinking = true,
		includeToolDetails = true,
		includeSystemMessages = true,
		maxOutputLength = 10000,
		noTruncate = true,
		outputDir,
	} = options;

	// Generate main markdown
	let mainMarkdown = "";

	// Header
	mainMarkdown += `# Session: ${session.sessionId}\n\n`;
	mainMarkdown += `**Start:** ${new Date(session.startTime).toLocaleString()}\n`;
	mainMarkdown += `**End:** ${new Date(session.endTime).toLocaleString()}\n`;
	mainMarkdown += `**Working Directory:** \`${session.cwd}\`\n`;
	if (session.gitBranch) {
		mainMarkdown += `**Git Branch:** \`${session.gitBranch}\`\n`;
	}
	mainMarkdown += "\n---\n\n";

	// Use session ID prefix to avoid collisions between sessions
	const sessionPrefix = session.sessionId.substring(0, 8);

	// Process main thread messages
	for (const msg of enrichedSession.mainThread.messages) {
		mainMarkdown += formatDomainMessage(
			msg,
			sessionPrefix,
			includeThinking,
			includeToolDetails,
			includeSystemMessages,
			maxOutputLength,
			noTruncate,
		);
	}

	// Generate subagent thread markdown files
	const subagentFiles: Array<{
		filename: string;
		content: string;
		subagentType: string;
	}> = [];
	const filesWritten: string[] = [];

	for (const [invocationId, thread] of enrichedSession.subagentThreads) {
		const threadMarkdown = formatSubagentThread(
			thread,
			sessionPrefix,
			includeThinking,
			includeToolDetails,
			includeSystemMessages,
			maxOutputLength,
			noTruncate,
		);

		const filename = `${sessionPrefix}-subagent-${thread.subagentType}-${invocationId.substring(0, 8)}.md`;
		subagentFiles.push({
			filename,
			content: threadMarkdown,
			subagentType: thread.subagentType,
		});

		// Write file to disk if outputDir specified
		if (outputDir) {
			const { writeFile, mkdir } = await import("node:fs/promises");
			const { join } = await import("node:path");

			// Ensure output directory exists
			await mkdir(outputDir, { recursive: true });

			const fullPath = join(outputDir, filename);
			await writeFile(fullPath, threadMarkdown, "utf-8");
			filesWritten.push(fullPath);
		}
	}

	// Write main markdown file if outputDir specified
	if (outputDir) {
		const { writeFile, mkdir } = await import("node:fs/promises");
		const { join } = await import("node:path");

		await mkdir(outputDir, { recursive: true });

		const mainFilename = `${sessionPrefix}-session.md`;
		const mainPath = join(outputDir, mainFilename);
		await writeFile(mainPath, mainMarkdown, "utf-8");
		filesWritten.unshift(mainPath); // Add main file at the beginning
	}

	return {
		mainMarkdown,
		subagentFiles,
		filesWritten,
	};
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Helper function to format context badges for markdown
 */
function formatContextBadges(msg: DomainMessage): string {
	const badges: string[] = [];

	if (msg.commandContext) {
		badges.push(`\`${msg.commandContext.command}\``);
	}

	if (msg.subagentContext) {
		badges.push(`\`@${msg.subagentContext.subagent}\``);
	}

	return badges.length > 0 ? `${badges.join(" ")} ` : "";
}

/**
 * Find the minimum heading level in markdown text
 * @param text - The markdown text to analyze
 * @returns The minimum heading level found (1-6), or null if no headings
 */
function findMinHeadingLevel(text: string): number | null {
	const lines = text.split("\n");
	let minLevel: number | null = null;

	for (const line of lines) {
		const headingMatch = line.match(/^(#{1,6})\s/);
		if (headingMatch) {
			const currentHashes = headingMatch[1] || "";
			const level = currentHashes.length;
			if (minLevel === null || level < minLevel) {
				minLevel = level;
			}
		}
	}

	return minLevel;
}

/**
 * Adjust markdown heading levels to maintain proper hierarchy
 * @param text - The markdown text to adjust
 * @param parentLevel - The heading level of the parent section (e.g., 2 for h2)
 * @returns Text with adjusted heading levels
 */
function adjustMarkdownHeadings(text: string, parentLevel: number): string {
	const minLevel = findMinHeadingLevel(text);

	// If no headings found, return as-is
	if (minLevel === null) return text;

	// Calculate offset: content headings should be children of parent (parentLevel + 1)
	// But only if they would conflict (be at or above parent level)
	const targetLevel = parentLevel + 1;
	const offset = minLevel <= parentLevel ? targetLevel - minLevel : 0;

	// If no adjustment needed, return as-is
	if (offset === 0) return text;

	const lines = text.split("\n");
	const adjustedLines = lines.map((line) => {
		const headingMatch = line.match(/^(#{1,6})\s/);
		if (headingMatch) {
			const currentHashes = headingMatch[1] || "";
			const currentLevel = currentHashes.length;
			const newLevel = Math.min(currentLevel + offset, 6); // Cap at h6
			const newHashes = "#".repeat(newLevel);
			return line.replace(/^#{1,6}\s/, `${newHashes} `);
		}
		return line;
	});

	return adjustedLines.join("\n");
}

function formatToolInput(
	toolName: string,
	input: Record<string, unknown>,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	// Format tool inputs in a readable way based on tool type
	switch (toolName) {
		case "Bash":
			return formatBashInput(input);
		case "Read":
			return formatReadInput(input);
		case "Write":
			return formatWriteInput(input, maxOutputLength, noTruncate);
		case "Edit":
			return formatEditInput(input, maxOutputLength, noTruncate);
		case "Grep":
			return formatGrepInput(input);
		case "Glob":
			return formatGlobInput(input);
		default:
			// Fallback: JSON format for other tools
			return `**Input:**\n\`\`\`json\n${JSON.stringify(input, null, 2)}\n\`\`\`\n`;
	}
}

function formatBashInput(input: Record<string, unknown>): string {
	const command = input.command as string;
	const description = input.description as string | undefined;

	let md = "";
	if (command) {
		md += `**Command:** \`${command}\`\n`;
	}
	if (description) {
		md += `**Description:** ${description}\n`;
	}
	return md;
}

function formatReadInput(input: Record<string, unknown>): string {
	const filePath = input.file_path as string;
	const offset = input.offset as number | undefined;
	const limit = input.limit as number | undefined;

	let md = `**File:** \`${filePath}\`\n`;
	if (offset !== undefined) md += `**Offset:** ${offset}\n`;
	if (limit !== undefined) md += `**Limit:** ${limit} lines\n`;
	return md;
}

function formatWriteInput(
	input: Record<string, unknown>,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	const filePath = input.file_path as string;
	const content = input.content as string;

	let md = `**File:** \`${filePath}\`\n`;

	// Show content (with truncation if needed)
	if (content) {
		let displayContent = content;
		const truncated = !noTruncate && content.length > maxOutputLength;

		if (truncated) {
			displayContent = content.substring(0, maxOutputLength);
		}

		md += `**Content:**\n\`\`\`\n${displayContent}`;
		if (truncated) {
			md += `\n\n... (truncated, ${content.length - maxOutputLength} more characters)`;
		}
		md += "\n```\n";
	}

	return md;
}

function formatEditInput(
	input: Record<string, unknown>,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	const filePath = input.file_path as string;
	const oldString = input.old_string as string | undefined;
	const newString = input.new_string as string | undefined;

	let md = `**File:** \`${filePath}\`\n`;

	// Show old string (with truncation if needed)
	if (oldString) {
		let displayOld = oldString;
		const truncated = !noTruncate && oldString.length > maxOutputLength;

		if (truncated) {
			displayOld = oldString.substring(0, maxOutputLength);
		}

		md += `**Replace:**\n\`\`\`\n${displayOld}`;
		if (truncated) {
			md += `\n\n... (truncated, ${oldString.length - maxOutputLength} more characters)`;
		}
		md += "\n```\n";
	}

	// Show new string (with truncation if needed)
	if (newString) {
		let displayNew = newString;
		const truncated = !noTruncate && newString.length > maxOutputLength;

		if (truncated) {
			displayNew = newString.substring(0, maxOutputLength);
		}

		md += `**With:**\n\`\`\`\n${displayNew}`;
		if (truncated) {
			md += `\n\n... (truncated, ${newString.length - maxOutputLength} more characters)`;
		}
		md += "\n```\n";
	}

	return md;
}

function formatGrepInput(input: Record<string, unknown>): string {
	const pattern = input.pattern as string;
	const path = input.path as string | undefined;
	const glob = input.glob as string | undefined;

	let md = `**Pattern:** \`${pattern}\`\n`;
	if (path) md += `**Path:** \`${path}\`\n`;
	if (glob) md += `**Glob:** \`${glob}\`\n`;
	return md;
}

function formatGlobInput(input: Record<string, unknown>): string {
	const pattern = input.pattern as string;
	const path = input.path as string | undefined;

	let md = `**Pattern:** \`${pattern}\`\n`;
	if (path) md += `**Path:** \`${path}\`\n`;
	return md;
}

/**
 * Format a domain message for markdown
 */
function formatDomainMessage(
	msg: DomainMessage,
	sessionPrefix: string,
	includeThinking: boolean,
	includeToolDetails: boolean,
	includeSystemMessages: boolean,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	let md = "";
	const timestamp = new Date(msg.timestamp).toLocaleTimeString();
	const contextBadges = formatContextBadges(msg);

	// Skip command stdout messages (hidden in rendering)
	if (isCommandStdoutMessage(msg)) {
		return "";
	}

	if (isClearCommandMessage(msg)) {
		md += `## 🧹 Clear Command ${contextBadges}_${timestamp}_\n\n`;
		md += "_Session context cleared_\n\n";
		md += "---\n\n";
	} else if (isRequestInterruptedMessage(msg)) {
		md += `## ⛔ Request Interrupted ${contextBadges}_${timestamp}_\n\n`;
		md += "_User interrupted tool use_\n\n";
		md += "---\n\n";
	} else if (isSlashCommandMessage(msg)) {
		// Omit command name from title since we have the badge
		md += `## ⚡ Slash Command ${contextBadges}_${timestamp}_\n\n`;

		// Only show prompt details if prompt is not empty
		if (includeToolDetails && msg.commandPrompt && msg.commandPrompt.trim()) {
			md += "### Command Prompt\n\n";
			md += adjustMarkdownHeadings(msg.commandPrompt, 3); // Parent is h3
			md += "\n\n";
		}
		md += "---\n\n";
	} else if (isUserMessage(msg)) {
		md += `## 👤 User ${contextBadges}_${timestamp}_\n\n`;
		md += `${adjustMarkdownHeadings(msg.content, 2)}\n\n`; // Parent is h2
		md += "---\n\n";
	} else if (isAssistantTextMessage(msg)) {
		md += `## 🤖 Assistant ${contextBadges}_${timestamp}_\n\n`;
		md += `${adjustMarkdownHeadings(msg.content, 2)}\n\n`; // Parent is h2
		md += "---\n\n";
	} else if (isAssistantThinkingMessage(msg) && includeThinking) {
		md += `## 🧠 Assistant (thinking) ${contextBadges}_${timestamp}_\n\n`;
		md += `> ${msg.thinking.split("\n").join("\n> ")}\n\n`;
		md += "---\n\n";
	} else if (isToolCallMessage(msg)) {
		md += formatToolCall(
			msg,
			timestamp,
			contextBadges,
			includeToolDetails,
			maxOutputLength,
			noTruncate,
		);
	} else if (isSubagentInvocationMessage(msg)) {
		md += formatSubagentInvocation(
			msg,
			sessionPrefix,
			timestamp,
			contextBadges,
			includeToolDetails,
		);
	} else if (isSystemMessage(msg) && includeSystemMessages) {
		const emoji =
			msg.level === "error" ? "❌" : msg.level === "warning" ? "⚠️" : "📊";
		const levelLabel = msg.level.toUpperCase();
		md += `## ${emoji} System ${levelLabel} ${contextBadges}_${timestamp}_\n\n`;
		md += `${adjustMarkdownHeadings(msg.content, 2)}\n\n`; // Parent is h2
		md += "---\n\n";
	}

	return md;
}

/**
 * Format tool call message
 */
function formatToolCall(
	msg: ToolCallMessage,
	timestamp: string,
	contextBadges: string,
	includeDetails: boolean,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	let md = `## 🔧 Tool: ${msg.toolUse.name} ${contextBadges}_${timestamp}_\n\n`;

	if (includeDetails) {
		md += formatToolInput(
			msg.toolUse.name,
			msg.toolUse.input,
			maxOutputLength,
			noTruncate,
		);
		md += "\n";
	}

	md += "---\n\n";

	// Show result if available
	if (msg.result) {
		const resultTimestamp = msg.resultTimestamp
			? new Date(msg.resultTimestamp).toLocaleTimeString()
			: "";
		const emoji = msg.result.is_error ? "❌" : "✅";
		const status = msg.result.is_error ? "Error" : "Result";

		md += `## ${emoji} Tool ${status} ${contextBadges}_${resultTimestamp}_\n\n`;

		if (includeDetails) {
			md += formatToolResultContent(
				msg.result.content,
				maxOutputLength,
				noTruncate,
			);
		}

		md += "---\n\n";
	}

	return md;
}

/**
 * Format tool result content
 */
function formatToolResultContent(
	content: string | Array<{ type: string; [key: string]: unknown }>,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	let md = "";

	if (typeof content === "string") {
		let output = content;
		if (!noTruncate && content.length > maxOutputLength) {
			output = `${content.substring(0, maxOutputLength)}\n\n... (truncated)`;
		}
		md += "```\n";
		md += output;
		md += "\n```\n\n";
	} else if (Array.isArray(content)) {
		for (const block of content) {
			if (typeof block === "object" && block !== null) {
				if ("type" in block && block.type === "text" && "text" in block) {
					let textContent = block.text as string;
					if (!noTruncate && textContent.length > maxOutputLength) {
						textContent = `${textContent.substring(0, maxOutputLength)}\n\n... (truncated)`;
					}
					md += "```\n";
					md += textContent;
					md += "\n```\n\n";
				} else {
					md += "```json\n";
					md += JSON.stringify(block, null, 2);
					md += "\n```\n\n";
				}
			}
		}
	}

	return md;
}

/**
 * Format subagent invocation message
 */
function formatSubagentInvocation(
	msg: SubagentInvocationMessage,
	sessionPrefix: string,
	timestamp: string,
	contextBadges: string,
	includeDetails: boolean,
): string {
	let md = `## 🤖 Subagent Invocation: ${msg.subagentType} ${contextBadges}_${timestamp}_\n\n`;
	md += `**Subagent Type:** \`${msg.subagentType}\`\n`;
	md += `**Description:** ${msg.description}\n`;
	md += `**Invocation ID:** \`${msg.toolUse.id}\`\n\n`;

	if (includeDetails && msg.prompt) {
		md += "### Prompt\n\n";
		md += adjustMarkdownHeadings(msg.prompt, 3); // Parent is h3
		md += "\n\n";
	}

	// Link to subagent thread file with session prefix
	const filename = `${sessionPrefix}-subagent-${msg.subagentType}-${msg.toolUse.id.substring(0, 8)}.md`;
	md += `📄 **Thread:** [${filename}](./${filename})\n\n`;
	md += `**Thread Stats:** ${msg.thread.metadata.totalMessages} messages\n\n`;

	md += "---\n\n";

	return md;
}

/**
 * Format subagent thread to markdown
 */
function formatSubagentThread(
	thread: SubagentThread,
	sessionPrefix: string,
	includeThinking: boolean,
	includeToolDetails: boolean,
	includeSystemMessages: boolean,
	maxOutputLength: number,
	noTruncate: boolean,
): string {
	let md = "";

	// Header
	md += `# Subagent Thread: ${thread.subagentType}\n\n`;
	md += `**Invocation ID:** \`${thread.invocationId}\`\n`;
	md += `**Start:** ${new Date(thread.metadata.startTime).toLocaleString()}\n`;
	md += `**End:** ${new Date(thread.metadata.endTime).toLocaleString()}\n`;
	md += `**Total Messages:** ${thread.metadata.totalMessages}\n\n`;

	md += "## Original Prompt\n\n";
	md += adjustMarkdownHeadings(thread.prompt, 2); // Parent is h2
	md += "\n\n";

	md += "---\n\n";

	// Process thread messages
	for (const msg of thread.messages) {
		md += formatDomainMessage(
			msg,
			sessionPrefix,
			includeThinking,
			includeToolDetails,
			includeSystemMessages,
			maxOutputLength,
			noTruncate,
		);
	}

	return md;
}
