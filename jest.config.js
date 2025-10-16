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
    'lib/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!app/**/page.*',
    '!app/**/layout.*',
  ],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 55,
      lines: 60,
    }
  }
};

module.exports = createJestConfig(customConfig);