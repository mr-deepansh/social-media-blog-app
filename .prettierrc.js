// .prettierrc.js
export default {
	useTabs: true,
	tabWidth: 2,
	singleQuote: false, // ✅ Force double quotes
	quoteProps: "as-needed",
	semi: true,
	trailingComma: "all",
	bracketSpacing: true,
	bracketSameLine: false,
	printWidth: 120,
	proseWrap: "preserve",
	arrowParens: "avoid",
	endOfLine: "lf",
	insertPragma: false,
	requirePragma: false,
	overrides: [
		{
			files: "*.json",
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: "*.md",
			options: {
				useTabs: false,
				tabWidth: 2,
				proseWrap: "always",
			},
		},
		{
			files: "package.json",
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
};
