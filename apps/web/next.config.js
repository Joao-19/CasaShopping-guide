/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@repo/ui", "@repo/dtos", "@repo/database"],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
