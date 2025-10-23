/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: [
		"@libs/core/ui",
		"@libs/core/web",
		"@libs/health/web",
		"@libs/platform/web",
	],
};

export default nextConfig;
