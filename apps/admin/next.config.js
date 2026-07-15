/** @type {import('next').NextConfig} */
import path from 'path';

// Hosts autorizados a embedar o painel num iframe (dashboard externo).
// Mantenha restrito: os cookies de sessao sao SameSite=None (exigencia do
// iframe cross-site), entao este header e a unica barreira contra
// clickjacking. Curinga *.lovable.app nao serve — a plataforma e
// multi-tenant, qualquer conta gratuita ganha um host .lovable.app.
const FRAME_ANCESTORS = [
    "'self'",
    "https://casashopping-dashboard.lovable.app",
    "https://id-preview--1d0aea7f-6527-4240-b1c3-29ceef1d14be.lovable.app",
];

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
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: `frame-ancestors ${FRAME_ANCESTORS.join(" ")};`,
                    },
                ],
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
