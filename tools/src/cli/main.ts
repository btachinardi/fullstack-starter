#!/usr/bin/env node
/**
 * CLI Main Entry Point
 *
 * Single entry point that routes to strongly-typed tool functions based on
 * the first CLI argument. Handles argument parsing, transformation, and
 * output formatting.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile } from 'node:fs/promises';
import * as sessionTools from '../tools/session.js';
import * as logTools from '../tools/logs.js';
import type { LogEntry } from '../services/logger.js';
import { getDefaultLogDir } from '../services/logger.js';

const program = new Command();

program
  .name('tools')
  .description('CLI tools for fullstack-starter project')
  .version('0.1.0');

// ============================================================================
// Session Tool
// ============================================================================

const session = program
  .command('session')
  .description('Parse and query Claude Code session .jsonl files');

// ----------------------------------------------------------------------------
// session info
// ----------------------------------------------------------------------------

session
  .command('info <file>')
  .description('Show session information and statistics')
  .action(async (file: string) => {
    const spinner = ora('Parsing session...').start();

    try {
      const result = await sessionTools.sessionInfo(file);
      spinner.succeed('Session parsed successfully');

      console.log(chalk.bold('\n📊 Session Information\n'));
      console.log(`${chalk.cyan('Session ID:')}    ${result.sessionId}`);
      console.log(`${chalk.cyan('Version:')}       ${result.version}`);
      console.log(`${chalk.cyan('Working Dir:')}   ${result.cwd}`);
      if (result.gitBranch) {
        console.log(`${chalk.cyan('Git Branch:')}    ${result.gitBranch}`);
      }
      console.log(`${chalk.cyan('Start Time:')}    ${new Date(result.startTime).toLocaleString()}`);
      console.log(`${chalk.cyan('End Time:')}      ${new Date(result.endTime).toLocaleString()}`);

      console.log(chalk.bold('\n📈 Statistics\n'));
      console.log(`${chalk.cyan('Total Entries:')}      ${result.stats.totalEntries}`);
      console.log(`${chalk.cyan('User Messages:')}      ${result.stats.userMessages}`);
      console.log(`${chalk.cyan('Assistant Messages:')} ${result.stats.assistantMessages}`);
      console.log(`${chalk.cyan('System Messages:')}    ${result.stats.systemMessages}`);
      console.log(`${chalk.cyan('Tool Uses:')}          ${result.stats.toolUses}`);
      console.log(`${chalk.cyan('Tool Results:')}       ${result.stats.toolResults}`);
      console.log(`${chalk.cyan('Errors:')}             ${result.stats.errors}`);

      console.log(chalk.bold('\n💰 Token Usage\n'));
      console.log(
        `${chalk.cyan('Input Tokens:')}        ${result.tokens.input.toLocaleString()}`,
      );
      console.log(
        `${chalk.cyan('Output Tokens:')}       ${result.tokens.output.toLocaleString()}`,
      );
      console.log(
        `${chalk.cyan('Cache Creation:')}      ${result.tokens.cacheCreation.toLocaleString()}`,
      );
      console.log(
        `${chalk.cyan('Cache Read:')}          ${result.tokens.cacheRead.toLocaleString()}`,
      );
      console.log(`${chalk.cyan('Total:')}               ${result.tokens.total.toLocaleString()}`);
    } catch (error) {
      spinner.fail('Failed to parse session');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// session tools
// ----------------------------------------------------------------------------

session
  .command('tools <file>')
  .description('List all tools used in the session')
  .option('-c, --count', 'Show usage count for each tool')
  .action(async (file: string, options: { count?: boolean }) => {
    const spinner = ora('Analyzing tools...').start();

    try {
      const result = await sessionTools.sessionTools(file, { includeCount: !!options.count });

      if ('toolUsage' in result) {
        spinner.succeed(`Found ${result.toolUsage.reduce((sum, t) => sum + t.count, 0)} tool use(s)`);
        console.log(chalk.bold('\n🔧 Tool Usage\n'));
        for (const { toolName, count } of result.toolUsage) {
          console.log(`${chalk.cyan(toolName.padEnd(20))} ${count} time(s)`);
        }
      } else {
        spinner.succeed(`Found ${result.tools.length} unique tool(s)`);
        console.log(chalk.bold('\n🔧 Tools Used\n'));
        for (const tool of result.tools) {
          console.log(`  ${chalk.cyan('•')} ${tool}`);
        }
      }
    } catch (error) {
      spinner.fail('Failed to analyze tools');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// session files
// ----------------------------------------------------------------------------

session
  .command('files <file>')
  .description('List all files accessed during the session')
  .option('-r, --read', 'Show only files read')
  .option('-w, --written', 'Show only files written')
  .option('-e, --edited', 'Show only files edited')
  .action(
    async (
      file: string,
      options: { read?: boolean; written?: boolean; edited?: boolean },
    ) => {
      const spinner = ora('Analyzing file access...').start();

      try {
        const result = await sessionTools.sessionFiles(file, {
          filterRead: options.read,
          filterWritten: options.written,
          filterEdited: options.edited,
        });

        spinner.succeed('File access analyzed');

        if ('files' in result) {
          // Single filter applied
          const filterName = options.read
            ? 'Read'
            : options.written
              ? 'Written'
              : 'Edited';
          console.log(chalk.bold(`\n📁 Files ${filterName} (${result.files.length})\n`));
          for (const f of result.files) {
            console.log(`  ${f}`);
          }
        } else {
          // All files
          console.log(chalk.bold('\n📁 Files Accessed\n'));

          if (result.read.length > 0) {
            console.log(chalk.cyan('Read:'));
            for (const f of result.read) {
              console.log(`  ${f}`);
            }
            console.log();
          }

          if (result.written.length > 0) {
            console.log(chalk.cyan('Written:'));
            for (const f of result.written) {
              console.log(`  ${f}`);
            }
            console.log();
          }

          if (result.edited.length > 0) {
            console.log(chalk.cyan('Edited:'));
            for (const f of result.edited) {
              console.log(`  ${f}`);
            }
          }
        }
      } catch (error) {
        spinner.fail('Failed to analyze files');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    },
  );

// ----------------------------------------------------------------------------
// session agents
// ----------------------------------------------------------------------------

session
  .command('agents <file>')
  .description('List all subagents invoked during the session')
  .action(async (file: string) => {
    const spinner = ora('Finding subagent invocations...').start();

    try {
      const invocations = await sessionTools.sessionAgents(file);

      spinner.succeed(`Found ${invocations.length} subagent invocation(s)`);

      if (invocations.length === 0) {
        console.log(chalk.yellow('\nNo subagents were invoked in this session.'));
        return;
      }

      console.log(chalk.bold('\n🤖 Subagent Invocations\n'));

      for (const inv of invocations) {
        console.log(chalk.cyan(`${inv.subagentType}`));
        console.log(`  ${chalk.gray('Description:')} ${inv.description}`);
        console.log(`  ${chalk.gray('Time:')} ${new Date(inv.timestamp).toLocaleString()}`);
        if (inv.prompt && inv.prompt.length <= 100) {
          console.log(`  ${chalk.gray('Prompt:')} ${inv.prompt}`);
        } else if (inv.prompt) {
          console.log(`  ${chalk.gray('Prompt:')} ${inv.prompt.substring(0, 100)}...`);
        }
        console.log();
      }
    } catch (error) {
      spinner.fail('Failed to find subagents');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// session conversation
// ----------------------------------------------------------------------------

session
  .command('conversation <file>')
  .description('Show the conversation flow (user and assistant messages)')
  .option('-l, --limit <number>', 'Limit number of messages', '20')
  .action(async (file: string, options: { limit?: string }) => {
    const spinner = ora('Extracting conversation...').start();

    try {
      const limit = options.limit ? Number.parseInt(options.limit, 10) : undefined;
      const conversation = await sessionTools.sessionConversation(file, { limit });

      spinner.succeed(`Found ${conversation.length} message(s)`);

      console.log(chalk.bold('\n💬 Conversation\n'));

      for (const msg of conversation) {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const roleColor = msg.role === 'user' ? chalk.blue : chalk.green;
        const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';

        console.log(roleColor(`[${time}] ${roleLabel}:`));
        console.log(`  ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`);
      }

      if (limit && conversation.length === limit) {
        console.log(chalk.gray(`... use --limit to see more messages\n`));
      }
    } catch (error) {
      spinner.fail('Failed to extract conversation');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// session bash
// ----------------------------------------------------------------------------

session
  .command('bash <file>')
  .description('List all bash commands executed in the session')
  .action(async (file: string) => {
    const spinner = ora('Finding bash commands...').start();

    try {
      const commands = await sessionTools.sessionBash(file);

      spinner.succeed(`Found ${commands.length} bash command(s)`);

      if (commands.length === 0) {
        console.log(chalk.yellow('\nNo bash commands were executed in this session.'));
        return;
      }

      console.log(chalk.bold('\n💻 Bash Commands\n'));

      for (const cmd of commands) {
        console.log(chalk.cyan(`$ ${cmd.command}`));
        if (cmd.description) {
          console.log(`  ${chalk.gray(cmd.description)}`);
        }
        console.log();
      }
    } catch (error) {
      spinner.fail('Failed to find bash commands');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// session export
// ----------------------------------------------------------------------------

session
  .command('export <file>')
  .description('Export session as JSON')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('--pretty', 'Pretty print JSON', false)
  .action(
    async (file: string, options: { output?: string; pretty?: boolean }) => {
      const spinner = ora('Exporting session...').start();

      try {
        const json = await sessionTools.sessionExport(file, { pretty: options.pretty });

        if (options.output) {
          await writeFile(options.output, json, 'utf-8');
          spinner.succeed(`Exported to ${options.output}`);
        } else {
          spinner.stop();
          console.log(json);
        }
      } catch (error) {
        spinner.fail('Failed to export session');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    },
  );

// ----------------------------------------------------------------------------
// session list
// ----------------------------------------------------------------------------

session
  .command('list')
  .description('List all available session files')
  .option('-p, --project <path>', 'Project path')
  .action(async (options: { project?: string }) => {
    const spinner = ora('Finding session files...').start();

    try {
      const sessionFiles = await sessionTools.sessionList(options.project);

      spinner.succeed(`Found ${sessionFiles.length} session(s)`);

      if (sessionFiles.length === 0) {
        console.log(chalk.yellow('\nNo session files found.'));
        return;
      }

      console.log(chalk.bold('\nAvailable Sessions:'));
      for (const file of sessionFiles) {
        console.log(`  ${chalk.cyan('•')} ${file}`);
      }
    } catch (error) {
      spinner.fail('Failed to list sessions');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ============================================================================
// Logs Tool
// ============================================================================

const logs = program
  .command('logs')
  .description('Query and analyze structured logs');

// ----------------------------------------------------------------------------
// logs tail
// ----------------------------------------------------------------------------

logs
  .command('tail')
  .description('Show the last N log entries')
  .option('-n, --lines <number>', 'Number of lines to show', '20')
  .action(async (options: { lines?: string }) => {
    const spinner = ora('Reading logs...').start();

    try {
      const lines = options.lines ? Number.parseInt(options.lines, 10) : 20;
      const entries = await logTools.tailLogs({ lines });

      spinner.succeed(`Showing last ${entries.length} log entries`);

      if (entries.length === 0) {
        console.log(chalk.yellow('\nNo log entries found.'));
        console.log(chalk.gray(`Log directory: ${getDefaultLogDir()}`));
        return;
      }

      console.log(chalk.bold('\n📋 Recent Logs\n'));
      formatLogEntries(entries);
    } catch (error) {
      spinner.fail('Failed to read logs');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// logs query
// ----------------------------------------------------------------------------

logs
  .command('query')
  .description('Query logs with filters')
  .option('-s, --source <source>', 'Filter by source')
  .option('-l, --level <level>', 'Filter by log level (debug, info, warn, error)')
  .option('-t, --tool <tool>', 'Filter by tool name')
  .option('--session <id>', 'Filter by session ID')
  .option('--search <term>', 'Search in message and data')
  .option('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .option('-n, --limit <number>', 'Limit number of results')
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
      const spinner = ora('Querying logs...').start();

      try {
        const entries = await logTools.queryLogs({
          source: options.source,
          level: options.level as any,
          toolName: options.tool,
          sessionId: options.session,
          search: options.search,
          startDate: options.start,
          endDate: options.end,
          limit: options.limit ? Number.parseInt(options.limit, 10) : undefined,
        });

        spinner.succeed(`Found ${entries.length} log entries`);

        if (entries.length === 0) {
          console.log(chalk.yellow('\nNo matching log entries found.'));
          return;
        }

        console.log(chalk.bold('\n🔍 Query Results\n'));
        formatLogEntries(entries);
      } catch (error) {
        spinner.fail('Failed to query logs');
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }
    },
  );

// ----------------------------------------------------------------------------
// logs stats
// ----------------------------------------------------------------------------

logs
  .command('stats')
  .description('Show log statistics')
  .action(async () => {
    const spinner = ora('Analyzing logs...').start();

    try {
      const stats = await logTools.logStats();

      spinner.succeed('Log statistics calculated');

      console.log(chalk.bold('\n📊 Log Statistics\n'));

      console.log(chalk.cyan('Total Entries:'), stats.totalEntries.toLocaleString());

      console.log(chalk.bold('\nBy Level:'));
      for (const [level, count] of Object.entries(stats.byLevel)) {
        if (count > 0) {
          const color = getLevelColor(level);
          console.log(`  ${color(level.padEnd(6))}: ${count.toLocaleString()}`);
        }
      }

      console.log(chalk.bold('\nBy Source:'));
      const topSources = Object.entries(stats.bySource)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
      for (const [source, count] of topSources) {
        console.log(`  ${chalk.cyan(source.padEnd(30))}: ${count.toLocaleString()}`);
      }

      if (Object.keys(stats.byTool).length > 0) {
        console.log(chalk.bold('\nBy Tool:'));
        const topTools = Object.entries(stats.byTool)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10);
        for (const [tool, count] of topTools) {
          console.log(`  ${chalk.cyan(tool.padEnd(30))}: ${count.toLocaleString()}`);
        }
      }

      if (stats.dateRange.start && stats.dateRange.end) {
        console.log(chalk.bold('\nDate Range:'));
        console.log(`  ${chalk.gray('From:')} ${new Date(stats.dateRange.start).toLocaleString()}`);
        console.log(`  ${chalk.gray('To:')}   ${new Date(stats.dateRange.end).toLocaleString()}`);
      }
    } catch (error) {
      spinner.fail('Failed to calculate statistics');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// logs sources
// ----------------------------------------------------------------------------

logs
  .command('sources')
  .description('List all unique log sources')
  .action(async () => {
    const spinner = ora('Finding sources...').start();

    try {
      const sources = await logTools.listSources();

      spinner.succeed(`Found ${sources.length} unique sources`);

      if (sources.length === 0) {
        console.log(chalk.yellow('\nNo sources found.'));
        return;
      }

      console.log(chalk.bold('\n📂 Log Sources\n'));
      for (const source of sources) {
        console.log(`  ${chalk.cyan('•')} ${source}`);
      }
    } catch (error) {
      spinner.fail('Failed to list sources');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// ----------------------------------------------------------------------------
// logs tools
// ----------------------------------------------------------------------------

logs
  .command('tools')
  .description('List all unique tools logged')
  .action(async () => {
    const spinner = ora('Finding tools...').start();

    try {
      const tools = await logTools.listTools();

      spinner.succeed(`Found ${tools.length} unique tools`);

      if (tools.length === 0) {
        console.log(chalk.yellow('\nNo tools found.'));
        return;
      }

      console.log(chalk.bold('\n🔧 Logged Tools\n'));
      for (const tool of tools) {
        console.log(`  ${chalk.cyan('•')} ${tool}`);
      }
    } catch (error) {
      spinner.fail('Failed to list tools');
      console.error(chalk.red((error as Error).message));
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
      `${chalk.gray(`[${time}]`)} ${levelColor(entry.level.toUpperCase().padEnd(6))} ${chalk.cyan(entry.source)}`,
    );
    console.log(`  ${entry.message}`);

    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log(`  ${chalk.gray('Context:')} ${JSON.stringify(entry.context)}`);
    }

    if (entry.data) {
      const dataStr = JSON.stringify(entry.data);
      if (dataStr.length > 100) {
        console.log(`  ${chalk.gray('Data:')} ${dataStr.substring(0, 100)}...`);
      } else {
        console.log(`  ${chalk.gray('Data:')} ${dataStr}`);
      }
    }

    console.log();
  }
}

function getLevelColor(level: string): (text: string) => string {
  switch (level) {
    case 'debug':
      return chalk.gray;
    case 'info':
      return chalk.blue;
    case 'warn':
      return chalk.yellow;
    case 'error':
      return chalk.red;
    default:
      return chalk.white;
  }
}

// ============================================================================
// Parse and Execute
// ============================================================================

program.parse();
