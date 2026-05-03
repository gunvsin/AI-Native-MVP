const baseConfig = require('../jest.base.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'functions',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^firebase-functions/v2/params$': '<rootDir>/__mocks__/firebase-functions-params.js',
  },
};
