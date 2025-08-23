import type { Config } from 'jest';
import { createDefaultPreset } from 'ts-jest';

const defaultPreset = createDefaultPreset();

const config: Config = {
  ...defaultPreset,
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
  globals: {
    __PATH_PREFIX__: '',
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
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

// eslint-disable-next-line import/no-default-export
export default config;
