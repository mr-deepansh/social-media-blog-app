module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "import/extensions": ["error", "ignorePackages"],
    "import/no-unresolved": "off",
    "no-underscore-dangle": "off",
    "consistent-return": "off",
  },
  ignorePatterns: ["node_modules/", "dist/", "build/", "logs/", "uploads/"],
};
