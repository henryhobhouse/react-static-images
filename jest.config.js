/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],

  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '__tests__',
    'index.ts',
    'coverage/lcov-report',
  ],
  globals: {
    __PATH_PREFIX__: '',
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
    '^src(.*)$': '<rootDir>/src$1',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules/', 'coverage/lcov-report'],
  verbose: true,
};
