export default {
	// Use ES modules
	preset: null,
	extensionsToTreatAsEsm: [".js"],
	globals: {
		"ts-jest": {
			useESM: true,
		},
	},
	moduleNameMapping: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},

	// Test environment
	testEnvironment: "node",

	// Test file patterns
	testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],

	// Coverage settings
	collectCoverage: false,
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],

	// Setup files
	setupFilesAfterEnv: [],

	// Timeout settings
	testTimeout: 30000,

	// Clear mocks between tests
	clearMocks: true,

	// Verbose output
	verbose: true,

	// Handle ES modules
	transform: {},

	// Module file extensions
	moduleFileExtensions: ["js", "json"],

	// Test results processor
	testResultsProcessor: undefined,

	// Coverage thresholds
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70,
		},
	},
};
