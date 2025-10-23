"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { useState } from "react";

/**
 * Platform Providers - Wires all global providers together
 *
 * Includes:
 * - TanStack Query for data fetching
 * - Next Themes for dark mode support
 *
 * Usage:
 * ```typescript
 * import { Providers } from '@libs/platform/web';
 *
 * export function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 60 seconds
						refetchOnWindowFocus: true,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<NextThemesProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
				enableColorScheme
			>
				{children}
			</NextThemesProvider>
		</QueryClientProvider>
	);
}
