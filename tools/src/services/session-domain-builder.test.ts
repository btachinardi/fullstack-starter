/**
 * Session Domain Builder Tests
 *
 * Tests for two-phase parsing and domain model building
 */

import { describe, it, expect } from 'vitest';
import { SessionParser } from './session-parser';
import { SessionDomainBuilder, buildEnrichedSession } from './session-domain-builder';
import type { SessionEntry, UserEntry, AssistantEntry } from '../types/session';

describe('SessionDomainBuilder', () => {
  describe('Slash Command Detection', () => {
    it('should detect and merge slash command messages', () => {
      // Create mock entries for slash command
      const commandInvocation: UserEntry = {
        type: 'user',
        uuid: 'uuid-1',
        timestamp: '2025-10-21T01:43:12.091Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: null,
        isSidechain: false,
        message: {
          role: 'user',
          content:
            '<command-message>git:commit is running…</command-message>\n<command-name>/git:commit</command-name>',
        },
      };

      const commandPrompt: UserEntry = {
        type: 'user',
        uuid: 'uuid-2',
        timestamp: '2025-10-21T01:43:12.091Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: 'uuid-1',
        isSidechain: false,
        isMeta: true,
        message: {
          role: 'user',
          content: '# /git:commit\n\nIntelligently commit git changes...',
        },
      };

      const entries: SessionEntry[] = [commandInvocation, commandPrompt];

      // Create parser with mock entries
      const parser = new SessionParser();
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['entries'] = entries;
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['sessionId'] = 'test-session';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['version'] = '2.0.22';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['cwd'] = '/test';

      const builder = new SessionDomainBuilder(parser);
      const enriched = builder.build();

      // Should have one slash command message in main thread
      expect(enriched.mainThread.messages).toHaveLength(1);
      const msg = enriched.mainThread.messages[0];
      expect(msg.type).toBe('slash_command');
      if (msg.type === 'slash_command') {
        expect(msg.commandName).toBe('git:commit');
        expect(msg.commandPrompt).toContain('Intelligently commit git changes');
        expect(msg.sourceUuids).toEqual(['uuid-1', 'uuid-2']);
      }
    });

    it('should not merge non-slash-command user messages', () => {
      const regularMessage: UserEntry = {
        type: 'user',
        uuid: 'uuid-1',
        timestamp: '2025-10-21T01:43:12.091Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: null,
        isSidechain: false,
        message: {
          role: 'user',
          content: 'This is a regular user message',
        },
      };

      const entries: SessionEntry[] = [regularMessage];

      const parser = new SessionParser();
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['entries'] = entries;
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['sessionId'] = 'test-session';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['version'] = '2.0.22';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['cwd'] = '/test';

      const builder = new SessionDomainBuilder(parser);
      const enriched = builder.build();

      expect(enriched.mainThread.messages).toHaveLength(1);
      const msg = enriched.mainThread.messages[0];
      expect(msg.type).toBe('user_message');
      if (msg.type === 'user_message') {
        expect(msg.content).toBe('This is a regular user message');
      }
    });
  });

  describe('Subagent Thread Building', () => {
    it('should build subagent threads from sidechain entries', () => {
      // Create mock subagent invocation
      const subagentInvocation: AssistantEntry = {
        type: 'assistant',
        uuid: 'uuid-main',
        timestamp: '2025-10-21T01:43:19.288Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: null,
        isSidechain: false,
        requestId: 'req-1',
        message: {
          model: 'claude-sonnet-4-5-20250929',
          id: 'msg-1',
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'tool_use',
              id: 'toolu-123',
              name: 'Task',
              input: {
                subagent_type: 'commit-grouper',
                description: 'Analyze git changes',
                prompt: 'Analyze all staged git changes...',
              },
            },
          ],
          stop_reason: null,
          stop_sequence: null,
        },
      };

      // Create mock subagent thread entries
      const subagentUserMsg: UserEntry = {
        type: 'user',
        uuid: 'uuid-sub-1',
        timestamp: '2025-10-21T01:43:19.433Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: null,
        isSidechain: true,
        message: {
          role: 'user',
          content: 'Analyze all staged git changes...',
        },
      };

      const subagentAssistantMsg: AssistantEntry = {
        type: 'assistant',
        uuid: 'uuid-sub-2',
        timestamp: '2025-10-21T01:43:20.000Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: 'uuid-sub-1',
        isSidechain: true,
        requestId: 'req-2',
        message: {
          model: 'claude-sonnet-4-5-20250929',
          id: 'msg-2',
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: 'Here are the commit groups...',
            },
          ],
          stop_reason: null,
          stop_sequence: null,
        },
      };

      const entries: SessionEntry[] = [
        subagentInvocation,
        subagentUserMsg,
        subagentAssistantMsg,
      ];

      const parser = new SessionParser();
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['entries'] = entries;
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['sessionId'] = 'test-session';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['version'] = '2.0.22';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['cwd'] = '/test';

      const builder = new SessionDomainBuilder(parser);
      const enriched = builder.build();

      // Should have subagent invocation in main thread
      expect(enriched.mainThread.messages).toHaveLength(1);
      const msg = enriched.mainThread.messages[0];
      expect(msg.type).toBe('subagent_invocation');

      // Should have subagent thread
      expect(enriched.subagentThreads.size).toBeGreaterThan(0);

      if (msg.type === 'subagent_invocation') {
        expect(msg.subagentType).toBe('commit-grouper');
        expect(msg.prompt).toBe('Analyze all staged git changes...');
        expect(msg.thread.messages).toHaveLength(2); // user + assistant
        expect(msg.thread.subagentType).toBe('commit-grouper');
        expect(msg.thread.invocationId).toBe('toolu-123');
      }
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct statistics', () => {
      const userMsg: UserEntry = {
        type: 'user',
        uuid: 'uuid-1',
        timestamp: '2025-10-21T01:43:12.091Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: null,
        isSidechain: false,
        message: {
          role: 'user',
          content: 'Hello',
        },
      };

      const assistantMsg: AssistantEntry = {
        type: 'assistant',
        uuid: 'uuid-2',
        timestamp: '2025-10-21T01:43:13.000Z',
        sessionId: 'test-session',
        version: '2.0.22',
        cwd: '/test',
        parentUuid: 'uuid-1',
        isSidechain: false,
        requestId: 'req-1',
        message: {
          model: 'claude-sonnet-4-5-20250929',
          id: 'msg-1',
          type: 'message',
          role: 'assistant',
          content: 'Hello!',
          stop_reason: null,
          stop_sequence: null,
        },
      };

      const entries: SessionEntry[] = [userMsg, assistantMsg];

      const parser = new SessionParser();
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['entries'] = entries;
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['sessionId'] = 'test-session';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['version'] = '2.0.22';
      // biome-ignore lint/complexity/useLiteralKeys: accessing private field for testing
      parser['cwd'] = '/test';

      const enriched = buildEnrichedSession(parser);

      expect(enriched.stats.userMessages).toBe(1);
      expect(enriched.stats.assistantMessages).toBe(1);
      expect(enriched.stats.slashCommands).toBe(0);
      expect(enriched.stats.subagentInvocations).toBe(0);
    });
  });
});
