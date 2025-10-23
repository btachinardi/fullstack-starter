import { AppError } from "./app-error";

/**
 * Error thrown when validation fails
 * Can include details about which fields failed validation
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public details?: Record<string, string[]>,
	) {
		super(message, 422, "VALIDATION_ERROR");
	}
}
