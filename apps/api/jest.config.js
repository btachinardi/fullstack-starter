module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/seed.ts', '!src/generate-openapi.ts'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@starter/(.*)$': '<rootDir>/../../packages/$1/src',
    '^(.+)\\.js$': '$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  modulePathIgnorePatterns: ['<rootDir>/../../packages/.*/dist'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          esModuleInterop: true,
        },
      },
    ],
  },
};
