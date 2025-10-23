import { AppError } from "./app-error";

/**
 * Error thrown when authentication or authorization fails
 */
export class AuthError extends AppError {
	constructor(message: string = "Unauthorized", statusCode: number = 401) {
		super(message, statusCode, "AUTH_ERROR");
	}
}
