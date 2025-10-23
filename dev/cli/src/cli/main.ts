#!/usr/bin/env node
/**
 * CLI Main Entry Point
 *
 * Single entry point that routes to strongly-typed tool functions based on
 * the first CLI argument. Handles argument parsing, transformation, and
 * output formatting.
 */

import { writeFile } from "node:fs/promises";
import chalk from "chalk";
import { Command } from "commander";
import ora from "ora";
import type { LogEntry } from "../shared/services/logger.js";
import { getDefaultLogDir } from "../shared/services/logger.js";
import { getErrorMessage, isTaskStatus } from "../shared/utils/type-guards.js";
import * as logTools from "../tools/logs/index.js";
import * as sessionTools from "../tools/session/index.js";
import * as taskTools from "../tools/tasks/index.js";
import type { TaskStatus } from "../tools/tasks/tasks.types.js";

const program = new Command();

program
	.name("tools")
	.description("CLI tools for fullstack-starter project")
	.version("0.1.0");

// ============================================================================
// Session Tool
// ============================================================================

const session = program
	.command("session")
	.description("Parse and query Claude Code session .jsonl files");

// ----------------------------------------------------------------------------
// session info
// ----------------------------------------------------------------------------

session
	.command("info <file>")
	.description("Show session information and statistics")
	.action(async (file: string) => {
		const spinner = ora("Parsing session...").start();

		try {
			const result = await sessionTools.sessionInfo(file);
			spinner.succeed("Session parsed successfully");

			console.log(chalk.bold("\n📊 Session Information\n"));
			console.log(`${chalk.cyan("Session ID:")}    ${result.sessionId}`);
			console.log(`${chalk.cyan("Version:")}       ${result.version}`);
			console.log(`${chalk.cyan("Working Dir:")}   ${result.cwd}`);
			if (result.gitBranch) {
				console.log(`${chalk.cyan("Git Branch:")}    ${result.gitBranch}`);
			}
			console.log(
				`${chalk.cyan("Start Time:")}    ${new Date(result.startTime).toLocaleString()}`,
			);
			console.log(
				`${chalk.cyan("End Time:")}      ${new Date(result.endTime).toLocaleString()}`,
			);

			console.log(chalk.bold("\n📈 Statistics\n"));
			console.log(
				`${chalk.cyan("Total Entries:")}      ${result.stats.totalEntries}`,
			);
			console.log(
				`${chalk.cyan("User Messages:")}      ${result.stats.userMessages}`,
			);
			console.log(
				`${chalk.cyan("Assistant Messages:")} ${result.stats.assistantMessages}`,
			);
			console.log(
				`${chalk.cyan("System Messages:")}    ${result.stats.systemMessages}`,
			);
			console.log(
				`${chalk.cyan("Tool Uses:")}          ${result.stats.toolUses}`,
			);
			console.log(
				`${chalk.cyan("Tool Results:")}       ${result.stats.toolResults}`,
			);
			console.log(
				`${chalk.cyan("Errors:")}             ${result.stats.errors}`,
			);

			console.log(chalk.bold("\n💰 Token Usage\n"));
			console.log(
				`${chalk.cyan("Input Tokens:")}        ${result.tokens.input.toLocaleString()}`,
			);
			console.log(
				`${chalk.cyan("Output Tokens:")}       ${result.tokens.output.toLocaleString()}`,
			);
			console.log(
				`${chalk.cyan("Cache Creation:")}      ${result.tokens.cacheCreation.toLocaleString()}`,
			);
			console.log(
				`${chalk.cyan("Cache Read:")}          ${result.tokens.cacheRead.toLocaleString()}`,
			);
			console.log(
				`${chalk.cyan("Total:")}               ${result.tokens.total.toLocaleString()}`,
			);
		} catch (error) {
			spinner.fail("Failed to parse session");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// session tools
// ----------------------------------------------------------------------------

session
	.command("tools <file>")
	.description("List all tools used in the session")
	.option("-c, --count", "Show usage count for each tool")
	.action(async (file: string, options: { count?: boolean }) => {
		const spinner = ora("Analyzing tools...").start();

		try {
			const result = await sessionTools.sessionTools(file, {
				includeCount: !!options.count,
			});

			if ("toolUsage" in result) {
				spinner.succeed(
					`Found ${result.toolUsage.reduce((sum, t) => sum + t.count, 0)} tool use(s)`,
				);
				console.log(chalk.bold("\n🔧 Tool Usage\n"));
				for (const { toolName, count } of result.toolUsage) {
					console.log(`${chalk.cyan(toolName.padEnd(20))} ${count} time(s)`);
				}
			} else {
				spinner.succeed(`Found ${result.tools.length} unique tool(s)`);
				console.log(chalk.bold("\n🔧 Tools Used\n"));
				for (const tool of result.tools) {
					console.log(`  ${chalk.cyan("•")} ${tool}`);
				}
			}
		} catch (error) {
			spinner.fail("Failed to analyze tools");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// session files
// ----------------------------------------------------------------------------

session
	.command("files <file>")
	.description("List all files accessed during the session")
	.option("-r, --read", "Show only files read")
	.option("-w, --written", "Show only files written")
	.option("-e, --edited", "Show only files edited")
	.action(
		async (
			file: string,
			options: { read?: boolean; written?: boolean; edited?: boolean },
		) => {
			const spinner = ora("Analyzing file access...").start();

			try {
				const result = await sessionTools.sessionFiles(file, {
					filterRead: options.read,
					filterWritten: options.written,
					filterEdited: options.edited,
				});

				spinner.succeed("File access analyzed");

				if ("files" in result) {
					// Single filter applied
					const filterName = options.read
						? "Read"
						: options.written
							? "Written"
							: "Edited";
					console.log(
						chalk.bold(`\n📁 Files ${filterName} (${result.files.length})\n`),
					);
					for (const f of result.files) {
						console.log(`  ${f}`);
					}
				} else {
					// All files
					console.log(chalk.bold("\n📁 Files Accessed\n"));

					if (result.read.length > 0) {
						console.log(chalk.cyan("Read:"));
						for (const f of result.read) {
							console.log(`  ${f}`);
						}
						console.log();
					}

					if (result.written.length > 0) {
						console.log(chalk.cyan("Written:"));
						for (const f of result.written) {
							console.log(`  ${f}`);
						}
						console.log();
					}

					if (result.edited.length > 0) {
						console.log(chalk.cyan("Edited:"));
						for (const f of result.edited) {
							console.log(`  ${f}`);
						}
					}
				}
			} catch (error) {
				spinner.fail("Failed to analyze files");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// session agents
// ----------------------------------------------------------------------------

session
	.command("agents <file>")
	.description("List all subagents invoked during the session")
	.action(async (file: string) => {
		const spinner = ora("Finding subagent invocations...").start();

		try {
			const invocations = await sessionTools.sessionAgents(file);

			spinner.succeed(`Found ${invocations.length} subagent invocation(s)`);

			if (invocations.length === 0) {
				console.log(
					chalk.yellow("\nNo subagents were invoked in this session."),
				);
				return;
			}

			console.log(chalk.bold("\n🤖 Subagent Invocations\n"));

			for (const inv of invocations) {
				console.log(chalk.cyan(`${inv.subagentType}`));
				console.log(`  ${chalk.gray("Description:")} ${inv.description}`);
				console.log(
					`  ${chalk.gray("Time:")} ${new Date(inv.timestamp).toLocaleString()}`,
				);
				if (inv.prompt && inv.prompt.length <= 100) {
					console.log(`  ${chalk.gray("Prompt:")} ${inv.prompt}`);
				} else if (inv.prompt) {
					console.log(
						`  ${chalk.gray("Prompt:")} ${inv.prompt.substring(0, 100)}...`,
					);
				}
				console.log();
			}
		} catch (error) {
			spinner.fail("Failed to find subagents");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// session conversation
// ----------------------------------------------------------------------------

session
	.command("conversation <file>")
	.description("Show the conversation flow (user and assistant messages)")
	.option("-l, --limit <number>", "Limit number of messages", "20")
	.action(async (file: string, options: { limit?: string }) => {
		const spinner = ora("Extracting conversation...").start();

		try {
			const limit = options.limit
				? Number.parseInt(options.limit, 10)
				: undefined;
			const conversation = await sessionTools.sessionConversation(file, {
				limit,
			});

			spinner.succeed(`Found ${conversation.length} message(s)`);

			console.log(chalk.bold("\n💬 Conversation\n"));

			for (const msg of conversation) {
				const time = new Date(msg.timestamp).toLocaleTimeString();
				const roleColor = msg.role === "user" ? chalk.blue : chalk.green;
				const roleLabel = msg.role === "user" ? "User" : "Assistant";

				console.log(roleColor(`[${time}] ${roleLabel}:`));
				console.log(
					`  ${msg.content.substring(0, 200)}${msg.content.length > 200 ? "..." : ""}\n`,
				);
			}

			if (limit && conversation.length === limit) {
				console.log(chalk.gray("... use --limit to see more messages\n"));
			}
		} catch (error) {
			spinner.fail("Failed to extract conversation");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// session bash
// ----------------------------------------------------------------------------

session
	.command("bash <file>")
	.description("List all bash commands executed in the session")
	.action(async (file: string) => {
		const spinner = ora("Finding bash commands...").start();

		try {
			const commands = await sessionTools.sessionBash(file);

			spinner.succeed(`Found ${commands.length} bash command(s)`);

			if (commands.length === 0) {
				console.log(
					chalk.yellow("\nNo bash commands were executed in this session."),
				);
				return;
			}

			console.log(chalk.bold("\n💻 Bash Commands\n"));

			for (const cmd of commands) {
				console.log(chalk.cyan(`$ ${cmd.command}`));
				if (cmd.description) {
					console.log(`  ${chalk.gray(cmd.description)}`);
				}
				console.log();
			}
		} catch (error) {
			spinner.fail("Failed to find bash commands");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// session export
// ----------------------------------------------------------------------------

session
	.command("export <file>")
	.description("Export session as JSON")
	.option("-o, --output <file>", "Output file (defaults to stdout)")
	.option("--pretty", "Pretty print JSON", false)
	.action(
		async (file: string, options: { output?: string; pretty?: boolean }) => {
			const spinner = ora("Exporting session...").start();

			try {
				const json = await sessionTools.sessionExport(file, {
					pretty: options.pretty,
				});

				if (options.output) {
					await writeFile(options.output, json, "utf-8");
					spinner.succeed(`Exported to ${options.output}`);
				} else {
					spinner.stop();
					console.log(json);
				}
			} catch (error) {
				spinner.fail("Failed to export session");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// session to-markdown
// ----------------------------------------------------------------------------

session
	.command("to-markdown <file>")
	.description("Export session to markdown format")
	.option("-o, --output <file>", "Output file (defaults to stdout)")
	.option("--no-thinking", "Exclude thinking blocks")
	.option("--no-tool-details", "Exclude tool input/output details")
	.option("--no-system-messages", "Exclude system messages")
	.option(
		"--max-output-length <chars>",
		"Maximum output length before truncation (default: no limit)",
		"10000",
	)
	.option("--truncate", "Enable output truncation")
	.action(
		async (
			file: string,
			options: {
				output?: string;
				thinking?: boolean;
				toolDetails?: boolean;
				systemMessages?: boolean;
				maxOutputLength?: string;
				truncate?: boolean;
			},
		) => {
			const spinner = ora("Converting session to markdown...").start();

			try {
				if (options.output) {
					// When writing to file, use enriched export with subagent files
					const { dirname } = await import("node:path");
					const outputDir = dirname(options.output);

					const result = await sessionTools.sessionToEnrichedMarkdown(file, {
						outputDir,
						includeThinking: options.thinking !== false,
						includeToolDetails: options.toolDetails !== false,
						includeSystemMessages: options.systemMessages !== false,
						maxOutputLength: options.maxOutputLength
							? Number.parseInt(options.maxOutputLength, 10)
							: 10000,
						noTruncate: !options.truncate,
					});

					const subagentCount = result.subagentFiles.length;
					spinner.succeed(
						`Exported to ${options.output}${subagentCount > 0 ? ` (+ ${subagentCount} subagent thread${subagentCount > 1 ? "s" : ""})` : ""}`,
					);
				} else {
					// When printing to stdout, use simple markdown export
					const markdown = await sessionTools.sessionToMarkdown(file, {
						includeThinking: options.thinking !== false,
						includeToolDetails: options.toolDetails !== false,
						includeSystemMessages: options.systemMessages !== false,
						maxOutputLength: options.maxOutputLength
							? Number.parseInt(options.maxOutputLength, 10)
							: 10000,
						noTruncate: !options.truncate,
					});

					spinner.stop();
					console.log(markdown);
				}
			} catch (error) {
				spinner.fail("Failed to convert session to markdown");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// session export-all-markdown
// ----------------------------------------------------------------------------

session
	.command("export-all-markdown")
	.description("Export all sessions to markdown files in a directory")
	.option("-p, --project <path>", "Project path")
	.option(
		"-o, --output <dir>",
		"Output directory (required)",
		"./session-exports",
	)
	.option("--no-thinking", "Exclude thinking blocks")
	.option("--no-tool-details", "Exclude tool input/output details")
	.option("--no-system-messages", "Exclude system messages")
	.option(
		"--max-output-length <chars>",
		"Maximum output length before truncation (default: no limit)",
		"10000",
	)
	.option("--truncate", "Enable output truncation")
	.action(
		async (options: {
			project?: string;
			output: string;
			thinking?: boolean;
			toolDetails?: boolean;
			systemMessages?: boolean;
			maxOutputLength?: string;
			truncate?: boolean;
		}) => {
			const spinner = ora("Finding sessions...").start();

			try {
				const sessions = await sessionTools.sessionList(options.project);

				if (sessions.length === 0) {
					spinner.fail("No sessions found");
					console.log(chalk.yellow("\nNo session files found."));
					return;
				}

				spinner.succeed(`Found ${sessions.length} session(s)`);
				console.log(chalk.bold(`\nExporting to: ${options.output}\n`));

				// Create output directory
				const { mkdir } = await import("node:fs/promises");

				try {
					await mkdir(options.output, { recursive: true });
				} catch (error) {
					console.error(chalk.red("Failed to create output directory"));
					console.error(chalk.red(getErrorMessage(error)));
					process.exit(1);
				}

				// Export each session
				let successCount = 0;
				let failureCount = 0;

				for (const session of sessions) {
					const exportSpinner = ora(
						`Exporting: ${session.fileName}...`,
					).start();

					try {
						const result = await sessionTools.sessionToEnrichedMarkdown(
							session.filePath,
							{
								outputDir: options.output,
								includeThinking: options.thinking !== false,
								includeToolDetails: options.toolDetails !== false,
								includeSystemMessages: options.systemMessages !== false,
								maxOutputLength: options.maxOutputLength
									? Number.parseInt(options.maxOutputLength, 10)
									: 10000,
								noTruncate: !options.truncate,
							},
						);

						// Files are already written by sessionToEnrichedMarkdown
						const subagentCount = result.subagentFiles.length;

						exportSpinner.succeed(
							`Exported: ${session.fileName}.md${subagentCount > 0 ? ` (+ ${subagentCount} subagent thread${subagentCount > 1 ? "s" : ""})` : ""}`,
						);
						successCount++;
					} catch (error) {
						exportSpinner.fail(`Failed: ${session.fileName}`);
						console.error(chalk.gray(`  ${getErrorMessage(error)}`));
						failureCount++;
					}
				}

				console.log(
					chalk.bold(
						`\n✓ Export complete: ${successCount} succeeded, ${failureCount} failed`,
					),
				);
			} catch (error) {
				spinner.fail("Failed to export sessions");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// session list
// ----------------------------------------------------------------------------

session
	.command("list")
	.description("List all available session files")
	.option("-p, --project <path>", "Project path")
	.option("--no-interactive", "Disable interactive mode")
	.action(async (options: { project?: string; interactive?: boolean }) => {
		const spinner = ora("Finding session files...").start();

		try {
			const sessions = await sessionTools.sessionList(options.project);

			spinner.succeed(`Found ${sessions.length} session(s)`);

			if (sessions.length === 0) {
				console.log(chalk.yellow("\nNo session files found."));
				return;
			}

			console.log(chalk.bold("\n📋 Available Sessions\n"));

			for (const session of sessions) {
				const date = new Date(session.timestamp);
				const dateStr = date.toLocaleDateString();
				const timeStr = date.toLocaleTimeString();

				console.log(
					`${chalk.cyan(session.index.toString().padStart(2))}. ${chalk.gray(
						`[${dateStr} ${timeStr}]`,
					)} ${session.title}`,
				);
				console.log(`    ${chalk.gray(`[${session.fileName}]`)}`);
			}

			// Interactive mode - ask user to select a session
			if (options.interactive !== false) {
				console.log(
					chalk.bold(
						"\nEnter a session number to view details (or press Ctrl+C to exit):",
					),
				);

				const { createInterface } = await import("node:readline");
				const readline = createInterface({
					input: process.stdin,
					output: process.stdout,
				});

				readline.question("> ", async (answer: string) => {
					readline.close();

					const selection = Number.parseInt(answer.trim(), 10);

					if (
						Number.isNaN(selection) ||
						selection < 1 ||
						selection > sessions.length
					) {
						console.log(chalk.red("\nInvalid selection."));
						process.exit(1);
					}

					const selectedSession = sessions.find((s) => s.index === selection);

					if (!selectedSession) {
						console.log(chalk.red("\nSession not found."));
						process.exit(1);
					}

					// Display session details
					const detailSpinner = ora("Loading session details...").start();

					try {
						const result = await sessionTools.sessionInfo(
							selectedSession.filePath,
						);
						detailSpinner.succeed("Session details loaded");

						console.log(chalk.bold("\n📊 Session Information\n"));
						console.log(`${chalk.cyan("Session ID:")}    ${result.sessionId}`);
						console.log(`${chalk.cyan("Version:")}       ${result.version}`);
						console.log(`${chalk.cyan("Working Dir:")}   ${result.cwd}`);
						if (result.gitBranch) {
							console.log(
								`${chalk.cyan("Git Branch:")}    ${result.gitBranch}`,
							);
						}
						console.log(
							`${chalk.cyan("Start Time:")}    ${new Date(result.startTime).toLocaleString()}`,
						);
						console.log(
							`${chalk.cyan("End Time:")}      ${new Date(result.endTime).toLocaleString()}`,
						);

						console.log(chalk.bold("\n📈 Statistics\n"));
						console.log(
							`${chalk.cyan("Total Entries:")}      ${result.stats.totalEntries}`,
						);
						console.log(
							`${chalk.cyan("User Messages:")}      ${result.stats.userMessages}`,
						);
						console.log(
							`${chalk.cyan("Assistant Messages:")} ${result.stats.assistantMessages}`,
						);
						console.log(
							`${chalk.cyan("System Messages:")}    ${result.stats.systemMessages}`,
						);
						console.log(
							`${chalk.cyan("Tool Uses:")}          ${result.stats.toolUses}`,
						);
						console.log(
							`${chalk.cyan("Tool Results:")}       ${result.stats.toolResults}`,
						);
						console.log(
							`${chalk.cyan("Errors:")}             ${result.stats.errors}`,
						);

						console.log(chalk.bold("\n💰 Token Usage\n"));
						console.log(
							`${chalk.cyan("Input Tokens:")}        ${result.tokens.input.toLocaleString()}`,
						);
						console.log(
							`${chalk.cyan("Output Tokens:")}       ${result.tokens.output.toLocaleString()}`,
						);
						console.log(
							`${chalk.cyan(
								"Cache Creation:",
							)}      ${result.tokens.cacheCreation.toLocaleString()}`,
						);
						console.log(
							`${chalk.cyan("Cache Read:")}          ${result.tokens.cacheRead.toLocaleString()}`,
						);
						console.log(
							`${chalk.cyan("Total:")}               ${result.tokens.total.toLocaleString()}`,
						);
					} catch (error) {
						detailSpinner.fail("Failed to load session details");
						console.error(chalk.red(getErrorMessage(error)));
						process.exit(1);
					}
				});
			}
		} catch (error) {
			spinner.fail("Failed to list sessions");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ============================================================================
// Logs Tool
// ============================================================================

const logs = program
	.command("logs")
	.description("Query and analyze structured logs");

// ----------------------------------------------------------------------------
// logs tail
// ----------------------------------------------------------------------------

logs
	.command("tail")
	.description("Show the last N log entries")
	.option("-n, --lines <number>", "Number of lines to show", "20")
	.action(async (options: { lines?: string }) => {
		const spinner = ora("Reading logs...").start();

		try {
			const lines = options.lines ? Number.parseInt(options.lines, 10) : 20;
			const entries = await logTools.tailLogs({ lines });

			spinner.succeed(`Showing last ${entries.length} log entries`);

			if (entries.length === 0) {
				console.log(chalk.yellow("\nNo log entries found."));
				console.log(chalk.gray(`Log directory: ${getDefaultLogDir()}`));
				return;
			}

			console.log(chalk.bold("\n📋 Recent Logs\n"));
			formatLogEntries(entries);
		} catch (error) {
			spinner.fail("Failed to read logs");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// logs query
// ----------------------------------------------------------------------------

logs
	.command("query")
	.description("Query logs with filters")
	.option("-s, --source <source>", "Filter by source")
	.option(
		"-l, --level <level>",
		"Filter by log level (debug, info, warn, error)",
	)
	.option("-t, --tool <tool>", "Filter by tool name")
	.option("--session <id>", "Filter by session ID")
	.option("--search <term>", "Search in message and data")
	.option("--start <date>", "Start date (YYYY-MM-DD)")
	.option("--end <date>", "End date (YYYY-MM-DD)")
	.option("-n, --limit <number>", "Limit number of results")
	.action(
		async (options: {
			source?: string;
			level?: string;
			tool?: string;
			session?: string;
			search?: string;
			start?: string;
			end?: string;
			limit?: string;
		}) => {
			const spinner = ora("Querying logs...").start();

			try {
				const entries = await logTools.queryLogs({
					source: options.source,
					level: options.level as
						| "debug"
						| "info"
						| "warn"
						| "error"
						| undefined,
					toolName: options.tool,
					sessionId: options.session,
					search: options.search,
					startDate: options.start,
					endDate: options.end,
					limit: options.limit ? Number.parseInt(options.limit, 10) : undefined,
				});

				spinner.succeed(`Found ${entries.length} log entries`);

				if (entries.length === 0) {
					console.log(chalk.yellow("\nNo matching log entries found."));
					return;
				}

				console.log(chalk.bold("\n🔍 Query Results\n"));
				formatLogEntries(entries);
			} catch (error) {
				spinner.fail("Failed to query logs");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// logs stats
// ----------------------------------------------------------------------------

logs
	.command("stats")
	.description("Show log statistics")
	.action(async () => {
		const spinner = ora("Analyzing logs...").start();

		try {
			const stats = await logTools.logStats();

			spinner.succeed("Log statistics calculated");

			console.log(chalk.bold("\n📊 Log Statistics\n"));

			console.log(
				chalk.cyan("Total Entries:"),
				stats.totalEntries.toLocaleString(),
			);

			console.log(chalk.bold("\nBy Level:"));
			for (const [level, count] of Object.entries(stats.byLevel)) {
				if (count > 0) {
					const color = getLevelColor(level);
					console.log(`  ${color(level.padEnd(6))}: ${count.toLocaleString()}`);
				}
			}

			console.log(chalk.bold("\nBy Source:"));
			const topSources = Object.entries(stats.bySource)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 10);
			for (const [source, count] of topSources) {
				console.log(
					`  ${chalk.cyan(source.padEnd(30))}: ${count.toLocaleString()}`,
				);
			}

			if (Object.keys(stats.byTool).length > 0) {
				console.log(chalk.bold("\nBy Tool:"));
				const topTools = Object.entries(stats.byTool)
					.sort(([, a], [, b]) => b - a)
					.slice(0, 10);
				for (const [tool, count] of topTools) {
					console.log(
						`  ${chalk.cyan(tool.padEnd(30))}: ${count.toLocaleString()}`,
					);
				}
			}

			if (stats.dateRange.start && stats.dateRange.end) {
				console.log(chalk.bold("\nDate Range:"));
				console.log(
					`  ${chalk.gray("From:")} ${new Date(stats.dateRange.start).toLocaleString()}`,
				);
				console.log(
					`  ${chalk.gray("To:")}   ${new Date(stats.dateRange.end).toLocaleString()}`,
				);
			}
		} catch (error) {
			spinner.fail("Failed to calculate statistics");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// logs sources
// ----------------------------------------------------------------------------

logs
	.command("sources")
	.description("List all unique log sources")
	.action(async () => {
		const spinner = ora("Finding sources...").start();

		try {
			const sources = await logTools.listSources();

			spinner.succeed(`Found ${sources.length} unique sources`);

			if (sources.length === 0) {
				console.log(chalk.yellow("\nNo sources found."));
				return;
			}

			console.log(chalk.bold("\n📂 Log Sources\n"));
			for (const source of sources) {
				console.log(`  ${chalk.cyan("•")} ${source}`);
			}
		} catch (error) {
			spinner.fail("Failed to list sources");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// logs tools
// ----------------------------------------------------------------------------

logs
	.command("tools")
	.description("List all unique tools logged")
	.action(async () => {
		const spinner = ora("Finding tools...").start();

		try {
			const tools = await logTools.listTools();

			spinner.succeed(`Found ${tools.length} unique tools`);

			if (tools.length === 0) {
				console.log(chalk.yellow("\nNo tools found."));
				return;
			}

			console.log(chalk.bold("\n🔧 Logged Tools\n"));
			for (const tool of tools) {
				console.log(`  ${chalk.cyan("•")} ${tool}`);
			}
		} catch (error) {
			spinner.fail("Failed to list tools");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ============================================================================
// Helper Functions
// ============================================================================

function formatLogEntries(entries: LogEntry[]): void {
	for (const entry of entries) {
		const time = new Date(entry.timestamp).toLocaleTimeString();
		const levelColor = getLevelColor(entry.level);

		console.log(
			`${chalk.gray(`[${time}]`)} ${levelColor(
				entry.level.toUpperCase().padEnd(6),
			)} ${chalk.cyan(entry.source)}`,
		);
		console.log(`  ${entry.message}`);

		if (entry.context && Object.keys(entry.context).length > 0) {
			console.log(
				`  ${chalk.gray("Context:")} ${JSON.stringify(entry.context)}`,
			);
		}

		if (entry.data) {
			const dataStr = JSON.stringify(entry.data);
			if (dataStr.length > 100) {
				console.log(`  ${chalk.gray("Data:")} ${dataStr.substring(0, 100)}...`);
			} else {
				console.log(`  ${chalk.gray("Data:")} ${dataStr}`);
			}
		}

		console.log();
	}
}

function getLevelColor(level: string): (text: string) => string {
	switch (level) {
		case "debug":
			return chalk.gray;
		case "info":
			return chalk.blue;
		case "warn":
			return chalk.yellow;
		case "error":
			return chalk.red;
		default:
			return chalk.white;
	}
}

// ============================================================================
// Tasks Tool
// ============================================================================

const tasks = program
	.command("tasks")
	.description("Manage task documents (*.tasks.md files)");

// ----------------------------------------------------------------------------
// tasks list-docs
// ----------------------------------------------------------------------------

tasks
	.command("list-docs")
	.description("List all task documents in the project")
	.option("-p, --path <path>", "Search path (defaults to current directory)")
	.action(async (options: { path?: string }) => {
		const spinner = ora("Discovering task documents...").start();

		try {
			const documents = await taskTools.discoverDocuments({
				searchPath: options.path,
			});

			spinner.succeed(`Found ${documents.length} task document(s)`);

			if (documents.length === 0) {
				console.log(chalk.yellow("\nNo task documents found."));
				console.log(
					chalk.gray("Task documents should have the .tasks.md extension"),
				);
				return;
			}

			console.log(chalk.bold("\n📋 Task Documents\n"));
			for (const doc of documents) {
				console.log(`  ${chalk.cyan("•")} ${doc.name}`);
				console.log(`    ${chalk.gray(doc.path)}`);
			}
		} catch (error) {
			spinner.fail("Failed to discover task documents");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// tasks list
// ----------------------------------------------------------------------------

tasks
	.command("list")
	.description("List all tasks in a document with optional filtering")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.option(
		"-s, --status <status>",
		"Filter by status (todo, in progress, completed, cancelled)",
	)
	.option("-l, --list <name>", "Filter by task list name")
	.option("-t, --type <type>", "Filter by task type")
	.option("-p, --project <name>", "Filter by project")
	.option("--head <n>", "Show only first N tasks")
	.option("--tail <n>", "Show only last N tasks")
	.action(
		async (options: {
			doc?: string;
			status?: string;
			list?: string;
			type?: string;
			project?: string;
			head?: string;
			tail?: string;
		}) => {
			const spinner = ora("Loading tasks...").start();

			try {
				// Discover document
				const documents = await taskTools.discoverDocuments({
					doc: options.doc,
				});

				if (documents.length === 0) {
					spinner.fail("No task documents found");
					console.log(chalk.yellow("\nNo matching task documents found."));
					return;
				}

				const selectedDoc =
					documents.length === 1
						? documents[0]
						: await taskTools.selectDocument(documents);

				if (!selectedDoc) {
					spinner.fail("No document selected");
					return;
				}

				// List tasks
				const statusFilter =
					options.status && isTaskStatus(options.status)
						? options.status
						: undefined;

				const result = await taskTools.listTasks(selectedDoc.path, {
					status: statusFilter,
					list: options.list,
					type: options.type,
					project: options.project,
					head: options.head ? Number.parseInt(options.head, 10) : undefined,
					tail: options.tail ? Number.parseInt(options.tail, 10) : undefined,
				});

				spinner.succeed(
					`Found ${result.tasks.length} task(s) in ${result.document.frontmatter.title}`,
				);

				if (result.tasks.length === 0) {
					console.log(chalk.yellow("\nNo tasks match the filters."));
					return;
				}

				console.log(
					chalk.bold(`\n📋 Tasks in ${result.document.frontmatter.title}\n`),
				);

				// Group by task list
				const tasksByList = new Map<string, typeof result.tasks>();
				for (const task of result.tasks) {
					if (!tasksByList.has(task.listName)) {
						tasksByList.set(task.listName, []);
					}
					tasksByList.get(task.listName)?.push(task);
				}

				// Display grouped tasks
				for (const [listName, listTasks] of tasksByList) {
					console.log(
						chalk.cyan(`tasks:${listName}`) +
							chalk.gray(` (${listTasks.length} tasks)`),
					);
					for (const task of listTasks) {
						const statusColor = getStatusColor(task.status);
						const statusLabel = getStatusLabel(task.status);
						console.log(
							`  ${statusColor(statusLabel)} ${task.id} - ${task.title}`,
						);
					}
					console.log();
				}

				// Show summary
				const statusCounts = result.tasks.reduce<Record<string, number>>(
					(acc, t) => {
						acc[t.status] = (acc[t.status] || 0) + 1;
						return acc;
					},
					{},
				);

				console.log(
					chalk.gray(
						`Total: ${result.tasks.length} tasks (${Object.entries(statusCounts)
							.map(([s, c]) => `${c} ${s}`)
							.join(", ")})`,
					),
				);
			} catch (error) {
				spinner.fail("Failed to list tasks");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// tasks get
// ----------------------------------------------------------------------------

tasks
	.command("get <taskId>")
	.description("Get details of a specific task")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.action(async (taskId: string, options: { doc?: string }) => {
		const spinner = ora("Finding task...").start();

		try {
			// Discover document
			const documents = await taskTools.discoverDocuments({ doc: options.doc });

			if (documents.length === 0) {
				spinner.fail("No task documents found");
				console.log(chalk.yellow("\nNo matching task documents found."));
				return;
			}

			const selectedDoc =
				documents.length === 1
					? documents[0]
					: await taskTools.selectDocument(documents);

			if (!selectedDoc) {
				spinner.fail("No document selected");
				return;
			}

			// Get task
			const result = await taskTools.getTask(selectedDoc.path, taskId);

			if (!result) {
				spinner.fail(`Task ${taskId} not found`);
				console.log(chalk.yellow(`\nTask ${taskId} not found in document.`));
				return;
			}

			spinner.succeed(`Found task ${taskId}`);

			const { task, listName } = result;

			console.log(chalk.bold(`\n📋 Task: ${task.id} - ${task.title}\n`));

			console.log(`${chalk.cyan("Title:")}       ${task.title}`);
			console.log(`${chalk.cyan("Type:")}        ${task.type}`);
			console.log(`${chalk.cyan("Project:")}     ${task.project}`);
			console.log(`${chalk.cyan("List:")}        tasks:${listName}`);
			console.log(
				`${chalk.cyan("Status:")}      ${getStatusColor(task.status)(task.status)}`,
			);

			if (task.depends_on && task.depends_on.length > 0) {
				console.log(
					`${chalk.cyan("Depends on:")}  ${task.depends_on.join(", ")}`,
				);
			}

			if (task.description) {
				console.log(chalk.bold("\nDescription:"));
				console.log(`  ${task.description}`);
			}

			if (task.deliverables && task.deliverables.length > 0) {
				console.log(chalk.bold("\nDeliverables:"));
				for (const d of task.deliverables) {
					console.log(`  ${chalk.gray("•")} ${d}`);
				}
			}

			if (task.requirements && task.requirements.length > 0) {
				console.log(chalk.bold("\nRequirements:"));
				for (const r of task.requirements) {
					console.log(`  ${chalk.gray("•")} ${r}`);
				}
			}
		} catch (error) {
			spinner.fail("Failed to get task");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// tasks next
// ----------------------------------------------------------------------------

tasks
	.command("next")
	.description("Start the next TODO task (mark as in progress)")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.option("-v, --verbose", "Show detailed progress messages")
	.action(async (options: { doc?: string; verbose?: boolean }) => {
		const spinner = options.verbose
			? ora("Finding next TODO task...").start()
			: null;

		try {
			// Discover document
			const documents = await taskTools.discoverDocuments({ doc: options.doc });

			if (documents.length === 0) {
				if (spinner) {
					spinner.fail("No task documents found");
				}
				console.log(chalk.yellow("No matching task documents found."));
				return;
			}

			const selectedDoc =
				documents.length === 1
					? documents[0]
					: await taskTools.selectDocument(documents);

			if (!selectedDoc) {
				if (spinner) {
					spinner.fail("No document selected");
				}
				console.error(chalk.red("No document selected"));
				return;
			}

			// Start next task
			const result = await taskTools.startNextTask(selectedDoc.path);

			if (!result.success) {
				if (spinner) {
					spinner.fail(result.message);
				}
				console.log(
					chalk.yellow(
						"No TODO tasks found. All tasks are either in progress, completed, or cancelled.",
					),
				);
				return;
			}

			if (spinner) {
				spinner.succeed(result.message);
			}

			const { task, listName } = result;

			// Display task details (similar to tasks get)
			console.log(chalk.bold(`\n📋 Task: ${task.id} - ${task.title}\n`));

			console.log(`${chalk.cyan("Title:")}       ${task.title}`);
			console.log(`${chalk.cyan("Type:")}        ${task.type}`);
			console.log(`${chalk.cyan("Project:")}     ${task.project}`);
			console.log(`${chalk.cyan("List:")}        tasks:${listName}`);
			console.log(
				`${chalk.cyan("Status:")}      ${getStatusColor(task.status)(task.status)}`,
			);

			if (task.depends_on && task.depends_on.length > 0) {
				console.log(
					`${chalk.cyan("Depends on:")}  ${task.depends_on.join(", ")}`,
				);
			}

			if (task.description) {
				console.log(chalk.bold("\nDescription:"));
				console.log(`  ${task.description}`);
			}

			if (task.deliverables && task.deliverables.length > 0) {
				console.log(chalk.bold("\nDeliverables:"));
				for (const d of task.deliverables) {
					console.log(`  ${chalk.gray("•")} ${d}`);
				}
			}

			if (task.requirements && task.requirements.length > 0) {
				console.log(chalk.bold("\nRequirements:"));
				for (const r of task.requirements) {
					console.log(`  ${chalk.gray("•")} ${r}`);
				}
			}

			// Show completion tip
			console.log(chalk.bold("\nTo complete this task run:"));
			console.log(
				chalk.cyan(
					`  ${chalk.bold(`\`pnpm tools tasks complete ${task.id} -d ${selectedDoc.name}\``)}`,
				),
			);
		} catch (error) {
			if (spinner) {
				spinner.fail("Failed to start next task");
			}
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// tasks start
// ----------------------------------------------------------------------------

tasks
	.command("start <taskId>")
	.description("Mark a task as in progress")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.option("-v, --verbose", "Show detailed progress messages")
	.action(
		async (taskId: string, options: { doc?: string; verbose?: boolean }) => {
			await updateTaskStatusCommand(
				taskId,
				"in progress",
				options.doc,
				options.verbose,
			);
		},
	);

// ----------------------------------------------------------------------------
// tasks complete
// ----------------------------------------------------------------------------

tasks
	.command("complete <taskId>")
	.description("Mark a task as completed")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.option("-v, --verbose", "Show detailed progress messages")
	.action(
		async (taskId: string, options: { doc?: string; verbose?: boolean }) => {
			await updateTaskStatusCommand(taskId, "completed", options.doc, options.verbose);
		},
	);

// ----------------------------------------------------------------------------
// tasks cancel
// ----------------------------------------------------------------------------

tasks
	.command("cancel <taskId>")
	.description("Mark a task as cancelled")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.option("-v, --verbose", "Show detailed progress messages")
	.action(
		async (taskId: string, options: { doc?: string; verbose?: boolean }) => {
			await updateTaskStatusCommand(taskId, "cancelled", options.doc, options.verbose);
		},
	);

// ----------------------------------------------------------------------------
// tasks reset
// ----------------------------------------------------------------------------

tasks
	.command("reset <taskId>")
	.description("Mark a task as todo")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.option("-v, --verbose", "Show detailed progress messages")
	.action(
		async (taskId: string, options: { doc?: string; verbose?: boolean }) => {
			await updateTaskStatusCommand(taskId, "todo", options.doc, options.verbose);
		},
	);

// ----------------------------------------------------------------------------
// tasks delete
// ----------------------------------------------------------------------------

tasks
	.command("delete <taskId>")
	.description("Delete a task from the document")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.action(async (taskId: string, options: { doc?: string }) => {
		const spinner = ora("Deleting task...").start();

		try {
			// Discover document
			const documents = await taskTools.discoverDocuments({ doc: options.doc });

			if (documents.length === 0) {
				spinner.fail("No task documents found");
				return;
			}

			const selectedDoc =
				documents.length === 1
					? documents[0]
					: await taskTools.selectDocument(documents);

			if (!selectedDoc) {
				spinner.fail("No document selected");
				return;
			}

			// Delete task
			const result = await taskTools.deleteTask(selectedDoc.path, taskId);

			if (result.success) {
				spinner.succeed(result.message);
			} else {
				spinner.fail(result.message);
			}
		} catch (error) {
			spinner.fail("Failed to delete task");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ----------------------------------------------------------------------------
// tasks add
// ----------------------------------------------------------------------------

tasks
	.command("add")
	.description("Add a new task to a task list")
	.requiredOption("-d, --doc <name>", "Document name, path, or partial path")
	.requiredOption("-l, --list <name>", 'Task list name (e.g., "api", "web")')
	.requiredOption("-t, --title <title>", "Task title")
	.requiredOption(
		"--type <type>",
		'Task type (e.g., "endpoint", "ui-component")',
	)
	.requiredOption("-p, --project <name>", 'Project path (e.g., "apps/api")')
	.option("--desc <description>", "Task description")
	.action(
		async (options: {
			doc: string;
			list: string;
			title: string;
			type: string;
			project: string;
			desc?: string;
		}) => {
			const spinner = ora("Adding task...").start();

			try {
				// Discover document
				const documents = await taskTools.discoverDocuments({
					doc: options.doc,
				});

				if (documents.length === 0) {
					spinner.fail("No task documents found");
					return;
				}

				const selectedDoc =
					documents.length === 1
						? documents[0]
						: await taskTools.selectDocument(documents);

				if (!selectedDoc) {
					spinner.fail("No document selected");
					return;
				}

				// Add task
				const result = await taskTools.addTask(selectedDoc.path, {
					list: options.list,
					title: options.title,
					type: options.type,
					project: options.project,
					description: options.desc,
				});

				if (result.success) {
					spinner.succeed(result.message);
				} else {
					spinner.fail(result.message);
				}
			} catch (error) {
				spinner.fail("Failed to add task");
				console.error(chalk.red(getErrorMessage(error)));
				process.exit(1);
			}
		},
	);

// ----------------------------------------------------------------------------
// tasks validate
// ----------------------------------------------------------------------------

tasks
	.command("validate")
	.description("Validate task document structure")
	.option("-d, --doc <name>", "Document name, path, or partial path")
	.action(async (options: { doc?: string }) => {
		const spinner = ora("Validating task document...").start();

		try {
			// Discover document
			const documents = await taskTools.discoverDocuments({ doc: options.doc });

			if (documents.length === 0) {
				spinner.fail("No task documents found");
				return;
			}

			const selectedDoc =
				documents.length === 1
					? documents[0]
					: await taskTools.selectDocument(documents);

			if (!selectedDoc) {
				spinner.fail("No document selected");
				return;
			}

			// Validate
			const result = await taskTools.validateDocument(selectedDoc.path);

			if (result.valid) {
				spinner.succeed("Task document is valid");
				console.log(chalk.bold("\n✓ Validation Passed\n"));
				console.log(`${chalk.cyan("Tasks:")}       ${result.taskCount}`);
				console.log(`${chalk.cyan("Task Lists:")} ${result.taskListCount}`);
			} else {
				spinner.fail("Task document has validation errors");
				console.log(chalk.bold("\n✗ Validation Failed\n"));

				console.log(chalk.red(`Found ${result.errors.length} error(s):\n`));
				for (const error of result.errors) {
					const severityColor =
						error.severity === "error" ? chalk.red : chalk.yellow;
					console.log(
						`  ${severityColor(`[${error.severity.toUpperCase()}]`)} ${error.message}`,
					);
					if (error.location) {
						console.log(`    ${chalk.gray(`Location: ${error.location}`)}`);
					}
					if (error.field) {
						console.log(`    ${chalk.gray(`Field: ${error.field}`)}`);
					}
				}

				process.exit(1);
			}
		} catch (error) {
			spinner.fail("Failed to validate task document");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ============================================================================
// Prisma Tool
// ============================================================================

const prisma = program
	.command("prisma")
	.description("Prisma schema composition and build tools");

// ----------------------------------------------------------------------------
// prisma build
// ----------------------------------------------------------------------------

prisma
	.command("build <schema>")
	.description("Build composed Prisma schema from imports")
	.option("--test", "Test mode (validate only, no write)")
	.option("--watch", "Watch for changes and rebuild")
	.option("--verbose", "Verbose logging")
	.option("--dry-run", "Show what would be generated")
	.action(
		async (
			schema: string,
			options: {
				test?: boolean;
				watch?: boolean;
				verbose?: boolean;
				dryRun?: boolean;
			},
		) => {
			const spinner = ora("Building Prisma schema...").start();

			try {
				const { buildSchema } = await import(
					"../tools/prisma/prisma.service.js"
				);

				await buildSchema({
					schemaPath: schema,
					test: options.test,
					watch: options.watch,
					verbose: options.verbose,
					dryRun: options.dryRun,
				});

				spinner.succeed("Schema built successfully");
			} catch (error) {
				spinner.fail("Failed to build schema");
				console.error(chalk.red(getErrorMessage(error)));

				// Show stack trace in verbose mode
				if (error instanceof Error && error.stack) {
					console.error(chalk.gray(error.stack));
				}

				process.exit(1);
			}
		},
	);

// ============================================================================
// Generate Tool
// ============================================================================

import * as generateTools from "../tools/generate/index.js";

const generate = program
	.command("generate")
	.description("Generate scaffolding for new tools");

// ----------------------------------------------------------------------------
// generate tool
// ----------------------------------------------------------------------------

generate
	.command("tool <name>")
	.description("Generate a new tool with vertical module structure")
	.option("-d, --description <desc>", "Tool description")
	.action(async (name: string, options: { description?: string }) => {
		const spinner = ora("Generating tool scaffolding...").start();

		try {
			const result = await generateTools.generateTool({
				toolName: name,
				description: options.description,
			});

			spinner.succeed(`Tool '${name}' generated successfully`);

			console.log(chalk.bold("\n📁 Generated Files:\n"));
			for (const file of result.files) {
				console.log(`  ${chalk.green("✓")} ${file.path}`);
				console.log(`    ${chalk.gray(file.description)}`);
			}

			console.log(chalk.bold("\n📝 Next Steps:\n"));
			console.log(result.instructions);
		} catch (error) {
			spinner.fail("Failed to generate tool");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});

// ============================================================================
// Tasks Helper Functions
// ============================================================================

async function updateTaskStatusCommand(
	taskId: string,
	newStatus: TaskStatus,
	docOption?: string,
	verbose = false,
): Promise<void> {
	const spinner = verbose ? ora(`Updating task ${taskId}...`).start() : null;

	try {
		// Discover document
		const documents = await taskTools.discoverDocuments({ doc: docOption });

		if (documents.length === 0) {
			if (spinner) {
				spinner.fail("No task documents found");
			} else {
				console.error(chalk.red("No task documents found"));
			}
			return;
		}

		const selectedDoc =
			documents.length === 1
				? documents[0]
				: await taskTools.selectDocument(documents);

		if (!selectedDoc) {
			if (spinner) {
				spinner.fail("No document selected");
			} else {
				console.error(chalk.red("No document selected"));
			}
			return;
		}

		// Update status
		const result = await taskTools.updateTaskStatus(
			selectedDoc.path,
			taskId,
			newStatus,
		);

		if (result.success) {
			if (spinner) {
				spinner.succeed(result.message);
			}

			// Show progress stats when completing a task
			if (newStatus === "completed") {
				const progress = await taskTools.getDocumentProgress(selectedDoc.path);

				console.log(
					chalk.bold(
						`\n📊 Progress: ${progress.completedTasks}/${progress.totalTasks} tasks completed (${progress.percentageComplete}%)\n`,
					),
				);

				if (progress.percentageComplete === 100) {
					console.log(
						chalk.green(
							`🎉 Congratulations! All tasks in ${progress.documentName} are complete!`,
						),
					);
				} else {
					console.log(
						chalk.cyan(
							`Run ${chalk.bold(`\`pnpm tools tasks next -d ${selectedDoc.name}\``)} to start working on the next task.`,
						),
					);
				}
			}
		} else {
			if (spinner) {
				spinner.fail(result.message);
			} else {
				console.error(chalk.red(result.message));
			}
		}
	} catch (error) {
		if (spinner) {
			spinner.fail("Failed to update task status");
		}
		console.error(chalk.red(getErrorMessage(error)));
		process.exit(1);
	}
}

function getStatusColor(status: string): (text: string) => string {
	switch (status) {
		case "todo":
			return chalk.gray;
		case "in progress":
			return chalk.yellow;
		case "completed":
			return chalk.green;
		case "cancelled":
			return chalk.red;
		default:
			return chalk.white;
	}
}

function getStatusLabel(status: string): string {
	switch (status) {
		case "todo":
			return "[TODO]      ";
		case "in progress":
			return "[IN PROGRESS]";
		case "completed":
			return "[COMPLETED] ";
		case "cancelled":
			return "[CANCELLED] ";
		default:
			return `[${status.toUpperCase()}]`;
	}
}

// ============================================================================
// Parse and Execute
// ============================================================================

program.parse();
