import baseConfig from '@enonic/eslint-config';
import {plugin as tsPlugin} from 'typescript-eslint';
import globals from 'globals';

export default [
    ...baseConfig,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.es2022,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'prefer-const': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/member-ordering': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/unbound-method': 'off',
        },
    },
    {
        ignores: [
            'webpack.config.js',
            'eslint.config.ts',
            'build/**/*',
            'node_modules/**/*',
            '**/.xp/**/*',
            '**/*.js',
            '**/*.d.ts',
        ],
    },
];
