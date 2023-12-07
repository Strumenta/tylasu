/** @type {import('jest').Config} */
const config = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/cli.ts",
    "!tests/**",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: [
    "json",
    "text",
    "clover",
    "html",
  ],
  coverageThreshold: {
    global: {
      statements: 89,
      branches: 80,
      functions: 79,
      lines: 89,
    },
  },
  moduleDirectories: ["node_modules"],
  workerIdleMemoryLimit: "500MB",
  moduleFileExtensions: [
    "ts",
    "js",
    "mjs",
    "cjs",
    "json",
  ],
  extensionsToTreatAsEsm: [".ts"],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources
  // with a single module
  moduleNameMapper: {
    "(.+)\\.js": "$1"
  },

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module
  // loader
  // modulePathIgnorePatterns: [],

  // Activates notifications for test results
  // notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",

  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest/presets/js-with-ts-esm",

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Options that will be passed to the testEnvironment
  testEnvironmentOptions: {},

  // Adds a location field to test results
  // testLocationInResults: false,

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/tests/**/*.test.ts",
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
  ],

  // The regexp pattern or array of patterns that Jest uses to detect test files
  // testRegex: [],

  testTimeout: 30000,

  // A map from regular expressions to paths to transformers
  transform: {
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip
  // transformation
  transformIgnorePatterns: [
    "node_modules/",
  ]
};

module.exports = config
