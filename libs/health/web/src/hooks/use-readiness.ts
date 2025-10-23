import { useQuery } from "@tanstack/react-query";
import { healthApi } from "../api/health.api";

/**
 * Hook to fetch readiness probe status
 * Auto-refreshes every 30 seconds
 */
export function useReadiness() {
	return useQuery({
		queryKey: ["health", "ready"],
		queryFn: () => healthApi.getReadiness(),
		refetchInterval: 30000, // Refresh every 30 seconds
		refetchOnWindowFocus: true,
		staleTime: 20000, // Consider data stale after 20 seconds
	});
}
