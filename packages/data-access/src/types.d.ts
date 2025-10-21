import { z } from 'zod';
/**
 * Resource schema
 */
export declare const ResourceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}, {
    id: string;
    status: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}>;
export type Resource = z.infer<typeof ResourceSchema>;
/**
 * Paginated response schema
 */
export declare const PaginatedResponseSchema: <T extends z.ZodType>(itemSchema: T) => z.ZodObject<{
    items: z.ZodArray<T, "many">;
    page: z.ZodNumber;
    perPage: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
    meta: z.ZodObject<{
        queryId: z.ZodString;
        generatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        queryId: string;
        generatedAt: string;
    }, {
        queryId: string;
        generatedAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    meta: {
        queryId: string;
        generatedAt: string;
    };
    items: T["_output"][];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}, {
    meta: {
        queryId: string;
        generatedAt: string;
    };
    items: T["_input"][];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}>;
export type PaginatedResponse<T> = {
    items: T[];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    meta: {
        queryId: string;
        generatedAt: string;
    };
};
//# sourceMappingURL=types.d.ts.map