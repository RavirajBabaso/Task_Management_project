module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/integration/**/*.integration.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/integration/setup.ts'],
  // Don't enforce coverage for integration tests
  collectCoverage: false
};