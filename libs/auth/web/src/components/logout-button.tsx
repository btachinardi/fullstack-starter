"use client";

import { Button } from "@libs/core/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "../lib/auth-client";

export interface LogoutButtonProps {
	/**
	 * Button variant
	 */
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	/**
	 * Button size
	 */
	size?: "default" | "sm" | "lg" | "icon";
	/**
	 * Custom class name
	 */
	className?: string;
	/**
	 * Button children (text/icon)
	 */
	children?: React.ReactNode;
}

/**
 * Logout Button Component
 *
 * Handles user logout with loading state
 */
export function LogoutButton({
	variant = "ghost",
	size = "default",
	className,
	children = "Log out",
}: LogoutButtonProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOut();
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={handleLogout}
			disabled={isLoading}
		>
			{isLoading ? "Logging out..." : children}
		</Button>
	);
}
