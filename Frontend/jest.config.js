// Frontend/jest.config.js
export default { // Or module.exports if you're not using ESM here
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'], // Your existing setup file
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // This line tells Jest to use Babel
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mocks CSS imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js' // Mocks file imports
  },
  // If you are using ES Modules in your tests or source code Jest needs to process:
  // transformIgnorePatterns: [
  //   '/node_modules/(?!(your-es-module-dependency)/)',
  // ],
};
