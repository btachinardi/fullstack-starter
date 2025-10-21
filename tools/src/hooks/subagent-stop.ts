#!/usr/bin/env node
/**
 * SubagentStop Hook
 *
 * Automatically commits changes made by Claude Code subagents when they complete.
 * Uses the Agent SDK to invoke the /git:commit slash command with subagent context.
 *
 * Hook Configuration (in claude_desktop_config.json):
 * {
 *   "hooks": {
 *     "SubagentStop": [
 *       {
 *         "type": "command",
 *         "command": "node tools/dist/hooks/subagent-stop.js"
 *       }
 *     ]
 *   }
 * }
 */

import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { createSubagentStopHook } from '../services/hook-input.js';
import type { SubagentStopInput } from '../services/hook-input.js';
import { createHookLogger } from '../services/logger.js';
import type { Logger } from '../services/logger.js';
import { sessionAgents } from '../tools/session.js';
import type { SubagentInvocation } from '../tools/session.js';

// ============================================================================
// Configuration
// ============================================================================

const REPO_ROOT = process.cwd();

// ============================================================================
// Agent Frontmatter Parsing
// ============================================================================

interface AgentFrontmatter {
  name?: string;
  description?: string;
  tools?: string;
  model?: string;
  autoCommit?: boolean;
}

/**
 * Parse agent frontmatter from markdown file
 * Extracts YAML frontmatter and returns parsed object
 */
async function parseAgentFrontmatter(
  agentType: string,
  logger: Logger,
): Promise<AgentFrontmatter | null> {
  // Try project-level agent first (.claude/agents/)
  const projectAgentPath = join(REPO_ROOT, '.claude', 'agents', `${agentType}.md`);

  // Also check for agents in subdirectories (e.g., .claude/agents/claude/subagent-creator.md)
  const projectAgentPathClaude = join(REPO_ROOT, '.claude', 'agents', 'claude', `${agentType}.md`);

  const possiblePaths = [projectAgentPath, projectAgentPathClaude];

  for (const agentPath of possiblePaths) {
    try {
      const content = await readFile(agentPath, 'utf-8');

      // Extract frontmatter (between --- markers)
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        await logger.debug(`No frontmatter found in ${agentPath}`);
        continue;
      }

      const frontmatterText = frontmatterMatch[1];
      const frontmatter: AgentFrontmatter = {};

      // Parse YAML-like frontmatter (simple key: value parsing)
      const lines = frontmatterText.split('\n');
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          if (key === 'autoCommit') {
            frontmatter.autoCommit = value.trim().toLowerCase() === 'true';
          } else if (
            key === 'name' ||
            key === 'description' ||
            key === 'tools' ||
            key === 'model'
          ) {
            frontmatter[key] = value.trim();
          }
        }
      }

      await logger.debug(`Parsed frontmatter for ${agentType}`, { frontmatter });
      return frontmatter;
    } catch (_error) {
      // File doesn't exist at this path, try next
      await logger.debug(`Agent file not found at ${agentPath}`);
    }
  }

  await logger.warn(`No agent file found for type: ${agentType}`);
  return null;
}

/**
 * Check if agent should auto-commit based on frontmatter
 * Default: true (commit unless explicitly disabled)
 */
async function shouldAutoCommit(agentType: string, logger: Logger): Promise<boolean> {
  const frontmatter = await parseAgentFrontmatter(agentType, logger);

  if (!frontmatter) {
    await logger.info(`Agent ${agentType} has no frontmatter, defaulting to autoCommit: true`);
    return true; // Default: always commit if no frontmatter
  }

  if (frontmatter.autoCommit === undefined) {
    await logger.info(`Agent ${agentType} has no autoCommit field, defaulting to true`);
    return true; // Default: always commit if field not specified
  }

  await logger.info(`Agent ${agentType} autoCommit setting: ${frontmatter.autoCommit}`);
  return frontmatter.autoCommit;
}

// ============================================================================
// Git Operations
// ============================================================================

