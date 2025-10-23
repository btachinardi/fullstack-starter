import { useDbHealth, useHealth } from "../hooks";
import type { HealthStatus as HealthStatusType } from "../types/health.types";

/**
 * Status badge component
 */
function StatusBadge({ status }: { status: HealthStatusType }) {
	const statusColors = {
		ok: "bg-green-500 text-white",
		error: "bg-red-500 text-white",
		shutting_down: "bg-yellow-500 text-white",
	};

	const statusLabels = {
		ok: "Healthy",
		error: "Unhealthy",
		shutting_down: "Shutting Down",
	};

	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[status]}`}
		>
			{statusLabels[status]}
		</span>
	);
}

/**
 * Health indicator card component
 */
function HealthIndicatorCard({
	title,
	status,
	details,
	isLoading,
	error,
	lastChecked,
}: {
	title: string;
	status?: HealthStatusType;
	details?: Record<string, unknown>;
	isLoading: boolean;
	error: Error | null;
	lastChecked?: Date;
}) {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
				{isLoading ? (
					<span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
						Loading...
					</span>
				) : error ? (
					<StatusBadge status="error" />
				) : status ? (
					<StatusBadge status={status} />
				) : null}
			</div>

			{error && (
				<div className="rounded-md bg-red-50 p-4">
					<p className="text-sm text-red-800">
						Error: {error.message || "Failed to fetch health status"}
					</p>
				</div>
			)}

			{details && !error && (
				<div className="space-y-2">
					{Object.entries(details).map(([key, value]) => (
						<div
							key={key}
							className="flex items-center justify-between text-sm"
						>
							<span className="text-gray-600">{key}</span>
							<span className="font-medium text-gray-900">
								{typeof value === "object" && value !== null
									? JSON.stringify(value)
									: String(value)}
							</span>
						</div>
					))}
				</div>
			)}

			{lastChecked && !isLoading && (
				<p className="mt-4 text-xs text-gray-500">
					Last checked: {lastChecked.toLocaleTimeString()}
				</p>
			)}
		</div>
	);
}

/**
 * Health status dashboard component
 * Displays overall system health and database health
 * Auto-refreshes every 30 seconds
 */
export function HealthStatus() {
	const {
		data: healthData,
		isLoading: healthLoading,
		error: healthError,
		dataUpdatedAt: healthUpdatedAt,
		refetch: refetchHealth,
	} = useHealth();

	const {
		data: dbHealthData,
		isLoading: dbHealthLoading,
		error: dbHealthError,
		dataUpdatedAt: dbHealthUpdatedAt,
		refetch: refetchDb,
	} = useDbHealth();

	const handleRefresh = () => {
		refetchHealth();
		refetchDb();
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900">System Health</h1>
				<button
					type="button"
					onClick={handleRefresh}
					disabled={healthLoading || dbHealthLoading}
					className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Refresh
				</button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<HealthIndicatorCard
					title="Overall Health"
					status={healthData?.status}
					details={healthData?.details}
					isLoading={healthLoading}
					error={healthError}
					lastChecked={healthUpdatedAt ? new Date(healthUpdatedAt) : undefined}
				/>

				<HealthIndicatorCard
					title="Database Health"
					status={dbHealthData?.status}
					details={dbHealthData?.details}
					isLoading={dbHealthLoading}
					error={dbHealthError}
					lastChecked={
						dbHealthUpdatedAt ? new Date(dbHealthUpdatedAt) : undefined
					}
				/>
			</div>

			<div className="mt-6 rounded-md bg-blue-50 p-4">
				<p className="text-sm text-blue-800">
					Health checks automatically refresh every 30 seconds
				</p>
			</div>
		</div>
	);
}
