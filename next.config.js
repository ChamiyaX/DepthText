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
    // Fix for onnxruntime-web
    webpack: (config, { isServer }) => {
        // Only apply these changes for client-side bundles
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                os: false,
            };

            // Ensure onnxruntime-web is properly handled
            config.externals = [
                ...(config.externals || []),
                { 'onnxruntime-web': 'onnxruntime-web' }
            ];
        }

        return config;
    },
}

module.exports = nextConfig