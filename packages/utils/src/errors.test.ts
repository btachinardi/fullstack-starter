import { describe, expect, it } from 'vitest';
import {
  AppError,
  AuthError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ValidationError,
} from './errors';

describe('AppError', () => {
  it('should create error with correct properties', () => {
    const error = new AppError('Test error', 'TEST_CODE', 500, false);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(500);
    expect(error.isRetryable).toBe(false);
    expect(error.name).toBe('AppError');
  });

  it('should serialize to JSON correctly', () => {
    const error = new AppError('Test', 'CODE', 400);
    const json = error.toJSON();
    expect(json).toMatchObject({
      name: 'AppError',
      message: 'Test',
      code: 'CODE',
      statusCode: 400,
      isRetryable: false,
    });
  });

  it('should include cause in JSON when provided', () => {
    const cause = new Error('Original error');
    const error = new AppError('Wrapped', 'WRAP', 500, false, cause);
    const json = error.toJSON();
    expect(json.cause).toBeDefined();
  });
});

describe('AuthError', () => {
  it('should create auth error with correct defaults', () => {
    const error = new AuthError();
    expect(error.message).toBe('Authentication required');
    expect(error.code).toBe('AUTH_ERROR');
    expect(error.statusCode).toBe(401);
    expect(error.isRetryable).toBe(false);
  });

  it('should accept custom message', () => {
    const error = new AuthError('Invalid token');
    expect(error.message).toBe('Invalid token');
  });
});

describe('ForbiddenError', () => {
  it('should create forbidden error', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });
});

describe('NotFoundError', () => {
  it('should create not found error', () => {
    const error = new NotFoundError('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });
});

describe('ValidationError', () => {
  it('should create validation error with errors object', () => {
    const errors = { email: 'Invalid email' };
    const error = new ValidationError('Validation failed', errors);
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(errors);
  });

  it('should include errors in JSON', () => {
    const errors = { field: 'error' };
    const error = new ValidationError('Bad', errors);
    const json = error.toJSON();
    expect(json.errors).toEqual(errors);
  });
});

describe('NetworkError', () => {
  it('should create retryable network error', () => {
    const error = new NetworkError();
    expect(error.isRetryable).toBe(true);
    expect(error.statusCode).toBe(0);
  });
});
