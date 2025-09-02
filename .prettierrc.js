// .prettierrc.js - Enterprise Prettier Configuration
export default {
  // Basic formatting
  useTabs: true,
  tabWidth: 1,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  // Object and array formatting
  bracketSpacing: true,
  bracketSameLine: false,
  trailingComma: "all",
  // Function formatting
  arrowParens: "always",
  // Line formatting
  printWidth: 100,
  endOfLine: "lf",
  // HTML/JSX (if needed in future)
  htmlWhitespaceSensitivity: "css",
  // Overrides for specific file types
  overrides: [
    {
      files: "*.json",
      options: {
        useTabs: true,
        tabWidth: 1,
      },
    },
    {
      files: "*.md",
      options: {
        useTabs: false,
        tabWidth: 2,
        printWidth: 80,
      },
    },
    {
      files: "*.yml",
      options: {
        useTabs: false,
        tabWidth: 2,
      },
    },
  ],
};
