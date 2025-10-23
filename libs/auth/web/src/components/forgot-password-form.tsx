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
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { type AuthBranding, AuthLayout } from "./auth-layout";

export interface ForgotPasswordPageProps {
	branding?: AuthBranding;
}

export function ForgotPasswordPage({ branding }: ForgotPasswordPageProps) {
	return (
		<AuthLayout branding={branding}>
			<ForgotPasswordForm />
		</AuthLayout>
	);
}

export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password",
			});

			if (result.error) {
				setError(result.error.message || "Failed to send reset email");
				return;
			}

			// Always show success (don't reveal if email exists)
			setSubmitted(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	if (submitted) {
		return (
			<div className={cn("flex flex-col gap-6", className)} {...props}>
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Check your email</CardTitle>
						<CardDescription>
							If an account exists with that email, you&apos;ll receive password
							reset instructions.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<p className="text-muted-foreground text-center text-sm">
								The email should arrive within a few minutes.
							</p>
							<Button variant="outline" className="w-full" asChild>
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
					<CardTitle className="text-xl">Forgot password?</CardTitle>
					<CardDescription>
						Enter your email and we&apos;ll send you reset instructions
					</CardDescription>
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
									autoFocus
								/>
							</Field>
							{error && <div className="text-destructive text-sm">{error}</div>}
							<Field>
								<Button type="submit" disabled={isLoading} className="w-full">
									{isLoading ? "Sending..." : "Send Reset Instructions"}
								</Button>
								<FieldDescription className="text-center">
									Remember your password?{" "}
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
