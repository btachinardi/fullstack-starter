/**
 * Re-export TanStack Query with starter-specific configuration
 */
import { QueryClient as TanStackQueryClient } from '@tanstack/react-query';

export {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  useIsFetching,
  useIsMutating,
  queryOptions,
  infiniteQueryOptions,
} from '@tanstack/react-query';

export type {
  QueryKey,
  QueryFunction,
  QueryOptions,
  UseQueryOptions,
  UseMutationOptions,
  MutationFunction,
  InfiniteData,
} from '@tanstack/react-query';

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
export function createQueryKeyFactory<T extends string>(resource: T) {
  return {
    all: [resource] as const,
    lists: () => [resource, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [resource, 'list', filters] as const,
    details: () => [resource, 'detail'] as const,
    detail: (id: string | number) => [resource, 'detail', id] as const,
  };
}
