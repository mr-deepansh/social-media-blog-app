// eslint.config.js
import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	js, // base JavaScript rules
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			// Enforce Prettier formatting as ESLint rules
			"prettier/prettier": [
				"error",
				{
					useTabs: true,
					tabWidth: 1,
					semi: true,
					singleQuote: false,
					bracketSpacing: true,
					printWidth: 100,
				},
			],
			indent: ["error", "tab"],
			semi: ["error", "always"],
			quotes: [
				"warn",
				"double",
				{ avoidEscape: true, allowTemplateLiterals: true },
			],
		},
	},
];
