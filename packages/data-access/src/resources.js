export class ResourcesApi {
    client;
    constructor(client) {
        this.client = client;
    }
    async list(params) {
        const searchParams = {};
        if (params?.page)
            searchParams.page = String(params.page);
        if (params?.perPage)
            searchParams.perPage = String(params.perPage);
        if (params?.search)
            searchParams.search = params.search;
        if (params?.status)
            searchParams.status = params.status;
        if (params?.sort)
            searchParams.sort = params.sort;
        return this.client.get('/resources', searchParams);
    }
    async get(id) {
        return this.client.get(`/resources/${id}`);
    }
    async create(data) {
        return this.client.post('/resources', data);
    }
    async update(id, data) {
        return this.client.put(`/resources/${id}`, data);
    }
    async delete(id) {
        return this.client.delete(`/resources/${id}`);
    }
}
//# sourceMappingURL=resources.js.map