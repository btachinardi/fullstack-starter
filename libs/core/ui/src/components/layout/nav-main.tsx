"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../sidebar";
import type { NavItem } from "./types";

export interface NavMainProps {
	items: NavItem[];
}

/**
 * Main navigation component for sidebar
 * Displays primary navigation items with icons
 */
export function NavMain({ items }: NavMainProps) {
	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={item.isActive}
							>
								<a href={item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
