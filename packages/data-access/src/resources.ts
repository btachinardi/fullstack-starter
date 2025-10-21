import { ApiClient } from './client';
import { Resource, PaginatedResponse } from './types';

export interface ListResourcesParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export class ResourcesApi {
  constructor(private client: ApiClient) {}

  async list(params?: ListResourcesParams): Promise<PaginatedResponse<Resource>> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.perPage) searchParams.perPage = String(params.perPage);
    if (params?.search) searchParams.search = params.search;
    if (params?.status) searchParams.status = params.status;
    if (params?.sort) searchParams.sort = params.sort;

    return this.client.get<PaginatedResponse<Resource>>('/resources', searchParams);
  }

  async get(id: string): Promise<Resource> {
    return this.client.get<Resource>(`/resources/${id}`);
  }

  async create(data: Partial<Resource>): Promise<Resource> {
    return this.client.post<Resource>('/resources', data);
  }

  async update(id: string, data: Partial<Resource>): Promise<Resource> {
    return this.client.put<Resource>(`/resources/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(`/resources/${id}`);
  }
}
