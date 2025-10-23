"use client";

import { Button } from "@libs/core/ui/components/button";
import type { LayoutConfig } from "@libs/core/ui/components/layout";
import { AppLayout } from "@libs/core/ui/components/layout";
import {
	Activity,
	Building2,
	FolderKanban,
	HelpCircle,
	Home,
	Settings,
	Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function AppLayoutWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const layoutConfig: LayoutConfig = {
		branding: {
			name: "Fullstack Starter",
			logo: Building2,
			url: "/",
		},
		navMain: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: Home,
				isActive: pathname === "/dashboard",
			},
			{
				title: "Projects",
				url: "/projects",
				icon: FolderKanban,
				isActive: pathname === "/projects",
			},
			{
				title: "Team",
				url: "/team",
				icon: Users,
				isActive: pathname === "/team",
			},
			{
				title: "Health",
				url: "/health",
				icon: Activity,
				isActive: pathname === "/health",
			},
		],
		navSecondary: [
			{
				title: "Settings",
				url: "/settings",
				icon: Settings,
			},
			{
				title: "Help",
				url: "/help",
				icon: HelpCircle,
			},
		],
		user: {
			name: "Demo User",
			email: "demo@fullstack-starter.dev",
		},
		headerTitle: getPageTitle(pathname),
		headerActions: (
			<>
				<Button variant="outline" size="sm">
					Export
				</Button>
				<Button size="sm">Create New</Button>
			</>
		),
		style: {
			"--sidebar-width": "16rem",
			"--header-height": "3.5rem",
		} as React.CSSProperties,
		sidebarVariant: "inset",
		sidebarCollapsible: "offcanvas",
	};

	return (
		<AppLayout
			config={layoutConfig}
			userActions={{
				onLogout: () => {
					console.log("Logout clicked");
					router.push("/");
				},
				onSettings: () => router.push("/settings"),
				onAccount: () => router.push("/account"),
			}}
		>
			{children}
		</AppLayout>
	);
}

function getPageTitle(pathname: string): string {
	if (pathname === "/dashboard") return "Dashboard";
	if (pathname === "/projects") return "Projects";
	if (pathname === "/team") return "Team";
	if (pathname === "/settings") return "Settings";
	if (pathname === "/help") return "Help";
	if (pathname === "/health") return "System Health";
	return "Dashboard";
}
