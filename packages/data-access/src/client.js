import { AppError, AuthError, NetworkError, NotFoundError, ValidationError } from '@starter/utils';
export class ApiClient {
    baseUrl;
    defaultHeaders;
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...config.headers,
        };
    }
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            ...this.defaultHeaders,
            ...options.headers,
        };
        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });
            if (!response.ok) {
                await this.handleError(response);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new NetworkError('Network request failed', error);
        }
    }
    async handleError(response) {
        let errorData;
        try {
            errorData = await response.json();
        }
        catch {
            errorData = { message: response.statusText };
        }
        const message = errorData.message || 'An error occurred';
        switch (response.status) {
            case 401:
                throw new AuthError(message);
            case 404:
                throw new NotFoundError(message);
            case 400:
                throw new ValidationError(message, errorData.errors);
            default:
                throw new AppError(message, errorData.code || 'UNKNOWN_ERROR', response.status);
        }
    }
    async get(path, params) {
        const searchParams = params ? `?${new URLSearchParams(params)}` : '';
        return this.request(`${path}${searchParams}`, {
            method: 'GET',
        });
    }
    async post(path, data) {
        return this.request(path, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    async put(path, data) {
        return this.request(path, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    async delete(path) {
        return this.request(path, {
            method: 'DELETE',
        });
    }
}
/**
 * Create default API client
 */
export function createApiClient(config) {
    const baseUrl = config?.baseUrl ||
        // @ts-ignore - import.meta.env is available in Vite environment
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
        'http://localhost:4000';
    return new ApiClient({ baseUrl, ...config });
}
//# sourceMappingURL=client.js.map