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
import { signUp } from "../lib/auth-client";
import { type AuthBranding, AuthLayout } from "./auth-layout";

export interface SignupPageProps {
	/**
	 * Custom branding for the signup page
	 */
	branding?: AuthBranding;
}

export function SignupPage({ branding }: SignupPageProps) {
	return (
		<AuthLayout branding={branding}>
			<SignupForm />
		</AuthLayout>
	);
}

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			const result = await signUp.email({
				email,
				password,
				name,
			});

			if (result.error) {
				setError(result.error.message || "Signup failed");
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
					<CardTitle className="text-xl">Create your account</CardTitle>
					<CardDescription>
						Enter your details below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="name">Full Name</FieldLabel>
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									disabled={isLoading}
								/>
							</Field>
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
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<Field>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Input
											id="password"
											type="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											disabled={isLoading}
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
									</Field>
								</div>
								<FieldDescription>
									Must be at least 8 characters long.
								</FieldDescription>
							</Field>
							{error && <div className="text-destructive text-sm">{error}</div>}
							<Field>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Creating account..." : "Create Account"}
								</Button>
								<FieldDescription className="text-center">
									Already have an account?{" "}
									<a href="/login" className="underline">
										Sign in
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
