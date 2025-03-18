// This file is used by the Netlify plugin to configure the build
module.exports = {
    framework: 'nextjs',
    frameworkVersion: '15.x',
    buildCommand: 'npm run build',
    devCommand: 'npm run dev',
    installCommand: 'npm install',
    outputDirectory: '.next',
    publish: '.next/standalone',
    functions: {
        directory: '.netlify/functions',
    },
}