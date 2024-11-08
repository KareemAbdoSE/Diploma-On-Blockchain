import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import airbnb from 'eslint-config-airbnb';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jestPlugin from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    // Exclude eslint.config.mjs from being parsed by TypeScript
    ignores: ['eslint.config.mjs'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json', // Ensure this path is correct
      },
      globals: {
        // Manually define necessary globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        // Add other globals as needed
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: pluginPrettier,
    },
    rules: {
      // Merge rules from various plugins and configurations
      ...pluginJs.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      ...airbnb.rules,
      ...pluginPrettier.configs.recommended.rules,
      'prettier/prettier': 'error', // Enforce Prettier formatting
    },
  },
  {
    files: ['**/*.test.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        // Jest globals
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        // Add other Jest globals as needed
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
    },
  },
];
