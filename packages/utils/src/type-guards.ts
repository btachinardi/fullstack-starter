/**
 * Common type guards for runtime type safety
 */

/**
 * Type guard to check if a value is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value is an object with a message property
 */
export function isErrorLike(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}

/**
 * Get error message from unknown error value
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (isErrorLike(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

/**
 * Type guard to check if globalThis has Node.js process
 */
export function isNodeEnvironment(global: typeof globalThis): global is typeof globalThis & {
  process: {
    env?: {
      NODE_ENV?: string;
    };
  };
} {
  return (
    typeof global !== 'undefined' &&
    'process' in global &&
    typeof (global as { process?: unknown }).process === 'object' &&
    (global as { process?: unknown }).process !== null
  );
}

/**
 * Check if running in Node.js development mode
 */
export function isNodeDevelopment(): boolean {
  const global = globalThis;
  if (!isNodeEnvironment(global)) {
    return false;
  }
  return global.process.env?.NODE_ENV === 'development';
}
