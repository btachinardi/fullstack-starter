import { Button } from "@libs/core/ui/components/button";
import Link from "next/link";

export default function Page() {
	return (
		<div className="flex items-center justify-center min-h-svh">
			<div className="flex flex-col items-center justify-center gap-4">
				<h1 className="text-2xl font-bold">Fullstack Starter</h1>
				<p className="text-muted-foreground text-center max-w-md">
					A batteries-included monorepo for full-stack TypeScript applications
				</p>
				<div className="flex flex-col gap-2 w-full max-w-xs">
					<Button asChild>
						<Link href="/dashboard">View Dashboard</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/health">System Health</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
