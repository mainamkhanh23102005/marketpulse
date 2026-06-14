import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageThreshold: {
    global: { lines: 80 },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;
