const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: 'jsdom',
  testTimeout: 10000, // Aumentar timeout para 10s (default é 5s)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Opcional: limitar a pasta de testes
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/archive/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    // Exclude deprecated/archived or problematic files from coverage collection
    '!hooks/useComandasV2.ts',
    '!hooks/useComandasV2.ts.append',
    'lib/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!app/**/page.*',
    '!app/**/layout.*',
  ],
  coverageReporters: ['text', 'lcov'],
  // Enforce modest thresholds to prevent coverage regressions; raise gradually over time
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 20,
      functions: 25,
      lines: 30,
    }
  }
};

module.exports = createJestConfig(customConfig);