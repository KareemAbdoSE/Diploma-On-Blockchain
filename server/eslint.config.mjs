// eslint.config.mjs
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/**', 'dist/**'], // Ignore node_modules and dist directories
  },
  {
    files: ['src/**/*.{ts,tsx}'],  // Apply to TypeScript files
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: './',
        sourceType: 'module',
        ecmaVersion: 2020,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules, // Use recommended TypeScript rules
      ...prettierConfig.rules,                       // Apply Prettier rules
      'prettier/prettier': 'error',                  // Show Prettier errors as ESLint errors
    },
  },
];
