#!/usr/bin/env node

/**
 * Universal Project Setup Script
 * Automatically configures ESLint, Prettier, and VSCode settings for any project
 */

const fs = require("fs");
const path = require("path");

const setupProject = (projectPath = process.cwd()) => {
  console.log("🚀 Setting up universal formatting configuration...");

  // ESLint configuration
  const eslintConfig = {
    env: {
      node: true,
      es2022: true,
    },
    extends: ["eslint:recommended", "prettier"],
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "arrow-spacing": "error",
      "no-duplicate-imports": "error",
      "no-useless-return": "error",
      "no-useless-concat": "error",
      "prefer-template": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "brace-style": ["error", "1tbs"],
      "comma-dangle": ["error", "always-multiline"],
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
          VariableDeclarator: 1,
          outerIIFEBody: 1,
          MemberExpression: 1,
          FunctionDeclaration: { parameters: 1, body: 1 },
          FunctionExpression: { parameters: 1, body: 1 },
          CallExpression: { arguments: 1 },
          ArrayExpression: 1,
          ObjectExpression: 1,
          ImportDeclaration: 1,
          flatTernaryExpressions: false,
          offsetTernaryExpressions: false,
          ignoredNodes: ["TemplateLiteral", "ConditionalExpression"],
        },
      ],
      "no-trailing-spaces": "error",
      "eol-last": "error",
      "no-useless-escape": "warn",
      "no-unreachable": "warn",
      "no-case-declarations": "warn",
      "no-dupe-keys": "warn",
      "no-constant-binary-expression": "warn",
    },
  };

  // Prettier configuration
  const prettierConfig = {
    semi: true,
    trailingComma: "es5",
    singleQuote: false,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "avoid",
    endOfLine: "lf",
    insertFinalNewline: true,
    requirePragma: false,
  };

  // VSCode settings
  const vscodeSettings = {
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.detectIndentation": false,
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "editor.formatOnType": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
    },
    "prettier.tabWidth": 2,
    "prettier.useTabs": false,
    "prettier.singleQuote": false,
    "prettier.semi": true,
    "prettier.printWidth": 80,
    "prettier.requirePragma": false,
    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.tabSize": 2,
      "editor.insertSpaces": true,
      "editor.detectIndentation": false,
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.tabSize": 2,
      "editor.insertSpaces": true,
      "editor.detectIndentation": false,
    },
    "[json]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.tabSize": 2,
      "editor.insertSpaces": true,
      "editor.detectIndentation": false,
    },
    "[jsonc]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode",
      "editor.tabSize": 2,
      "editor.insertSpaces": true,
      "editor.detectIndentation": false,
    },
  };

  // EditorConfig
  const editorConfig = `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{js,jsx,ts,tsx,json,jsonc}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false`;

  // Create directories
  const vscodeDir = path.join(projectPath, ".vscode");
  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir, { recursive: true });
  }

  // Write configuration files
  try {
    fs.writeFileSync(
      path.join(projectPath, "eslint.config.js"),
			`export default ${JSON.stringify([eslintConfig], null, 2)};`,
    );
    console.log("✅ ESLint configuration created");

    fs.writeFileSync(
      path.join(projectPath, ".prettierrc.json"),
      JSON.stringify(prettierConfig, null, 2),
    );
    console.log("✅ Prettier configuration created");

    fs.writeFileSync(
      path.join(vscodeDir, "settings.json"),
      JSON.stringify(vscodeSettings, null, 2),
    );
    console.log("✅ VSCode settings created");

    fs.writeFileSync(path.join(projectPath, ".editorconfig"), editorConfig);
    console.log("✅ EditorConfig created");

    console.log("\n🎉 Universal formatting setup complete!");
    console.log("📝 Configuration applied:");
    console.log("   - 2-space indentation (no tabs)");
    console.log("   - Format on save/paste/type");
    console.log("   - ESLint auto-fix on save");
    console.log("   - Double quotes");
    console.log("   - 80 character line width");
    console.log("\n🔄 Restart VSCode to apply changes");
  } catch (error) {
    console.error("❌ Error setting up configuration:", error.message);
  }
};

// Run if called directly
if (require.main === module) {
  setupProject();
}

module.exports = setupProject;
