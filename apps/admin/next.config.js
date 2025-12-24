/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["192.168.0.13"],
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
                pathname: '/casashopping/**',
            },
        ],
    },
};

export default nextConfig;
