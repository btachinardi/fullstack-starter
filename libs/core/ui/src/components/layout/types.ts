import type { LucideIcon } from "lucide-react";

/**
 * Navigation item for main navigation
 */
export interface NavItem {
	title: string;
	url: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
}

/**
 * User information for nav footer
 */
export interface NavUser {
	name: string;
	email: string;
	avatar?: string;
}

/**
 * Layout configuration for app-layout
 */
export interface LayoutConfig {
	/** Sidebar branding */
	branding?: {
		name: string;
		logo?: LucideIcon;
		url?: string;
	};

	/** Main navigation items */
	navMain?: NavItem[];

	/** Secondary navigation items (footer) */
	navSecondary?: NavItem[];

	/** Current user information */
	user?: NavUser;

	/** Header title */
	headerTitle?: string;

	/** Header actions (right side) */
	headerActions?: React.ReactNode;

	/** Custom CSS variables */
	style?: React.CSSProperties;

	/** Sidebar variant */
	sidebarVariant?: "sidebar" | "floating" | "inset";

	/** Sidebar collapsible behavior */
	sidebarCollapsible?: "offcanvas" | "icon" | "none";
}
