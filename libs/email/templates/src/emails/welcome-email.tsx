import { Heading, Hr, Text } from "@react-email/components";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

export interface WelcomeEmailProps {
	/**
	 * User's name
	 */
	name: string;
	/**
	 * Dashboard URL
	 */
	dashboardUrl: string;
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
 * Welcome Email Template
 *
 * Sent to users after successful signup and verification
 */
export function WelcomeEmail({
	name,
	dashboardUrl,
	productName = "Fullstack Starter",
	logoUrl,
}: WelcomeEmailProps) {
	return (
		<EmailLayout
			preview={`Welcome to ${productName}!`}
			productName={productName}
			logoUrl={logoUrl}
			footerLinks={[
				{ text: "Help Center", url: "https://example.com/help" },
				{ text: "Contact Support", url: "https://example.com/contact" },
			]}
		>
			<Heading style={heading}>Welcome to {productName}! 🎉</Heading>

			<Text style={paragraph}>Hi {name},</Text>

			<Text style={paragraph}>
				Thanks for joining {productName}! We&apos;re excited to have you on
				board.
			</Text>

			<EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>

			<Hr style={hr} />

			<Heading style={subheading}>What&apos;s next?</Heading>

			<Text style={paragraph}>Here are some things you can do:</Text>

			<ul style={list}>
				<li style={listItem}>Complete your profile</li>
				<li style={listItem}>Explore the dashboard</li>
				<li style={listItem}>Invite your team members</li>
				<li style={listItem}>Check out our documentation</li>
			</ul>

			<Hr style={hr} />

			<Text style={paragraph}>
				If you have any questions or need help getting started, our support team
				is here for you.
			</Text>

			<Text style={signoff}>
				Best regards,
				<br />
				The {productName} Team
			</Text>
		</EmailLayout>
	);
}

// Default export for React Email CLI preview
export default WelcomeEmail;

// Styles
const heading = {
	fontSize: "24px",
	fontWeight: "600",
	color: "#000000",
	marginBottom: "24px",
};

const subheading = {
	fontSize: "18px",
	fontWeight: "600",
	color: "#000000",
	marginTop: "24px",
	marginBottom: "16px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "24px",
	color: "#3c4149",
	marginBottom: "16px",
};

const hr = {
	borderColor: "#e6e6e6",
	margin: "32px 0",
};

const list = {
	paddingLeft: "20px",
	marginBottom: "16px",
};

const listItem = {
	fontSize: "16px",
	lineHeight: "24px",
	color: "#3c4149",
	marginBottom: "8px",
};

const signoff = {
	fontSize: "16px",
	lineHeight: "24px",
	color: "#3c4149",
	marginTop: "32px",
};
