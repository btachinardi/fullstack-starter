/**
 * Hook Input Service
 *
 * Provides strongly-typed parsing and handling of Claude Code hook inputs.
 * Makes it easy to create new hooks with proper type safety.
 */

// ============================================================================
// Hook Input Types
// ============================================================================

/**
 * Base hook input that all hooks receive
 */
export interface BaseHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: string;
  stop_hook_active: boolean;
}

/**
 * SubagentStop hook input
 */
export interface SubagentStopInput extends BaseHookInput {
  hook_event_name: 'SubagentStop';
}

/**
 * PreToolUse hook input
 */
export interface PreToolUseInput extends BaseHookInput {
  hook_event_name: 'PreToolUse';
  tool_name: string;
  tool_input: Record<string, unknown>;
}

/**
 * PostToolUse hook input
 */
export interface PostToolUseInput extends BaseHookInput {
  hook_event_name: 'PostToolUse';
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_output: unknown;
  is_error?: boolean;
}

/**
 * UserPromptSubmit hook input
 */
export interface UserPromptSubmitInput extends BaseHookInput {
  hook_event_name: 'UserPromptSubmit';
  user_message: string;
}

/**
 * Union type of all hook inputs
 */
export type HookInput =
  | SubagentStopInput
  | PreToolUseInput
  | PostToolUseInput
  | UserPromptSubmitInput;

// ============================================================================
// Hook Input Parser
// ============================================================================

export class HookInputParser {
  /**
   * Parse hook input from stdin
   */
  static async parseStdin(): Promise<HookInput> {
    const stdinBuffer: Buffer[] = [];

    for await (const chunk of process.stdin) {
      stdinBuffer.push(chunk);
    }

    const input = Buffer.concat(stdinBuffer).toString('utf-8');
    return JSON.parse(input) as HookInput;
  }

  /**
   * Parse hook input from string
   */
  static parseString(input: string): HookInput {
    return JSON.parse(input) as HookInput;
  }

  /**
   * Type guard for SubagentStop input
   */
  static isSubagentStop(input: HookInput): input is SubagentStopInput {
    return input.hook_event_name === 'SubagentStop';
  }

  /**
   * Type guard for PreToolUse input
   */
  static isPreToolUse(input: HookInput): input is PreToolUseInput {
    return input.hook_event_name === 'PreToolUse';
  }

  /**
   * Type guard for PostToolUse input
   */
  static isPostToolUse(input: HookInput): input is PostToolUseInput {
    return input.hook_event_name === 'PostToolUse';
  }

  /**
   * Type guard for UserPromptSubmit input
   */
  static isUserPromptSubmit(input: HookInput): input is UserPromptSubmitInput {
    return input.hook_event_name === 'UserPromptSubmit';
  }
}

// ============================================================================
// Hook Handler Base Class
// ============================================================================

/**
 * Base class for creating type-safe hooks
 */
export abstract class HookHandler<T extends HookInput = HookInput> {
  protected input!: T;

  /**
   * Initialize the hook with parsed input
   */
  async initialize(): Promise<void> {
    this.input = (await HookInputParser.parseStdin()) as T;
  }

  /**
   * Validate that the hook input is the expected type
   */
  abstract validateInput(input: HookInput): input is T;

  /**
   * Execute the hook logic
   */
  abstract execute(): Promise<void>;

  /**
   * Run the hook (initialize, validate, execute)
   */
  async run(): Promise<void> {
    try {
      await this.initialize();

      if (!this.validateInput(this.input)) {
        throw new Error(
          `Invalid hook input: expected ${this.constructor.name}, got ${this.input.hook_event_name}`,
        );
      }

      await this.execute();
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error);
      process.exit(1);
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a simple hook handler function
 */
export function createHook<T extends HookInput>(
  validate: (input: HookInput) => input is T,
  handler: (input: T) => Promise<void>,
): () => Promise<void> {
  return async () => {
    try {
      const input = await HookInputParser.parseStdin();

      if (!validate(input)) {
        throw new Error(`Invalid hook input type: ${input.hook_event_name}`);
      }

      await handler(input);
    } catch (error) {
      console.error('Hook error:', error);
      process.exit(1);
    }
  };
}

/**
 * Quick helper to create a SubagentStop hook
 */
export function createSubagentStopHook(
  handler: (input: SubagentStopInput) => Promise<void>,
): () => Promise<void> {
  return createHook(HookInputParser.isSubagentStop, handler);
}

/**
 * Quick helper to create a PreToolUse hook
 */
export function createPreToolUseHook(
  handler: (input: PreToolUseInput) => Promise<void>,
): () => Promise<void> {
  return createHook(HookInputParser.isPreToolUse, handler);
}

/**
 * Quick helper to create a PostToolUse hook
 */
export function createPostToolUseHook(
  handler: (input: PostToolUseInput) => Promise<void>,
): () => Promise<void> {
  return createHook(HookInputParser.isPostToolUse, handler);
}

/**
 * Quick helper to create a UserPromptSubmit hook
 */
export function createUserPromptSubmitHook(
  handler: (input: UserPromptSubmitInput) => Promise<void>,
): () => Promise<void> {
  return createHook(HookInputParser.isUserPromptSubmit, handler);
}
