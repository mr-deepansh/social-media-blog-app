import js from "@eslint/js";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
      },
    },
    rules: {
      // Production-ready rules
      "no-console": "off", // Allow console for server logs
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
        { SwitchCase: 1, ignoredNodes: ["TemplateLiteral"] },
      ],
      // "max-len": ["error", { code: 80, ignoreUrls: true }], // Disabled
      "no-trailing-spaces": "error",
      "eol-last": "error",
      "no-useless-escape": "warn",
      "no-unreachable": "warn",
      "no-case-declarations": "warn",
      "no-duplicate-imports": "warn",
      "no-dupe-keys": "warn",
      "no-constant-binary-expression": "warn",
    },
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "logs/**",
      "*.min.js",
      "public/**",
    ],
  },
];
