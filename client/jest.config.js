process.env.NEXT_PUBLIC_IS_TESTING = 'true';

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  // We need to use our own tsconfig for jest, so that we can use jest-dom types
  // and other test-specific types.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for aliases to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  displayName: 'client',

  // a list of paths to modules that run some code to configure or set up the testing framework before each test.
  rootDir: '.',
};

module.exports = createJestConfig(customJestConfig);
