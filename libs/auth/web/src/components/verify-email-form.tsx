"use client";

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
} from "@libs/core/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { authClient } from "../lib/auth-client";
import { type AuthBranding, AuthLayout } from "./auth-layout";

export interface VerifyEmailPageProps {
	branding?: AuthBranding;
}

export function VerifyEmailPage({ branding }: VerifyEmailPageProps) {
	return (
		<AuthLayout branding={branding}>
			<VerifyEmailForm />
		</AuthLayout>
	);
}

export function VerifyEmailForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [resendCooldown, setResendCooldown] = useState(0);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const verifyWithToken = useCallback(
		async (token: string) => {
			setIsLoading(true);
			setError(null);

			try {
				const result = await authClient.emailVerification.verify({
					query: { token },
				});

				if (result.error) {
					setError(result.error.message || "Verification failed");
					return;
				}

				// Success - redirect to dashboard
				router.push("/dashboard");
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setIsLoading(false);
			}
		},
		[router],
	);

	// Auto-verify if token is in URL
	useEffect(() => {
		const token = searchParams?.get("token");
		if (token) {
			verifyWithToken(token);
		}
	}, [searchParams, verifyWithToken]);

	// Cooldown timer for resend
	useEffect(() => {
		if (resendCooldown > 0) {
			const timer = setTimeout(
				() => setResendCooldown(resendCooldown - 1),
				1000,
			);
			return () => clearTimeout(timer);
		}
	}, [resendCooldown]);

	const handleInputChange = (index: number, value: string) => {
		// Only allow numbers
		if (value && !/^\d$/.test(value)) return;

		const newCode = [...code];
		newCode[index] = value;
		setCode(newCode);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}

		// Auto-submit when all digits entered
		if (newCode.every((digit) => digit) && index === 5) {
			handleVerify(newCode.join(""));
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").trim();

		// Only accept 6 digits
		if (/^\d{6}$/.test(pastedData)) {
			const digits = pastedData.split("");
			setCode(digits);
			// Auto-submit
			handleVerify(pastedData);
		}
	};

	const handleVerify = async (verificationCode: string) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.emailVerification.verify({
				query: { token: verificationCode },
			});

			if (result.error) {
				setError(result.error.message || "Invalid verification code");
				setCode(["", "", "", "", "", ""]);
				inputRefs.current[0]?.focus();
				return;
			}

			// Success - redirect to dashboard
			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			setCode(["", "", "", "", "", ""]);
			inputRefs.current[0]?.focus();
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		if (resendCooldown > 0) return;

		setIsLoading(true);
		setError(null);

		try {
			const result = await authClient.emailVerification.sendVerificationEmail();

			if (result.error) {
				setError(result.error.message || "Failed to resend code");
				return;
			}

			// Start cooldown
			setResendCooldown(30);
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
					<CardTitle className="text-xl">Verify your email</CardTitle>
					<CardDescription>
						We sent a verification code to your email address
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* OTP Input */}
						<div className="flex justify-center gap-2">
							{code.map((digit, index) => (
								<input
									key={index}
									ref={(el) => {
										inputRefs.current[index] = el;
									}}
									type="text"
									inputMode="numeric"
									maxLength={1}
									value={digit}
									onChange={(e) => handleInputChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									onPaste={index === 0 ? handlePaste : undefined}
									disabled={isLoading}
									className={cn(
										"h-14 w-12 rounded-md border border-input bg-background text-center text-lg font-semibold",
										"focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
										"disabled:cursor-not-allowed disabled:opacity-50",
									)}
								/>
							))}
						</div>

						{error && (
							<div className="text-destructive text-center text-sm">
								{error}
							</div>
						)}

						{/* Resend Code */}
						<div className="text-center">
							{resendCooldown > 0 ? (
								<p className="text-muted-foreground text-sm">
									Resend code in {resendCooldown}s
								</p>
							) : (
								<Button
									variant="link"
									size="sm"
									onClick={handleResend}
									disabled={isLoading}
								>
									Didn&apos;t receive a code? Resend
								</Button>
							)}
						</div>

						{/* Manual verify button (if they don't want auto-submit) */}
						<Button
							onClick={() => handleVerify(code.join(""))}
							disabled={isLoading || code.some((d) => !d)}
							className="w-full"
						>
							{isLoading ? "Verifying..." : "Verify Email"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
