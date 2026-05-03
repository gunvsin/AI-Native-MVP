const baseConfig = require('../jest.base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'client',
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/app/__tests__/setupTests.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$' : 'identity-obj-proxy',
  },
};
