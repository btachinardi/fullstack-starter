"use client";

import { Separator } from "../separator";
import { SidebarTrigger } from "../sidebar";

export interface AppHeaderProps {
	/** Page title */
	title?: string;
	/** Actions to display on the right side */
	actions?: React.ReactNode;
	/** Custom className */
	className?: string;
}

/**
 * Application header component
 * Displays sidebar trigger, title, and optional actions
 */
export function AppHeader({ title, actions, className }: AppHeaderProps) {
	return (
		<header
			className={`flex h-[var(--header-height,3rem)] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[var(--header-height,3rem)] ${className || ""}`}
		>
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				{title && (
					<>
						<Separator orientation="vertical" className="mx-2 h-4" />
						<h1 className="text-base font-medium">{title}</h1>
					</>
				)}
				{actions && (
					<div className="ml-auto flex items-center gap-2">{actions}</div>
				)}
			</div>
		</header>
	);
}
