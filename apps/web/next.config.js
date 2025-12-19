/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@repo/ui", "@repo/dtos", "@repo/database"],
    typescript: {
        ignoreBuildErrors: true,
    },
    allowedDevOrigins: ["192.168.0.5"],
};

export default nextConfig;
