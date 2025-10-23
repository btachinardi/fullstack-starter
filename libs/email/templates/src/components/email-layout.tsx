import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export interface EmailLayoutProps {
	/**
	 * Preview text shown in email client
	 */
	preview: string;
	/**
	 * Product/company name
	 */
	productName?: string;
	/**
	 * Logo URL (optional)
	 */
	logoUrl?: string;
	/**
	 * Email content
	 */
	children: ReactNode;
	/**
	 * Footer links (optional)
	 */
	footerLinks?: Array<{
		text: string;
		url: string;
	}>;
}

/**
 * Email Layout Component
 *
 * Provides consistent branding and structure for all emails
 */
export function EmailLayout({
	preview,
	productName = "Fullstack Starter",
	logoUrl,
	children,
	footerLinks = [],
}: EmailLayoutProps) {
	return (
		<Html>
			<Head />
			<Preview>{preview}</Preview>
			<Body style={main}>
				<Container style={container}>
					{/* Header with logo */}
					<Section style={header}>
						{logoUrl ? (
							<Img src={logoUrl} alt={productName} style={logo} />
						) : (
							<Heading style={logoText}>{productName}</Heading>
						)}
					</Section>

					{/* Main content */}
					<Section style={content}>{children}</Section>

					{/* Footer */}
					<Section style={footer}>
						<Text style={footerText}>
							{footerLinks.length > 0 ? (
								footerLinks.map((link, index) => (
									<span key={link.url}>
										<Link href={link.url} style={footerLink}>
											{link.text}
										</Link>
										{index < footerLinks.length - 1 && " • "}
									</span>
								))
							) : (
								<>
									© {new Date().getFullYear()} {productName}. All rights
									reserved.
								</>
							)}
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Styles
const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
	maxWidth: "600px",
};

const header = {
	padding: "32px 40px",
	borderBottom: "1px solid #eaeaea",
};

const logo = {
	height: "32px",
	width: "auto",
};

const logoText = {
	fontSize: "24px",
	fontWeight: "600",
	margin: "0",
	color: "#000000",
};

const content = {
	padding: "40px 40px",
};

const footer = {
	padding: "0 40px",
	borderTop: "1px solid #eaeaea",
	paddingTop: "24px",
};

const footerText = {
	fontSize: "12px",
	color: "#8898aa",
	lineHeight: "16px",
	textAlign: "center" as const,
	margin: "0",
};

const footerLink = {
	color: "#8898aa",
	textDecoration: "underline",
};
