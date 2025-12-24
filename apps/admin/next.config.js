/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["192.168.0.5"],
    output: "standalone",
    transpilePackages: ["@repo/ui", "@repo/dtos", "@repo/database", "@repo/api-client"],
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
