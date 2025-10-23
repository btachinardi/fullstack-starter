/**
 * Session Tools Tests
 */

import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	sessionAgents,
	sessionBash,
	sessionConversation,
	sessionExport,
	sessionFiles,
	sessionInfo,
	sessionToEnrichedMarkdown,
	sessionToMarkdown,
	sessionTools,
} from "./session.service.js";

describe("Session Service Tests", () => {
	let testDir: string;
	let sessionFile: string;

	beforeEach(async () => {
		// Create temporary directory for test files
		testDir = join(tmpdir(), `session-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		try {
			await rm(testDir, { recursive: true, force: true });
		} catch (_error) {
			// Ignore cleanup errors
		}
	});

	describe("sessionInfo", () => {
		it("should return comprehensive session metadata and statistics", async () => {
			// Arrange
			const sessionContent = [
				// User message
				JSON.stringify({
					type: "user",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/workspace/project",
					gitBranch: "feature/test",
					parentUuid: null,
					isSidechain: false,
					message: {
						role: "user",
						content: "Hello, analyze this code",
					},
				}),
				// Assistant message with tool use
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-2",
					timestamp: "2025-10-21T10:00:05.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/workspace/project",
					gitBranch: "feature/test",
					parentUuid: "uuid-1",
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "tool-1",
								name: "Read",
								input: { file_path: "/test/file.ts" },
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: {
							input_tokens: 1000,
							output_tokens: 500,
							cache_creation_input_tokens: 200,
							cache_read_input_tokens: 100,
						},
					},
				}),
				// Tool result
				JSON.stringify({
					type: "user",
					uuid: "uuid-3",
					timestamp: "2025-10-21T10:00:06.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/workspace/project",
					gitBranch: "feature/test",
					parentUuid: "uuid-2",
					isSidechain: false,
					message: {
						role: "user",
						content: [
							{
								type: "tool_result",
								tool_use_id: "tool-1",
								content: "file contents here",
							},
						],
					},
				}),
				// System error message
				JSON.stringify({
					type: "system",
					uuid: "uuid-4",
					timestamp: "2025-10-21T10:00:07.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/workspace/project",
					level: "error",
					title: "Network Error",
					content: "Failed to connect",
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionInfo(sessionFile);

			// Assert
			expect(result.sessionId).toBe("test-session-123");
			expect(result.version).toBe("2.0.22");
			expect(result.cwd).toBe("/workspace/project");
			expect(result.gitBranch).toBe("feature/test");
			expect(result.startTime).toBe("2025-10-21T10:00:00.000Z");
			expect(result.endTime).toBe("2025-10-21T10:00:07.000Z");

			// Verify stats
			expect(result.stats.totalEntries).toBe(4);
			expect(result.stats.userMessages).toBe(2);
			expect(result.stats.assistantMessages).toBe(1);
			expect(result.stats.systemMessages).toBe(1);
			expect(result.stats.toolUses).toBe(1);
			expect(result.stats.toolResults).toBe(0);
			expect(result.stats.errors).toBe(1);

			// Verify token usage
			expect(result.tokens.input).toBe(1000);
			expect(result.tokens.output).toBe(500);
			expect(result.tokens.cacheCreation).toBe(200);
			expect(result.tokens.cacheRead).toBe(100);
			expect(result.tokens.total).toBe(1500);
		});

		it("should handle session without git branch", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "user",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-session-456",
				version: "2.0.22",
				cwd: "/workspace",
				parentUuid: null,
				isSidechain: false,
				message: {
					role: "user",
					content: "Hello",
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionInfo(sessionFile);

			// Assert
			expect(result.gitBranch).toBeUndefined();
		});
	});

	describe("sessionTools", () => {
		it("should return unique tool names without counts", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "tool-1",
								name: "Read",
								input: { file_path: "/test/file1.ts" },
							},
							{
								type: "tool_use",
								id: "tool-2",
								name: "Bash",
								input: { command: "ls -la" },
							},
							{
								type: "tool_use",
								id: "tool-3",
								name: "Read",
								input: { file_path: "/test/file2.ts" },
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionTools(sessionFile, { includeCount: false });

			// Assert
			expect("tools" in result).toBe(true);
			if ("tools" in result) {
				expect(result.tools).toHaveLength(2);
				expect(result.tools).toEqual(["Bash", "Read"]);
			}
		});

		it("should return tool usage counts when requested", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "tool-1",
								name: "Read",
								input: { file_path: "/test/file1.ts" },
							},
							{
								type: "tool_use",
								id: "tool-2",
								name: "Bash",
								input: { command: "ls" },
							},
							{
								type: "tool_use",
								id: "tool-3",
								name: "Read",
								input: { file_path: "/test/file2.ts" },
							},
							{
								type: "tool_use",
								id: "tool-4",
								name: "Read",
								input: { file_path: "/test/file3.ts" },
							},
							{
								type: "tool_use",
								id: "tool-5",
								name: "Edit",
								input: {
									file_path: "/test/file1.ts",
									old_string: "old",
									new_string: "new",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionTools(sessionFile, { includeCount: true });

			// Assert
			expect("toolUsage" in result).toBe(true);
			if ("toolUsage" in result) {
				expect(result.toolUsage).toHaveLength(3);
				// Sorted by count descending
				expect(result.toolUsage[0]).toEqual({ toolName: "Read", count: 3 });
				expect(result.toolUsage[1]).toEqual({ toolName: "Bash", count: 1 });
				expect(result.toolUsage[2]).toEqual({ toolName: "Edit", count: 1 });
			}
		});
	});

	describe("sessionFiles", () => {
		it("should return all file categories by default", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "tool-1",
								name: "Read",
								input: { file_path: "/test/read1.ts" },
							},
							{
								type: "tool_use",
								id: "tool-2",
								name: "Read",
								input: { file_path: "/test/read2.ts" },
							},
							{
								type: "tool_use",
								id: "tool-3",
								name: "Write",
								input: { file_path: "/test/written.ts", content: "code" },
							},
							{
								type: "tool_use",
								id: "tool-4",
								name: "Edit",
								input: {
									file_path: "/test/edited.ts",
									old_string: "old",
									new_string: "new",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionFiles(sessionFile);

			// Assert
			expect("read" in result).toBe(true);
			expect("written" in result).toBe(true);
			expect("edited" in result).toBe(true);

			if ("read" in result && "written" in result && "edited" in result) {
				expect(result.read).toHaveLength(2);
				expect(result.read).toContain("/test/read1.ts");
				expect(result.read).toContain("/test/read2.ts");
				expect(result.written).toHaveLength(1);
				expect(result.written).toContain("/test/written.ts");
				expect(result.edited).toHaveLength(1);
				expect(result.edited).toContain("/test/edited.ts");
			}
		});

		it("should filter for read files only", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "assistant",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-session-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				requestId: "req-1",
				message: {
					model: "claude-sonnet-4-5-20250929",
					id: "msg-1",
					type: "message",
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: "tool-1",
							name: "Read",
							input: { file_path: "/test/file.ts" },
						},
					],
					stop_reason: null,
					stop_sequence: null,
					usage: { input_tokens: 100, output_tokens: 50 },
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionFiles(sessionFile, { filterRead: true });

			// Assert
			expect("files" in result).toBe(true);
			if ("files" in result) {
				expect(result.files).toHaveLength(1);
				expect(result.files).toContain("/test/file.ts");
			}
		});

		it("should filter for written files only", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "assistant",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-session-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				requestId: "req-1",
				message: {
					model: "claude-sonnet-4-5-20250929",
					id: "msg-1",
					type: "message",
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: "tool-1",
							name: "Write",
							input: { file_path: "/test/new-file.ts", content: "export {}" },
						},
					],
					stop_reason: null,
					stop_sequence: null,
					usage: { input_tokens: 100, output_tokens: 50 },
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionFiles(sessionFile, { filterWritten: true });

			// Assert
			expect("files" in result).toBe(true);
			if ("files" in result) {
				expect(result.files).toHaveLength(1);
				expect(result.files).toContain("/test/new-file.ts");
			}
		});

		it("should filter for edited files only", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "assistant",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-session-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				requestId: "req-1",
				message: {
					model: "claude-sonnet-4-5-20250929",
					id: "msg-1",
					type: "message",
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: "tool-1",
							name: "Edit",
							input: {
								file_path: "/test/modified.ts",
								old_string: "const x = 1",
								new_string: "const x = 2",
							},
						},
					],
					stop_reason: null,
					stop_sequence: null,
					usage: { input_tokens: 100, output_tokens: 50 },
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionFiles(sessionFile, { filterEdited: true });

			// Assert
			expect("files" in result).toBe(true);
			if ("files" in result) {
				expect(result.files).toHaveLength(1);
				expect(result.files).toContain("/test/modified.ts");
			}
		});
	});

	describe("sessionAgents", () => {
		it("should extract subagent invocations with all metadata", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-1",
					timestamp: "2025-10-21T15:30:45.123Z",
					sessionId: "session-abc-123",
					version: "2.0.22",
					cwd: "/workspace",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "inv-1",
								name: "Task",
								input: {
									subagent_type: "test-writer",
									description: "Write comprehensive tests",
									prompt: "Write unit tests for the session service...",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-2",
					timestamp: "2025-10-21T15:35:10.456Z",
					sessionId: "session-abc-123",
					version: "2.0.22",
					cwd: "/workspace",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-2",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-2",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "inv-2",
								name: "Task",
								input: {
									subagent_type: "code-writer",
									description: "Implement new feature",
									prompt: "Implement authentication middleware...",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 200, output_tokens: 100 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionAgents(sessionFile);

			// Assert
			expect(result).toHaveLength(2);

			// Verify first invocation
			expect(result[0]).toEqual({
				subagentType: "test-writer",
				description: "Write comprehensive tests",
				prompt: "Write unit tests for the session service...",
				timestamp: "2025-10-21T15:30:45.123Z",
				sessionId: "session-abc-123",
				invocationId: "inv-1",
				entryUuid: "uuid-1",
			});

			// Verify second invocation
			expect(result[1]).toEqual({
				subagentType: "code-writer",
				description: "Implement new feature",
				prompt: "Implement authentication middleware...",
				timestamp: "2025-10-21T15:35:10.456Z",
				sessionId: "session-abc-123",
				invocationId: "inv-2",
				entryUuid: "uuid-2",
			});
		});

		it("should return empty array when no subagents invoked", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "user",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-session-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				message: {
					role: "user",
					content: "Hello",
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionAgents(sessionFile);

			// Assert
			expect(result).toHaveLength(0);
		});
	});

	describe("sessionConversation", () => {
		it("should extract conversation flow with user and assistant messages", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "user",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					message: {
						role: "user",
						content: "Can you help me write tests?",
					},
				}),
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-2",
					timestamp: "2025-10-21T10:00:05.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: "uuid-1",
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: "Sure! I can help you write comprehensive tests.",
						stop_reason: "end_turn",
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
				JSON.stringify({
					type: "user",
					uuid: "uuid-3",
					timestamp: "2025-10-21T10:00:10.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: "uuid-2",
					isSidechain: false,
					message: {
						role: "user",
						content: "Great! Start with unit tests.",
					},
				}),
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-4",
					timestamp: "2025-10-21T10:00:15.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: "uuid-3",
					isSidechain: false,
					requestId: "req-2",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-2",
						type: "message",
						role: "assistant",
						content: [
							{ type: "text", text: "I'll create unit tests using Vitest." },
						],
						stop_reason: "end_turn",
						stop_sequence: null,
						usage: { input_tokens: 150, output_tokens: 75 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionConversation(sessionFile);

			// Assert
			expect(result).toHaveLength(4);

			expect(result[0]).toEqual({
				timestamp: "2025-10-21T10:00:00.000Z",
				role: "user",
				content: "Can you help me write tests?",
			});

			expect(result[1]).toEqual({
				timestamp: "2025-10-21T10:00:05.000Z",
				role: "assistant",
				content: "Sure! I can help you write comprehensive tests.",
			});

			expect(result[2]).toEqual({
				timestamp: "2025-10-21T10:00:10.000Z",
				role: "user",
				content: "Great! Start with unit tests.",
			});

			expect(result[3]).toEqual({
				timestamp: "2025-10-21T10:00:15.000Z",
				role: "assistant",
				content: "I'll create unit tests using Vitest.",
			});
		});

		it("should respect limit option", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "user",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					message: { role: "user", content: "Message 1" },
				}),
				JSON.stringify({
					type: "user",
					uuid: "uuid-2",
					timestamp: "2025-10-21T10:00:01.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					message: { role: "user", content: "Message 2" },
				}),
				JSON.stringify({
					type: "user",
					uuid: "uuid-3",
					timestamp: "2025-10-21T10:00:02.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					message: { role: "user", content: "Message 3" },
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionConversation(sessionFile, { limit: 2 });

			// Assert
			expect(result).toHaveLength(2);
			expect(result[0]?.content).toBe("Message 1");
			expect(result[1]?.content).toBe("Message 2");
		});
	});

	describe("sessionBash", () => {
		it("should extract bash commands with descriptions", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "tool-1",
								name: "Bash",
								input: {
									command: "pnpm test",
									description: "Run all test suites",
								},
							},
							{
								type: "tool_use",
								id: "tool-2",
								name: "Bash",
								input: {
									command: "pnpm build",
									description: "Build all packages",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-2",
					timestamp: "2025-10-21T10:00:05.000Z",
					sessionId: "test-session-123",
					version: "2.0.22",
					cwd: "/test",
					parentUuid: null,
					isSidechain: false,
					requestId: "req-2",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-2",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "tool-3",
								name: "Bash",
								input: {
									command: "git status",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: { input_tokens: 50, output_tokens: 25 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionBash(sessionFile);

			// Assert
			expect(result).toHaveLength(3);

			expect(result[0]).toEqual({
				command: "pnpm test",
				description: "Run all test suites",
			});

			expect(result[1]).toEqual({
				command: "pnpm build",
				description: "Build all packages",
			});

			expect(result[2]).toEqual({
				command: "git status",
				description: undefined,
			});
		});

		it("should return empty array when no bash commands executed", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "user",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-session-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				message: {
					role: "user",
					content: "Hello",
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionBash(sessionFile);

			// Assert
			expect(result).toHaveLength(0);
		});
	});

	describe("sessionExport", () => {
		it("should export session as compact JSON by default", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "user",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-export-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				message: {
					role: "user",
					content: "Export test",
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionExport(sessionFile);

			// Assert
			expect(result).toBeTruthy();
			expect(typeof result).toBe("string");

			// Verify it's valid JSON
			const parsed = JSON.parse(result);
			expect(parsed.sessionId).toBe("test-export-123");
			expect(parsed.version).toBe("2.0.22");
			expect(parsed.cwd).toBe("/test");

			// Verify compact format (no indentation)
			expect(result).not.toContain("\n  ");
		});

		it("should export session as pretty JSON when requested", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "user",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "test-export-456",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				message: {
					role: "user",
					content: "Pretty export test",
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionExport(sessionFile, { pretty: true });

			// Assert
			expect(result).toBeTruthy();
			expect(typeof result).toBe("string");

			// Verify it's valid JSON
			const parsed = JSON.parse(result);
			expect(parsed.sessionId).toBe("test-export-456");

			// Verify pretty format (has indentation)
			expect(result).toContain("\n  ");
			expect(result).toContain('"sessionId": "test-export-456"');
		});
	});

	describe("sessionToMarkdown", () => {
		it("should generate markdown with session header and messages", async () => {
			// Arrange
			const sessionContent = [
				JSON.stringify({
					type: "user",
					uuid: "uuid-1",
					timestamp: "2025-10-21T10:00:00.000Z",
					sessionId: "markdown-test-123",
					version: "2.0.22",
					cwd: "/workspace/project",
					gitBranch: "main",
					parentUuid: null,
					isSidechain: false,
					message: {
						role: "user",
						content: "Write a test",
					},
				}),
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-2",
					timestamp: "2025-10-21T10:00:05.000Z",
					sessionId: "markdown-test-123",
					version: "2.0.22",
					cwd: "/workspace/project",
					gitBranch: "main",
					parentUuid: "uuid-1",
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: "I'll help you write tests.",
						stop_reason: "end_turn",
						stop_sequence: null,
						usage: { input_tokens: 100, output_tokens: 50 },
					},
				}),
			].join("\n");

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionToMarkdown(sessionFile);

			// Assert
			expect(result).toContain("# Session: markdown-test-123");
			expect(result).toContain("**Working Directory:** `/workspace/project`");
			expect(result).toContain("**Git Branch:** `main`");
			expect(result).toContain("## 👤 User");
			expect(result).toContain("Write a test");
			expect(result).toContain("## 🤖 Assistant");
			expect(result).toContain("I'll help you write tests.");
		});

		it("should include tool details when enabled", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "assistant",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "tool-test-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				requestId: "req-1",
				message: {
					model: "claude-sonnet-4-5-20250929",
					id: "msg-1",
					type: "message",
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: "tool-1",
							name: "Bash",
							input: {
								command: "ls -la",
								description: "List files",
							},
						},
					],
					stop_reason: null,
					stop_sequence: null,
					usage: { input_tokens: 100, output_tokens: 50 },
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionToMarkdown(sessionFile, {
				includeToolDetails: true,
			});

			// Assert
			expect(result).toContain("## 🔧 Tool: Bash");
			expect(result).toContain("**Command:** `ls -la`");
			expect(result).toContain("**Description:** List files");
		});

		it("should exclude tool details when disabled", async () => {
			// Arrange
			const sessionContent = JSON.stringify({
				type: "assistant",
				uuid: "uuid-1",
				timestamp: "2025-10-21T10:00:00.000Z",
				sessionId: "no-tool-details-123",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				requestId: "req-1",
				message: {
					model: "claude-sonnet-4-5-20250929",
					id: "msg-1",
					type: "message",
					role: "assistant",
					content: [
						{
							type: "tool_use",
							id: "tool-1",
							name: "Bash",
							input: {
								command: "pwd",
								description: "Print working directory",
							},
						},
					],
					stop_reason: null,
					stop_sequence: null,
					usage: { input_tokens: 100, output_tokens: 50 },
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionToMarkdown(sessionFile, {
				includeToolDetails: false,
			});

			// Assert
			expect(result).toContain("## 🔧 Tool: Bash");
			expect(result).not.toContain("**Command:**");
			expect(result).not.toContain("pwd");
		});
	});

	describe("sessionToEnrichedMarkdown", () => {
		it("should write main session file and subagent thread files to disk", async () => {
			// Arrange - Create a test session with a subagent invocation
			const sessionContent = [
				// Session metadata
				JSON.stringify({
					type: "user",
					uuid: "uuid-1",
					timestamp: "2025-10-21T01:43:12.091Z",
					sessionId: "58186f35-17c7-47ce-acb4-c9388cd6d56b",
					version: "2.0.22",
					cwd: "/test",
					gitBranch: "main",
					parentUuid: null,
					isSidechain: false,
					message: {
						role: "user",
						content: "Hello",
					},
				}),
				// Subagent invocation
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-2",
					timestamp: "2025-10-21T01:43:19.288Z",
					sessionId: "58186f35-17c7-47ce-acb4-c9388cd6d56b",
					version: "2.0.22",
					cwd: "/test",
					gitBranch: "main",
					parentUuid: "uuid-1",
					isSidechain: false,
					requestId: "req-1",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-1",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "tool_use",
								id: "toolu_01MACUTR61M2dEsYYYCAKpAT",
								name: "Task",
								input: {
									subagent_type: "commit-grouper",
									description: "Analyze git changes",
									prompt: "Analyze all staged git changes...",
								},
							},
						],
						stop_reason: null,
						stop_sequence: null,
						usage: {
							input_tokens: 100,
							output_tokens: 50,
						},
					},
				}),
				// Subagent thread start (sidechain)
				JSON.stringify({
					type: "user",
					uuid: "uuid-sub-1",
					timestamp: "2025-10-21T01:43:19.433Z",
					sessionId: "58186f35-17c7-47ce-acb4-c9388cd6d56b",
					version: "2.0.22",
					cwd: "/test",
					gitBranch: "main",
					parentUuid: null,
					isSidechain: true,
					message: {
						role: "user",
						content: "Analyze all staged git changes...",
					},
				}),
				// Subagent response
				JSON.stringify({
					type: "assistant",
					uuid: "uuid-sub-2",
					timestamp: "2025-10-21T01:43:20.000Z",
					sessionId: "58186f35-17c7-47ce-acb4-c9388cd6d56b",
					version: "2.0.22",
					cwd: "/test",
					gitBranch: "main",
					parentUuid: "uuid-sub-1",
					isSidechain: true,
					requestId: "req-2",
					message: {
						model: "claude-sonnet-4-5-20250929",
						id: "msg-2",
						type: "message",
						role: "assistant",
						content: "Here are the commit groups...",
						stop_reason: "end_turn",
						stop_sequence: null,
						usage: {
							input_tokens: 50,
							output_tokens: 100,
						},
					},
				}),
			].join("\n");

			// Write test session file
			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Create output directory for markdown files
			const outputDir = join(testDir, "output");

			// Act
			const result = await sessionToEnrichedMarkdown(sessionFile, {
				outputDir,
				includeThinking: true,
				includeToolDetails: true,
			});

			// Assert - Verify return values
			expect(result.mainMarkdown).toBeTruthy();
			expect(result.mainMarkdown.length).toBeGreaterThan(0);
			expect(result.subagentFiles).toHaveLength(1);
			expect(result.subagentFiles[0]?.subagentType).toBe("commit-grouper");
			expect(result.filesWritten).toHaveLength(2); // Main + 1 subagent

			// Verify files were actually written
			expect(result.filesWritten.length).toBe(2);

			// Check main session file
			const mainFile = result.filesWritten[0];
			if (!mainFile) {
				throw new Error("Main file path is undefined");
			}
			expect(mainFile).toContain("58186f35-session.md");

			// Verify main file exists
			await expect(access(mainFile)).resolves.toBeUndefined();

			// Read and verify main file content
			const mainContent = await readFile(mainFile, "utf-8");
			expect(mainContent).toContain("# Session: 58186f35");
			expect(mainContent).toContain("Subagent Invocation: commit-grouper");

			// Check subagent thread file
			const subagentFile = result.filesWritten[1];
			if (!subagentFile) {
				throw new Error("Subagent file path is undefined");
			}
			expect(subagentFile).toContain("58186f35-subagent-commit-grouper");

			// Verify subagent file exists
			await expect(access(subagentFile)).resolves.toBeUndefined();

			// Read and verify subagent file content
			const subagentContent = await readFile(subagentFile, "utf-8");
			expect(subagentContent).toContain("# Subagent Thread: commit-grouper");
			expect(subagentContent).toContain("Analyze all staged git changes");
			expect(subagentContent).toContain("Here are the commit groups");
		});

		it("should not write files when outputDir is not specified", async () => {
			// Arrange - Create minimal test session
			const sessionContent = JSON.stringify({
				type: "user",
				uuid: "uuid-1",
				timestamp: "2025-10-21T01:43:12.091Z",
				sessionId: "58186f35-17c7-47ce-acb4-c9388cd6d56b",
				version: "2.0.22",
				cwd: "/test",
				parentUuid: null,
				isSidechain: false,
				message: {
					role: "user",
					content: "Hello",
				},
			});

			sessionFile = join(testDir, "test-session.jsonl");
			await writeFile(sessionFile, sessionContent, "utf-8");

			// Act
			const result = await sessionToEnrichedMarkdown(sessionFile);

			// Assert - Verify no files written
			expect(result.filesWritten).toHaveLength(0);
			expect(result.mainMarkdown).toBeTruthy();
		});
	});
});
