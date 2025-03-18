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
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
        };

        // Add this to provide browser polyfills
        config.resolve.alias = {
            ...config.resolve.alias,
            'onnxruntime-web': false,
        };

        return config;
    },
}

module.exports = nextConfig