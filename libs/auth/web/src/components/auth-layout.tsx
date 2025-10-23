"use client";

import type { ReactNode } from "react";

export interface AuthBranding {
	/**
	 * Product name displayed in auth pages
	 */
	productName: string;
	/**
	 * Logo icon component or element
	 */
	logo?: ReactNode;
	/**
	 * Terms of Service URL
	 */
	termsUrl?: string;
	/**
	 * Privacy Policy URL
	 */
	privacyUrl?: string;
}

export interface AuthLayoutProps {
	children: ReactNode;
	branding?: AuthBranding;
}

/**
 * Auth Layout Component
 *
 * Provides consistent layout for authentication pages with customizable branding
 */
export function AuthLayout({ children, branding }: AuthLayoutProps) {
	const {
		productName = "Fullstack Starter",
		logo,
		termsUrl = "/terms",
		privacyUrl = "/privacy",
	} = branding || {};

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<a href="/" className="flex items-center gap-2 self-center font-medium">
					{logo ? (
						<div className="flex size-8 items-center justify-center">
							{logo}
						</div>
					) : (
						<div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm font-bold">
							{productName.charAt(0)}
						</div>
					)}
					<span className="text-base">{productName}</span>
				</a>
				{children}
				<p className="text-muted-foreground px-6 text-center text-xs">
					By continuing, you agree to our{" "}
					<a href={termsUrl} className="underline hover:text-foreground">
						Terms of Service
					</a>{" "}
					and{" "}
					<a href={privacyUrl} className="underline hover:text-foreground">
						Privacy Policy
					</a>
					.
				</p>
			</div>
		</div>
	);
}
