export default {
//   testEnvironment: 'jsdom',
  testEnvironment: 'jest-fixed-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  // Point to your setup file correctly
  setupFilesAfterEnv: ['./setupTests.js'], // Corrected path
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.{js,jsx}',
  ],
};
