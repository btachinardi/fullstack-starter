import { AppError } from "./app-error";

/**
 * Error thrown when network requests fail
 * Used by both frontend (calling backend API) and backend (calling external APIs)
 *
 * @example
 * // Frontend calling backend
 * if (!response.ok) {
 *   throw new NetworkError('Request failed', response.status);
 * }
 *
 * @example
 * // Backend calling external API (e.g., WhatsApp Business API)
 * if (!whatsappResponse.ok) {
 *   throw new NetworkError('WhatsApp API request failed', whatsappResponse.status);
 * }
 */
export class NetworkError extends AppError {
	constructor(message: string, statusCode: number = 0) {
		super(message, statusCode, "NETWORK_ERROR");
	}
}
