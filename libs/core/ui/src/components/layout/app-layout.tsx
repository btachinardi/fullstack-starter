"use client";

import { SidebarInset, SidebarProvider } from "../sidebar";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import type { LayoutConfig } from "./types";

export interface AppLayoutProps {
	/** Layout configuration */
	config: LayoutConfig;
	/** User action handlers */
	userActions?: {
		onLogout?: () => void;
		onSettings?: () => void;
		onAccount?: () => void;
	};
	/** Page content */
	children: React.ReactNode;
}

/**
 * Application layout wrapper
 * Provides sidebar navigation and header with customizable configuration
 *
 * @example
 * ```tsx
 * <AppLayout
 *   config={{
 *     branding: { name: "My App", logo: Building2 },
 *     navMain: [
 *       { title: "Dashboard", url: "/dashboard", icon: Home },
 *       { title: "Settings", url: "/settings", icon: Settings }
 *     ],
 *     user: { name: "John Doe", email: "john@example.com" },
 *     headerTitle: "Dashboard"
 *   }}
 *   userActions={{ onLogout: () => signOut() }}
 * >
 *   <div>Your page content</div>
 * </AppLayout>
 * ```
 */
export function AppLayout({ config, userActions, children }: AppLayoutProps) {
	const defaultStyle = {
		"--sidebar-width": "16rem",
		"--header-height": "3rem",
		...config.style,
	} as React.CSSProperties;

	return (
		<SidebarProvider style={defaultStyle}>
			<AppSidebar config={config} userActions={userActions} />
			<SidebarInset>
				<AppHeader title={config.headerTitle} actions={config.headerActions} />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
