import { ApiClient } from './client';
import { Resource, PaginatedResponse } from './types';
export interface ListResourcesParams {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
    sort?: string;
}
export declare class ResourcesApi {
    private client;
    constructor(client: ApiClient);
    list(params?: ListResourcesParams): Promise<PaginatedResponse<Resource>>;
    get(id: string): Promise<Resource>;
    create(data: Partial<Resource>): Promise<Resource>;
    update(id: string, data: Partial<Resource>): Promise<Resource>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=resources.d.ts.map