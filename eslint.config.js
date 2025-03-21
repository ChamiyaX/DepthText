module.exports = {
    extends: ['next/core-web-vitals'],
    ignores: ['**/Home.bak.tsx', '**/Home.broken.tsx', '**/Home_fixed.tsx'],
    rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@next/next/no-img-element': 'off',
        'react-hooks/exhaustive-deps': 'off'
    }
}