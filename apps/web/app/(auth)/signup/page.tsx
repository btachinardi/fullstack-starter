import { SignupPage } from "@libs/auth/web";
import { GalleryVerticalEnd } from "lucide-react";

export default function Page() {
	return (
		<SignupPage
			branding={{
				productName: "Fullstack Starter",
				logo: <GalleryVerticalEnd className="size-6" />,
				termsUrl: "/terms",
				privacyUrl: "/privacy",
			}}
		/>
	);
}
