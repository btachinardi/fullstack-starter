import { Heading, Section, Text } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

export interface VerificationEmailProps {
	/**
	 * User's name
	 */
	name?: string;
	/**
	 * 6-digit verification code
	 */
	code: string;
	/**
	 * Verification link (fallback if code doesn't work)
	 */
	verificationUrl: string;
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
 * Email Verification Template
 *
 * Sent to users to verify their email address after signup
 */
export function VerificationEmail({
	name,
	code,
	verificationUrl,
	productName = "Fullstack Starter",
	logoUrl,
}: VerificationEmailProps) {
	return (
		<EmailLayout
			preview={`Your verification code is ${code}`}
			productName={productName}
			logoUrl={logoUrl}
			footerLinks={[
				{ text: "Help Center", url: "https://example.com/help" },
				{ text: "Contact Support", url: "https://example.com/contact" },
			]}
		>
			<Heading style={heading}>Verify your email address</Heading>

			<Text style={paragraph}>{name ? `Hi ${name},` : "Hello,"}</Text>

			<Text style={paragraph}>
				Thanks for signing up! Please verify your email address by entering this
				code:
			</Text>

			<Section style={codeContainer}>
				<Text style={codeStyle}>{code}</Text>
			</Section>

			<Text style={paragraph}>
				This code will expire in <strong>15 minutes</strong>.
			</Text>

			<Text style={paragraph}>
				Alternatively, you can click the button below to verify your email:
			</Text>

			<EmailButton href={verificationUrl}>Verify Email Address</EmailButton>

			<Text style={paragraph}>
				If you didn&apos;t create an account with {productName}, you can safely
				ignore this email.
			</Text>
		</EmailLayout>
	);
}

// Default export for React Email CLI preview
export default VerificationEmail;

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

const codeContainer = {
	background: "#f4f4f5",
	borderRadius: "8px",
	padding: "24px",
	textAlign: "center" as const,
	margin: "24px 0",
};

const codeStyle = {
	fontSize: "32px",
	fontWeight: "700",
	letterSpacing: "8px",
	color: "#000000",
	display: "inline-block",
};
