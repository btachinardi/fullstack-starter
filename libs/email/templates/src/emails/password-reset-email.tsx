import { Heading, Text } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

export interface PasswordResetEmailProps {
	/**
	 * User's name
	 */
	name?: string;
	/**
	 * Password reset URL with token
	 */
	resetUrl: string;
	/**
	 * Product name for branding
	 */
	productName?: string;
	/**
	 * Logo URL
	 */
	logoUrl?: string;
}

/**
 * Password Reset Email Template
 *
 * Sent to users when they request a password reset
 */
export function PasswordResetEmail({
	name,
	resetUrl,
	productName = "Fullstack Starter",
	logoUrl,
}: PasswordResetEmailProps) {
	return (
		<EmailLayout
			preview="Reset your password"
			productName={productName}
			logoUrl={logoUrl}
			footerLinks={[
				{ text: "Help Center", url: "https://example.com/help" },
				{ text: "Contact Support", url: "https://example.com/contact" },
			]}
		>
			<Heading style={heading}>Reset your password</Heading>

			<Text style={paragraph}>{name ? `Hi ${name},` : "Hello,"}</Text>

			<Text style={paragraph}>
				We received a request to reset your password for your {productName}{" "}
				account.
			</Text>

			<EmailButton href={resetUrl}>Reset Password</EmailButton>

			<Text style={paragraph}>
				This link will expire in <strong>1 hour</strong> for security reasons.
			</Text>

			<Text style={paragraph}>
				If you didn&apos;t request a password reset, you can safely ignore this
				email. Your password will remain unchanged.
			</Text>

			<Text style={securityNote}>
				<strong>Security tip:</strong> Never share this link with anyone. We
				will never ask for your password via email.
			</Text>
		</EmailLayout>
	);
}

// Default export for React Email CLI preview
export default PasswordResetEmail;

// Styles
const heading = {
	fontSize: "24px",
	fontWeight: "600",
	color: "#000000",
	marginBottom: "24px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "24px",
	color: "#3c4149",
	marginBottom: "16px",
};

const securityNote = {
	fontSize: "14px",
	lineHeight: "20px",
	color: "#6b7280",
	backgroundColor: "#f9fafb",
	padding: "12px 16px",
	borderRadius: "6px",
	marginTop: "24px",
};
