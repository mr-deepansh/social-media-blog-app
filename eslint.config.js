import prettierPlugin from "eslint-plugin-prettier";

export default [
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			indent: ["error", "tab"],
			"prettier/prettier": ["error", { useTabs: true }],
			semi: ["error", "always"],
			quotes: [
				"warn",
				"double",
				{ avoidEscape: true, allowTemplateLiterals: true },
			],
		},
	},
];
