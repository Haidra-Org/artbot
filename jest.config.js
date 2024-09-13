module.exports = {
  roots: ['<rootDir>'],
  testEnvironment: 'jest-environment-jsdom',
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],

  // moduleNameMapper needs to match compilerOptions.paths in tsconfig
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|scss|sass)$': 'identity-obj-proxy' // Mock CSS module imports
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>[/\\\\](node_modules|.next)[/\\\\]',
    '<rootDir>/.jest/test-utils.tsx',
    '<rootDir>/__mocks__/*'
  ],
  transform: {
    // This is necessary because next.js forces { "jsx": "preserve" }, but
    // ts-jest appears to require { "jsx": "react" }
    '^.+\\.[jt]sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx'
        }
      }
    ],
    '\\.tsx?$': ['ts-jest', {}] // TypeScript files
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css)$']
};
