import { AppError, NetworkError, AuthError, NotFoundError, ValidationError } from '@starter/utils';

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
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
      return data as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new NetworkError('Network request failed', error);
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
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

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${path}${searchParams}`, {
      method: 'GET',
    });
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
    });
  }
}

/**
 * Create default API client
 */
export function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  // @ts-ignore - import.meta.env is available in Vite environment
  const baseUrl = config?.baseUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:4000';
  return new ApiClient({ baseUrl, ...config });
}
