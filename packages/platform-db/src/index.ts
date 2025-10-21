export * from './client';

/**
 * Resource type - matches Prisma schema
 * This is defined here as a fallback for when Prisma client hasn't been generated yet
 */
export interface Resource {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
