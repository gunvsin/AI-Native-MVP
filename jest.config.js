module.exports = {
  projects: [
    {
      displayName: 'client',
      testMatch: ['<rootDir>/client/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/client/tsconfig.test.json' }],
      },
    },
    {
      displayName: 'functions',
      testMatch: ['<rootDir>/functions/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/functions/tsconfig.json' }],
      },
    },
  ],
};