function gitCommand(command: string): string {
  try {
    return execSync(command, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (_error) {
    return '';
  }
}

function hasChanges(): boolean {
  const status = gitCommand('git status --porcelain');
  return !!status;
}

async function stageChanges(logger: Logger): Promise<void> {
  try {
    gitCommand('git add -A');
    await logger.debug('Staged changes for commit');
  } catch (error) {
    const err = error as { stderr?: Buffer };
    await logger.error('Failed to stage changes', {
      error: err.stderr?.toString() || error,
    });
    throw new Error(`Failed to stage changes: ${err.stderr?.toString() || error}`);
  }
}

async function commitWithAgent(details: SubagentInvocation, logger: Logger): Promise<boolean> {
  try {
    // Build the prompt for the Agent SDK with subagent context
    const agentPrompt = `/git:commit

Subagent context (from SubagentStop hook):
- Agent: ${details.subagentType}
- Session ID: ${details.sessionId}
- Invocation ID: ${details.invocationId}

Prompt:
${details.prompt}

Please analyze the staged changes and create an appropriate semantic commit message.
Since this is from a hook, auto-approve and execute the commit without user interaction.`;

    await logger.info('Invoking /git:commit via Agent SDK', {
      subagentType: details.subagentType,
      sessionId: details.sessionId,
      invocationId: details.invocationId,
    });

    // Invoke the /git:commit command via Agent SDK
    for await (const msg of query({
      prompt: agentPrompt,
      options: {
        maxTurns: 100,
        settingSources: ['project', 'local'], // Enable slash commands
      },
    })) {
      // Log all Agent SDK outputs
      await logger.debug('Agent SDK message received', {
        messageType: msg.type,
        message: msg,
      });

      if (msg.type === 'result') {
        await logger.info('Agent SDK result received', {
          subtype: msg.subtype,
          isError: msg.is_error,
          numTurns: msg.num_turns,
          totalCostUsd: msg.total_cost_usd,
        });

        if (msg.is_error) {
          await logger.error('Agent SDK execution error', {
            subtype: msg.subtype,
          });
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    await logger.error('Failed to commit via Agent SDK', { error });
    return false;
  }
}

// ============================================================================
// Agent SDK Integration
// ============================================================================

// Commit logic moved to commitWithAgent() function above
// Uses Agent SDK to invoke /git:commit slash command with subagent context

// ============================================================================
// Session Parsing
// ============================================================================

async function getLatestSubagentInvocation(
  transcriptPath: string,
): Promise<SubagentInvocation | null> {
  try {
    const invocations = await sessionAgents(transcriptPath);

    if (invocations.length === 0) {
      return null;
    }

    // Return the most recent invocation
    const latest = invocations[invocations.length - 1];
    return latest ?? null;
  } catch (error) {
    console.error('Warning: Failed to parse session:', error);
    return null;
  }
}

// ============================================================================
// Main Hook Handler
// ============================================================================

async function handleSubagentStop(input: SubagentStopInput): Promise<void> {
  // Initialize logger
  const logger = createHookLogger('subagent-stop', input.session_id, input.transcript_path);

  await logger.info('SubagentStop hook invoked', {
    sessionId: input.session_id,
    transcriptPath: input.transcript_path,
    cwd: input.cwd,
  });

  // Extract subagent details from session
  const details = await getLatestSubagentInvocation(input.transcript_path);

  await logger.info('Subagent details extracted', {
    subagentType: details?.subagentType,
    invocationId: details?.invocationId,
  });

  // Exit early if we don't have valid subagent details
  if (!details || !details.subagentType) {
    await logger.info('No valid subagent details found, exiting (not a subagent invocation)');
    return;
  }

  // Check if there are any changes to commit
  if (!hasChanges()) {
    await logger.info('No changes to commit, exiting');
    return;
  }

  // Check if agent has autoCommit enabled
  const agentType = details.subagentType;
  const shouldCommit = await shouldAutoCommit(agentType, logger);

  if (!shouldCommit) {
    await logger.info(`Agent ${agentType} has autoCommit disabled, skipping commit`);
    console.error(`⊘ Skipping commit for subagent: ${agentType} (autoCommit: false)`);
    return;
  }

  // Use the valid subagent details
  const commitDetails: SubagentInvocation = details;

  await logger.info('Preparing to commit changes', {
    subagentType: commitDetails.subagentType,
  });

  // Stage changes
  await stageChanges(logger);

  // Commit the changes using Agent SDK
  const success = await commitWithAgent(commitDetails, logger);

  if (success) {
    await logger.info('Successfully committed changes', {
      subagentType: commitDetails.subagentType,
    });
    console.error(`✓ Committed changes from subagent: ${commitDetails.subagentType}`);
  } else {
    await logger.error('Failed to commit changes via Agent SDK');
    console.error('✗ Failed to commit changes via Agent SDK');
    process.exit(1);
  }
}

// Create and run the hook
const main = createSubagentStopHook(handleSubagentStop);
main();

export {
  main,
  handleSubagentStop,
  getLatestSubagentInvocation,
  commitWithAgent,
  shouldAutoCommit,
  parseAgentFrontmatter,
};
