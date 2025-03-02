import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@document/(.*)$': '<rootDir>/src/document/$1',
  },

  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.spec.ts', // Exclude test files from coverage
    '!src/app.setup.ts', // Exclude app setup
    '!src/main.ts', // Exclude NestJS bootstrap
    '!src/**/*.module.ts', // Exclude module definitions
    '!src/**/*.d.ts', // Exclude type definitions
    '!src/**/index.ts', // Exclude barrel files
    '!src/**/*.dto.ts', // Exclude DTOs
    '!src/**/*.interface.ts', // Exclude interfaces
    '!src/**/*.types.ts', // Exclude type definitions
    '!src/**/*.constants.ts', // Exclude constants
    '!src/**/*.config.ts', // Exclude config files
    '!src/**/*.controller.ts', // Exclude controllers (covered by e2e tests)
  ],

  coverageDirectory: './coverage',
  coverageProvider: 'v8',
  clearMocks: true,
};

export default config;
