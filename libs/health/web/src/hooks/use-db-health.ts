import { useQuery } from "@tanstack/react-query";
import { healthApi } from "../api/health.api";

/**
 * Hook to fetch database health status
 * Auto-refreshes every 30 seconds
 */
export function useDbHealth() {
	return useQuery({
		queryKey: ["health", "db"],
		queryFn: () => healthApi.getDbHealth(),
		refetchInterval: 30000, // Refresh every 30 seconds
		refetchOnWindowFocus: true,
		staleTime: 20000, // Consider data stale after 20 seconds
	});
}
