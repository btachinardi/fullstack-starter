/**
 * Base application error class
 */
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly isRetryable: boolean;
    readonly errorCause?: unknown;
    constructor(message: string, code: string, statusCode?: number, isRetryable?: boolean, cause?: unknown);
    toJSON(): {
        cause?: string;
        name: string;
        message: string;
        code: string;
        statusCode: number;
        isRetryable: boolean;
    };
}
/**
 * Authentication error
 */
export declare class AuthError extends AppError {
    constructor(message?: string, cause?: unknown);
}
/**
 * Authorization error (forbidden)
 */
export declare class ForbiddenError extends AppError {
    constructor(message?: string, cause?: unknown);
}
/**
 * Not found error
 */
export declare class NotFoundError extends AppError {
    constructor(message?: string, cause?: unknown);
}
/**
 * Validation error
 */
export declare class ValidationError extends AppError {
    readonly errors?: unknown;
    constructor(message?: string, errors?: unknown, cause?: unknown);
    toJSON(): {
        errors: unknown;
        cause?: string;
        name: string;
        message: string;
        code: string;
        statusCode: number;
        isRetryable: boolean;
    };
}
/**
 * Network error
 */
export declare class NetworkError extends AppError {
    constructor(message?: string, cause?: unknown);
}
//# sourceMappingURL=errors.d.ts.map