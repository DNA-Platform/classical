module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Match test files
  testMatch: ['<rootDir>/tests/**/*.tests.ts'],

  // Map @src/* alias to src directory (use the source, not dist)
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },

  // Enable transformation for TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Extensions Jest will recognize
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Restore mocks for each test
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
