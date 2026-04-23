module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/app.ts',
    '!src/server.ts',
    '!src/config/**/*.ts',
    '!src/models/index.ts',
    '!src/routes/**/*.ts',
    '!src/jobs/**/*.ts',
    '!src/utils/pdfGenerator.ts',
    '!src/utils/excelGenerator.ts'
  ],
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80
  //   }
  // },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
};