import { AppError } from "./app-error";

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
	constructor(
		message: string = "Resource not found",
		public resource?: string,
	) {
		super(message, 404, "NOT_FOUND_ERROR");
	}
}
