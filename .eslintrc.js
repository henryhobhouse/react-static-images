module.exports = {
  env: {
    browser: true,
    'jest/globals': true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'esnext',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        'import/no-commonjs': 0,
        'unicorn/prefer-module': 0,
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'json-format', 'sort-keys-fix', 'jest'],
  rules: {
    '@typescript-eslint/array-type': [
      'warn',
      {
        default: 'array-simple',
      },
    ],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/no-duplicate-imports': 2,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-default-export': 1,
    'import/no-nodejs-modules': 0,
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: ['builtin', 'external', 'parent', 'sibling', 'index', 'object'],
        'newlines-between': 'always',
      },
    ],
    'import/prefer-default-export': 0,
    'no-console': 'error',
    'no-duplicate-imports': 'off',
    'no-undef': 0,
    'no-use-before-define': 0,
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', next: 'return', prev: '*' },
    ],
    'sort-keys-fix/sort-keys-fix': [
      'error',
      'asc',
      { caseSensitive: true, natural: false },
    ],
    'unicorn/no-array-reduce': [
      'error',
      {
        allowSimpleOperations: true,
      },
    ],
    'unicorn/prefer-node-protocol': 0,
    'unicorn/prevent-abbreviations': [
      'error',
      {
        replacements: {
          props: false,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
    react: {
      version: 'detect',
    },
  },
};
