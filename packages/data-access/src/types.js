import { z } from 'zod';
/**
 * Resource schema
 */
export const ResourceSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = (itemSchema) => z.object({
    items: z.array(itemSchema),
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number(),
    meta: z.object({
        queryId: z.string(),
        generatedAt: z.string(),
    }),
});
//# sourceMappingURL=types.js.map