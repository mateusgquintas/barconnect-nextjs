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
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 45,
      lines: 50,
    }
  }
};

module.exports = createJestConfig(customConfig);