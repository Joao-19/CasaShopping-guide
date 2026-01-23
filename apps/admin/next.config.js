/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
    allowedDevOrigins: ["192.168.0.13", "172.245.190.165"],
    output: "standalone",
    basePath: process.env.BASE_PATH || undefined,
    trailingSlash: true,
    async redirects() {
        return [
            {
                source: "/",
                destination: "/DashBoard/lojas/",
                permanent: false,
            },
        ];
    },
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
                hostname: '192.168.0.13',
                port: '9000',
            },
            {
                protocol: 'http',
                hostname: 'storage',
                port: '9000',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.alias['@nestjs/swagger'] = path.resolve('utils/swagger-shim.ts');
        return config;
    },
};

export default nextConfig;
