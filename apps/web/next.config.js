/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@repo/ui", "@repo/dtos", "@repo/database", "@repo/api-client"],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    allowedDevOrigins: ["192.168.0.13"],
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/casashopping/**',
            },
        ],
    },
};

export default nextConfig;
