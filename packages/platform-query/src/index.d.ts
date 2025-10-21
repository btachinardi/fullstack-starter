/**
 * Re-export TanStack Query with starter-specific configuration
 */
import { QueryClient as TanStackQueryClient } from '@tanstack/react-query';
export { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient, useInfiniteQuery, useSuspenseQuery, useSuspenseInfiniteQuery, useIsFetching, useIsMutating, queryOptions, infiniteQueryOptions, } from '@tanstack/react-query';
export type { QueryKey, QueryFunction, QueryOptions, UseQueryOptions, UseMutationOptions, MutationFunction, InfiniteData, } from '@tanstack/react-query';
/**
 * Default query client configuration
 */
export declare function createQueryClient(): TanStackQueryClient;
/**
 * Query key factory for consistent cache keys
 */
export declare function createQueryKeyFactory<T extends string>(resource: T): {
    all: readonly [T];
    lists: () => readonly [T, "list"];
    list: (filters?: Record<string, unknown>) => readonly [T, "list", Record<string, unknown> | undefined];
    details: () => readonly [T, "detail"];
    detail: (id: string | number) => readonly [T, "detail", string | number];
};
//# sourceMappingURL=index.d.ts.map