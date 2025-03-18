/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Disable ESLint during production builds
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Disable TypeScript errors during production builds
        ignoreBuildErrors: true,
    },
    output: 'standalone',
    experimental: {
        outputFileTracingRoot: process.cwd(),
    }
}

module.exports = nextConfig