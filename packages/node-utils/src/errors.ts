/**
 * Base application error for server-side
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly isRetryable: boolean;
  public readonly errorCause?: unknown;

  constructor(
    message: string,
    code: string,
    httpStatus: number = 500,
    isRetryable: boolean = false,
    cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.isRetryable = isRetryable;
    this.errorCause = cause;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      httpStatus: this.httpStatus,
      isRetryable: this.isRetryable,
      ...(this.errorCause ? { cause: String(this.errorCause) } : {}),
    };
  }
}

export class ValidationError extends AppError {
  public readonly errors?: unknown;

  constructor(message: string = 'Validation failed', errors?: unknown) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}
