"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import type { LayoutConfig } from "./types";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	/** Layout configuration */
	config: LayoutConfig;
	/** User action handlers */
	userActions?: {
		onLogout?: () => void;
		onSettings?: () => void;
		onAccount?: () => void;
	};
}

/**
 * Application sidebar component
 * Composable sidebar with branding, navigation, and user sections
 *
 * @example
 * ```tsx
 * <AppSidebar
 *   config={{
 *     branding: { name: "Acme Inc.", logo: Building2 },
 *     navMain: [{ title: "Dashboard", url: "/", icon: Home }],
 *     navSecondary: [{ title: "Settings", url: "/settings", icon: Settings }],
 *     user: { name: "John Doe", email: "john@example.com" }
 *   }}
 *   userActions={{ onLogout: () => signOut() }}
 * />
 * ```
 */
export function AppSidebar({ config, userActions, ...props }: AppSidebarProps) {
	const { branding, navMain, navSecondary, user } = config;

	return (
		<Sidebar
			collapsible={config.sidebarCollapsible || "offcanvas"}
			variant={config.sidebarVariant}
			{...props}
		>
			{/* Branding Header */}
			{branding && (
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="data-[slot=sidebar-menu-button]:!p-1.5"
							>
								<a href={branding.url || "/"}>
									{branding.logo && <branding.logo className="size-5" />}
									<span className="text-base font-semibold">
										{branding.name}
									</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
			)}

			{/* Navigation Content */}
			<SidebarContent>
				{navMain && navMain.length > 0 && <NavMain items={navMain} />}
				{navSecondary && navSecondary.length > 0 && (
					<NavSecondary items={navSecondary} className="mt-auto" />
				)}
			</SidebarContent>

			{/* User Footer */}
			{user && (
				<SidebarFooter>
					<NavUser user={user} {...userActions} />
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
