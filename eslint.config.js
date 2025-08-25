import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsonFormat from 'eslint-plugin-json-format';
import prettier from 'eslint-plugin-prettier';
import promise from 'eslint-plugin-promise';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

// eslint-disable-next-line import/no-default-export
export default defineConfig([
  globalIgnores(['dist/', 'coverage/', 'bin/']),

  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsParser,
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      promise,
      unicorn,
      jest: jestPlugin,
      prettier,
      'sort-keys-fix': sortKeysFix,
      'json-format': jsonFormat,
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],

      'import/newline-after-import': ['error', { count: 1 }],
      'import/no-cycle': 'error',
      'import/no-default-export': 'warn',
      'import/no-nodejs-modules': 'off',
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            'builtin',
            'external',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          'newlines-between': 'always',
        },
      ],
      'import/prefer-default-export': 'off',

      'no-console': 'error',
      'no-duplicate-imports': 'off',
      'no-empty-function': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'padding-line-between-statements': [
        'error',
        { prev: '*', next: 'return', blankLine: 'always' },
      ],

      'sort-keys-fix/sort-keys-fix': [
        'error',
        'asc',
        { caseSensitive: true, natural: false },
      ],

      // Unicorn
      'unicorn/catch-error-name': ['error', { name: 'exception' }],
      'unicorn/no-array-reduce': ['error', { allowSimpleOperations: true }],
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        { replacements: { props: false } },
      ],

      'prettier/prettier': 'error',
    },
  },

  {
    files: ['*.js'],
    rules: {
      'import/no-commonjs': 'off',
      'unicorn/prefer-module': 'off',
    },
  },

  {
    files: ['**/*.test.{ts,tsx,js}'],
    languageOptions: { globals: globals.jest },
    rules: {
      'jest/expect-expect': 'error',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },

  {
    files: ['eslint.config.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'sort-keys-fix/sort-keys-fix': 'off',
    },
  },
]);
