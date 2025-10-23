import { Button } from "@react-email/components";

export interface EmailButtonProps {
	/**
	 * Button URL
	 */
	href: string;
	/**
	 * Button text
	 */
	children: string;
}

/**
 * Email Button Component
 *
 * Styled button for email CTAs
 */
export function EmailButton({ href, children }: EmailButtonProps) {
	return (
		<Button href={href} style={button}>
			{children}
		</Button>
	);
}

const button = {
	backgroundColor: "#000000",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px 20px",
	marginTop: "16px",
	marginBottom: "16px",
};
