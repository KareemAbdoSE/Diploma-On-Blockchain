import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import airbnbBase from 'eslint-config-airbnb-base';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Adds Node.js-specific globals like require and process
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...airbnbBase.rules,
      ...pluginPrettier.configs.recommended.rules,
      'prettier/prettier': 'error', // Enforce Prettier formatting as errors
    },
    plugins: {
      prettier: pluginPrettier,
    },
  },
];
