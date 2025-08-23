import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '__tests__',
    'index.ts',
    'constants.ts',
    'coverage/lcov-report',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
    '^src(.*)$': '<rootDir>/src$1',
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules/', 'coverage/lcov-report'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  verbose: true,
};

// eslint-disable-next-line import/no-default-export
export default config;
