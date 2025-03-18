module.exports = {
    extends: 'next/core-web-vitals',
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
        }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        '@next/next/no-img-element': 'warn',
        'react-hooks/exhaustive-deps': 'warn'
    }
}