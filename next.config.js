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
    // Add this to ensure Tailwind CSS works correctly
    webpack: (config) => {
        config.module.rules.push({
            test: /\.css$/,
            use: ['style-loader', 'css-loader', 'postcss-loader'],
        });
        return config;
    },
}

module.exports = nextConfig