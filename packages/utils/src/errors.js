/**
 * Base application error class
 */
export class AppError extends Error {
    code;
    statusCode;
    isRetryable;
    errorCause;
    constructor(message, code, statusCode = 500, isRetryable = false, cause) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isRetryable = isRetryable;
        this.errorCause = cause;
        Object.setPrototypeOf(this, AppError.prototype);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            isRetryable: this.isRetryable,
            ...(this.errorCause ? { cause: String(this.errorCause) } : {}),
        };
    }
}
/**
 * Authentication error
 */
export class AuthError extends AppError {
    constructor(message = 'Authentication required', cause) {
        super(message, 'AUTH_ERROR', 401, false, cause);
        this.name = 'AuthError';
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}
/**
 * Authorization error (forbidden)
 */
export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden', cause) {
        super(message, 'FORBIDDEN', 403, false, cause);
        this.name = 'ForbiddenError';
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
/**
 * Not found error
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', cause) {
        super(message, 'NOT_FOUND', 404, false, cause);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
/**
 * Validation error
 */
export class ValidationError extends AppError {
    errors;
    constructor(message = 'Validation failed', errors, cause) {
        super(message, 'VALIDATION_ERROR', 400, false, cause);
        this.name = 'ValidationError';
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    toJSON() {
        return {
            ...super.toJSON(),
            errors: this.errors,
        };
    }
}
/**
 * Network error
 */
export class NetworkError extends AppError {
    constructor(message = 'Network request failed', cause) {
        super(message, 'NETWORK_ERROR', 0, true, cause);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
//# sourceMappingURL=errors.js.map