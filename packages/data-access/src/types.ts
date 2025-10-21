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

export type Resource = z.infer<typeof ResourceSchema>;

/**
 * Paginated response schema
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
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
