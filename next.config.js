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
    output: 'export',
    distDir: '.next',
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Provide fallbacks for node modules
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                os: false,
            };
        }

        return config;
    },
    // Disable background removal in production
    env: {
        NEXT_PUBLIC_ENABLE_BACKGROUND_REMOVAL: 'false',
    },
}

module.exports = nextConfig