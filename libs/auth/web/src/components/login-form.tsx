"use client";

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	Input,
} from "@libs/core/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "../lib/auth-client";
import { type AuthBranding, AuthLayout } from "./auth-layout";

export interface LoginPageProps {
	/**
	 * Custom branding for the login page
	 */
	branding?: AuthBranding;
}

export function LoginPage({ branding }: LoginPageProps) {
	return (
		<AuthLayout branding={branding}>
			<LoginForm />
		</AuthLayout>
	);
}

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const result = await signIn.email({
				email,
				password,
			});

			if (result.error) {
				setError(result.error.message || "Login failed");
				return;
			}

			// Redirect to dashboard on success
			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
					<CardDescription>Login to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isLoading}
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<a
										href="/forgot-password"
										className="ml-auto text-sm underline-offset-4 hover:underline"
									>
										Forgot your password?
									</a>
								</div>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
							</Field>
							{error && <div className="text-destructive text-sm">{error}</div>}
							<Field>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Logging in..." : "Login"}
								</Button>
								<FieldDescription className="text-center">
									Don&apos;t have an account?{" "}
									<a href="/signup" className="underline">
										Sign up
									</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
