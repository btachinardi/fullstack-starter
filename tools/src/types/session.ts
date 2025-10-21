/**
 * Claude Code Session Types
 *
 * Strongly-typed definitions for Claude Code session .jsonl files.
 * Based on analysis of actual session transcripts.
 */

// ============================================================================
// Base Types
// ============================================================================

export interface BaseEntry {
  sessionId: string;
  version: string;
  timestamp: string;
  uuid: string;
  cwd: string;
  gitBranch?: string;
  parentUuid?: string | null;
  isSidechain?: boolean;
  userType?: 'external' | 'internal';
}

// ============================================================================
// Tool Types
// ============================================================================

export type ToolName =
  | 'Read'
  | 'Write'
  | 'Edit'
  | 'Glob'
  | 'Grep'
  | 'Bash'
  | 'Task'
  | 'TodoWrite'
  | 'AskUserQuestion'
  | 'WebFetch'
  | 'WebSearch'
  | 'NotebookEdit'
  | 'BashOutput'
  | 'KillShell'
  | 'Skill'
  | 'SlashCommand'
  | 'ExitPlanMode';

export interface ToolUse {
  type: 'tool_use';
  id: string;
  name: ToolName;
  input: Record<string, unknown>;
}

export interface ToolResult {
  type: 'tool_result';
  tool_use_id: string;
  content: string | Array<{ type: string; [key: string]: unknown }>;
  is_error?: boolean;
}

// ============================================================================
// Content Types
// ============================================================================

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ThinkingContent {
  type: 'thinking';
  thinking: string;
}

export type MessageContent = TextContent | ThinkingContent | ToolUse | ToolResult;

// ============================================================================
// Message Types
// ============================================================================

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation?: {
    ephemeral_5m_input_tokens: number;
    ephemeral_1h_input_tokens: number;
  };
  service_tier?: string;
}

export interface ClaudeMessage {
  model: string;
  id: string;
  type: 'message';
  role: 'assistant' | 'user';
  content: MessageContent[] | string;
  stop_reason?: string | null;
  stop_sequence?: string | null;
  usage?: TokenUsage;
}

// ============================================================================
// Entry Types
// ============================================================================

export interface UserEntry extends BaseEntry {
  type: 'user';
  message: {
    role: 'user';
    content: string;
  };
}

export interface AssistantEntry extends BaseEntry {
  type: 'assistant';
  message: ClaudeMessage;
  requestId: string;
}

export interface SystemEntry extends BaseEntry {
  type: 'system';
  subtype?: 'local_command' | 'error' | 'info' | 'warning';
  content: string;
  level?: 'info' | 'warning' | 'error';
  isMeta?: boolean;
}

export interface SummaryEntry {
  type: 'summary';
  summary: string;
  leafUuid: string;
}

export interface FileHistorySnapshot {
  type: 'file-history-snapshot';
  path: string;
  content: string;
  timestamp: string;
  uuid: string;
}

export interface CreateEntry extends BaseEntry {
  type: 'create';
  path: string;
  content?: string;
}

export interface UpdateEntry extends BaseEntry {
  type: 'update';
  path: string;
  content?: string;
  changes?: unknown;
}

// ============================================================================
// Union Type for All Entries
// ============================================================================

export type SessionEntry =
  | UserEntry
  | AssistantEntry
  | SystemEntry
  | SummaryEntry
  | FileHistorySnapshot
  | CreateEntry
  | UpdateEntry;

// ============================================================================
// Parsed Session Structure
// ============================================================================

export interface ParsedSession {
  sessionId: string;
  version: string;
  cwd: string;
  gitBranch?: string;
  startTime: string;
  endTime: string;
  entries: SessionEntry[];
  metadata: {
    totalEntries: number;
    userMessages: number;
    assistantMessages: number;
    systemMessages: number;
    toolUses: number;
    toolResults: number;
    errors: number;
  };
}

// ============================================================================
// Tool Input Types (for type-safe parsing)
// ============================================================================

export interface ReadToolInput {
  file_path: string;
  offset?: number;
  limit?: number;
}

export interface WriteToolInput {
  file_path: string;
  content: string;
}

export interface EditToolInput {
  file_path: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export interface GlobToolInput {
  pattern: string;
  path?: string;
}

export interface GrepToolInput {
  pattern: string;
  path?: string;
  glob?: string;
  type?: string;
  output_mode?: 'content' | 'files_with_matches' | 'count';
  '-i'?: boolean;
  '-n'?: boolean;
  '-A'?: number;
  '-B'?: number;
  '-C'?: number;
  head_limit?: number;
  multiline?: boolean;
}

export interface BashToolInput {
  command: string;
  description?: string;
  timeout?: number;
  run_in_background?: boolean;
}

export interface TaskToolInput {
  subagent_type: string;
  prompt: string;
  description: string;
}

export interface TodoWriteToolInput {
  todos: Array<{
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
    activeForm: string;
  }>;
}

export interface AskUserQuestionToolInput {
  questions: Array<{
    question: string;
    header: string;
    multiSelect: boolean;
    options: Array<{
      label: string;
      description: string;
    }>;
  }>;
  answers?: Record<string, string>;
}

export interface WebFetchToolInput {
  url: string;
  prompt: string;
}

export interface WebSearchToolInput {
  query: string;
  allowed_domains?: string[];
  blocked_domains?: string[];
}

// ============================================================================
// Type Guards
// ============================================================================

export function isUserEntry(entry: SessionEntry): entry is UserEntry {
  return entry.type === 'user';
}

export function isAssistantEntry(entry: SessionEntry): entry is AssistantEntry {
  return entry.type === 'assistant';
}

export function isSystemEntry(entry: SessionEntry): entry is SystemEntry {
  return entry.type === 'system';
}

export function isSummaryEntry(entry: SessionEntry): entry is SummaryEntry {
  return entry.type === 'summary';
}

export function isFileHistorySnapshot(entry: SessionEntry): entry is FileHistorySnapshot {
  return entry.type === 'file-history-snapshot';
}

export function isCreateEntry(entry: SessionEntry): entry is CreateEntry {
  return entry.type === 'create';
}

export function isUpdateEntry(entry: SessionEntry): entry is UpdateEntry {
  return entry.type === 'update';
}

export function isToolUse(content: MessageContent): content is ToolUse {
  return content.type === 'tool_use';
}

export function isToolResult(content: MessageContent): content is ToolResult {
  return content.type === 'tool_result';
}

export function isTextContent(content: MessageContent): content is TextContent {
  return content.type === 'text';
}

export function isThinkingContent(content: MessageContent): content is ThinkingContent {
  return content.type === 'thinking';
}

// ============================================================================
// Tool Input Type Map
// ============================================================================

export type ToolInputMap = {
  Read: ReadToolInput;
  Write: WriteToolInput;
  Edit: EditToolInput;
  Glob: GlobToolInput;
  Grep: GrepToolInput;
  Bash: BashToolInput;
  Task: TaskToolInput;
  TodoWrite: TodoWriteToolInput;
  AskUserQuestion: AskUserQuestionToolInput;
  WebFetch: WebFetchToolInput;
  WebSearch: WebSearchToolInput;
};
