import { describe, it, expect } from 'vitest';
import { createQueryClient, useQuery, QueryClientProvider } from './index';

describe('platform-query', () => {
  it('should export createQueryClient', () => {
    expect(createQueryClient).toBeDefined();
    expect(typeof createQueryClient).toBe('function');
  });

  it('should create a query client', () => {
    const client = createQueryClient();
    expect(client).toBeDefined();
    expect(client.mount).toBeDefined(); // TanStack QueryClient has mount method
  });

  it('should export useQuery', () => {
    expect(useQuery).toBeDefined();
  });

  it('should export QueryClientProvider', () => {
    expect(QueryClientProvider).toBeDefined();
  });
});
