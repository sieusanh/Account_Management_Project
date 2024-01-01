// jest.config.ts
// import type { Config } from "@jest/types"

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,
    // automock: true,
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    moduleFileExtensions: [
        "ts",
        "js",
        "json",
        "node"
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
}
