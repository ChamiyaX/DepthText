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

            // Add a rule to handle the problematic modules
            config.module.rules.push({
                test: /node_modules\/@imgly\/background-removal/,
                use: 'null-loader',
            });

            config.module.rules.push({
                test: /node_modules\/html2canvas/,
                use: 'null-loader',
            });

            // Prevent specific modules from being included
            config.plugins.push(
                new config.webpack.IgnorePlugin({
                    resourceRegExp: /^(html2canvas|@imgly\/background-removal|onnxruntime-web)$/,
                })
            );
        }

        return config;
    },
    // Disable background removal in production
    env: {
        NEXT_PUBLIC_ENABLE_BACKGROUND_REMOVAL: 'false',
    },
}

module.exports = nextConfig