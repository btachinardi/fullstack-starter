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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { type AuthBranding, AuthLayout } from "./auth-layout";

export interface ResetPasswordPageProps {
	branding?: AuthBranding;
}

export function ResetPasswordPage({ branding }: ResetPasswordPageProps) {
	return (
		<AuthLayout branding={branding}>
			<ResetPasswordForm />
		</AuthLayout>
	);
}

export function ResetPasswordForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [token, setToken] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tokenValid, setTokenValid] = useState(true);

	useEffect(() => {
		const tokenParam = searchParams?.get("token");
		if (!tokenParam) {
			setTokenValid(false);
			setError("Invalid or missing reset token");
		} else {
			setToken(tokenParam);
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		// Validate passwords match
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		// Validate password length
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			setIsLoading(false);
			return;
		}

		if (!token) {
			setError("Invalid reset token");
			setIsLoading(false);
			return;
		}

		try {
			const result = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (result.error) {
				setError(result.error.message || "Failed to reset password");
				return;
			}

			// Success - redirect to login
			router.push("/login?reset=success");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (!tokenValid) {
		return (
			<div className={cn("flex flex-col gap-6", className)} {...props}>
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Invalid Reset Link</CardTitle>
						<CardDescription>
							This password reset link is invalid or has expired
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-muted-foreground text-center text-sm">
								Reset links expire after 1 hour for security.
							</p>
							<Button variant="outline" className="w-full" asChild>
								<a href="/forgot-password">Request New Reset Link</a>
							</Button>
							<Button variant="ghost" className="w-full" asChild>
								<a href="/login">Back to Login</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Set new password</CardTitle>
					<CardDescription>Enter your new password below</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="password">New Password</FieldLabel>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
									autoFocus
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="confirm-password">
									Confirm Password
								</FieldLabel>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
								<FieldDescription>
									Must be at least 8 characters long
								</FieldDescription>
							</Field>
							{error && <div className="text-destructive text-sm">{error}</div>}
							<Field>
								<Button type="submit" disabled={isLoading} className="w-full">
									{isLoading ? "Resetting..." : "Reset Password"}
								</Button>
								<FieldDescription className="text-center">
									<a href="/login" className="underline">
										Back to Login
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
