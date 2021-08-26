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
  testPathIgnorePatterns: ['node_modules/', 'coverage/lcov-report', 'e2e/'],
  testRegex:
    '(/__tests__/(?!(testUtils|__data__)).*|\\.(test|spec))\\.(jsx?|tsx?)$',
  timers: 'fake',
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
    '^.+\\.css$': 'identity-obj-proxy',
  },
  verbose: true,
};
