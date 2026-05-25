const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: "jest-environment-jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "require"],
  },
  globals: {
    TextDecoder: require("util").TextDecoder,
    TextEncoder: require("util").TextEncoder,
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^cheerio/slim$": "<rootDir>/node_modules/cheerio/dist/commonjs/slim.js",
    "^cheerio$": "<rootDir>/node_modules/cheerio/dist/commonjs/index.js",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(cheerio|undici|htmlparser2|dom-handler|dom-serializer|domhandler|domutils|entities|parse5|parse5-htmlparser2-tree-adapter|css-select|css-what|boolbase|nth-check|cheerio-select)/)",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
    "[/\\\\]e2e[/\\\\]",
    "<rootDir>/.worktrees/",
  ],
  collectCoverageFrom: [
    "components/**/*.tsx",
    "lib/**/*.ts",
    "app/**/*.tsx",
    "!**/*.d.ts",
  ],
};

module.exports = createJestConfig(customConfig);
