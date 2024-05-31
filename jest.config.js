module.exports = {
  roots: ['<rootDir>'],
  testEnvironment: 'jest-environment-jsdom',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],

  // moduleNameMapper needs to match compilerOptions.paths in tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>[/\\\\](node_modules|.next)[/\\\\]',
    '<rootDir>/.jest/test-utils.tsx',
    '<rootDir>/__mocks__/*'
  ],
  transform: {
    '\\.tsx?$': ['ts-jest', {}]
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css)$']
}