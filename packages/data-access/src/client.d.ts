export interface ApiClientConfig {
    baseUrl: string;
    headers?: Record<string, string>;
}
export declare class ApiClient {
    private baseUrl;
    private defaultHeaders;
    constructor(config: ApiClientConfig);
    private request;
    private handleError;
    get<T>(path: string, params?: Record<string, string>): Promise<T>;
    post<T>(path: string, data?: unknown): Promise<T>;
    put<T>(path: string, data?: unknown): Promise<T>;
    delete<T>(path: string): Promise<T>;
}
/**
 * Create default API client
 */
export declare function createApiClient(config?: Partial<ApiClientConfig>): ApiClient;
//# sourceMappingURL=client.d.ts.map