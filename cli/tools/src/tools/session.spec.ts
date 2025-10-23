/**
 * Session Tools Tests
 */

import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sessionToEnrichedMarkdown } from "./session";

describe("sessionToEnrichedMarkdown", () => {
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

	it("should write main session file and subagent thread files to disk", async () => {
		// Create a test session with a subagent invocation
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

		// Call sessionToEnrichedMarkdown
		const result = await sessionToEnrichedMarkdown(sessionFile, {
			outputDir,
			includeThinking: true,
			includeToolDetails: true,
		});

		// Verify return values
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
		// Create minimal test session
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

		// Call without outputDir
		const result = await sessionToEnrichedMarkdown(sessionFile);

		// Verify no files written
		expect(result.filesWritten).toHaveLength(0);
		expect(result.mainMarkdown).toBeTruthy();
	});
});
