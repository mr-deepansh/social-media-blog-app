module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "plugin:node/recommended",
    "prettier",
  ],
  plugins: ["node", "prettier"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    "no-console": "warn",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "node/no-unsupported-features/es-syntax": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "class-methods-use-this": "off",
    "no-underscore-dangle": ["error", { allow: ["_id"] }],
    "consistent-return": "off",
    "no-param-reassign": ["error", { props: false }],
  },
  ignorePatterns: ["node_modules/", "dist/", "build/", "coverage/"],
};
