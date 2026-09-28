const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.spec.json');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts', '<rootDir>/projects/step-core/testing/setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', `<rootDir>/step-lint`],
  transformIgnorePatterns: [
    '/node_modules/(?!flat)/', // Exclude modules except 'flat' from transformation
  ],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
    '^ngx-markdown$': '<rootDir>/projects/step-core/mocks/ngx-markdown.mock.ts',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testEnvironment: '@happy-dom/jest-environment',
};
