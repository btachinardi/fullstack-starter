import { AppError } from "./app-error";

/**
 * Error thrown when an internal server error occurs
 */
export class ServerError extends AppError {
	constructor(message: string = "Internal server error") {
		super(message, 500, "SERVER_ERROR");
	}
}
