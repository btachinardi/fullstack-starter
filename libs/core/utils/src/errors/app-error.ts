/**
 * Base error class for all application errors
 * Extends the native Error class with status code and error code support
 */
export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string,
	) {
		super(message);
		this.name = this.constructor.name;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if ("captureStackTrace" in Error) {
			(
				Error as {
					captureStackTrace?: (
						target: object,
						// biome-ignore lint/complexity/noBannedTypes: we cannot predict the constructor signature here
						constructorFunction: Function,
					) => void;
				}
			).captureStackTrace?.(this, this.constructor);
		}
	}
}
