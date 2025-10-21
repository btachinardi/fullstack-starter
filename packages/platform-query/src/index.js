/**
 * Re-export TanStack Query with starter-specific configuration
 */
import { QueryClient as TanStackQueryClient } from '@tanstack/react-query';
export { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient, useInfiniteQuery, useSuspenseQuery, useSuspenseInfiniteQuery, useIsFetching, useIsMutating, queryOptions, infiniteQueryOptions, } from '@tanstack/react-query';
/**
 * Default query client configuration
 */
export function createQueryClient() {
    return new TanStackQueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: false,
            },
        },
    });
}
/**
 * Query key factory for consistent cache keys
 */
export function createQueryKeyFactory(resource) {
    return {
        all: [resource],
        lists: () => [resource, 'list'],
        list: (filters) => [resource, 'list', filters],
        details: () => [resource, 'detail'],
        detail: (id) => [resource, 'detail', id],
    };
}
//# sourceMappingURL=index.js.map