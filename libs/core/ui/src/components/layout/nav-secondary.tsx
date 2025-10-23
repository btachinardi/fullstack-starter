"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../sidebar";
import type { NavItem } from "./types";

export interface NavSecondaryProps
	extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
	items: NavItem[];
}

/**
 * Secondary navigation component for sidebar
 * Typically used for settings, help, etc. in footer
 */
export function NavSecondary({ items, ...props }: NavSecondaryProps) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild>
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
