/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["192.168.0.6"],
    output: "standalone",
    transpilePackages: ["@repo/ui", "@repo/dtos", "@repo/database", "@repo/api-client"],
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
            },
            {
                protocol: 'http',
                hostname: '192.168.0.6',
                port: '9000',
            },
            {
                protocol: 'http',
                hostname: 'storage',
                port: '9000',
            },
        ],
    },
};

export default nextConfig;
