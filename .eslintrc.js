export default {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "plugin:security/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier",
  ],
  plugins: ["security", "import", "node"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  rules: {
    // Code Quality & Best Practices
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-var": "error",
    "prefer-const": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-return-assign": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "prefer-promise-reject-errors": "error",
    radix: "error",

    // Code Style (Tab-based)
    indent: [
      "error",
      "tab",
      {
        SwitchCase: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
      },
    ],
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    semi: ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "computed-property-spacing": ["error", "never"],
    "key-spacing": ["error", { beforeColon: false, afterColon: true }],
    "space-before-blocks": "error",
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],

    // Import Rules
    "import/extensions": ["error", "ignorePackages"],
    "import/no-unresolved": "off", // Handled by TypeScript if used
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.js",
          "**/*.spec.js",
          "**/test/**",
          "**/tests/**",
          "**/__tests__/**",
          "**/jest.config.js",
          "**/webpack.config.js",
          "**/rollup.config.js",
          "**/gulpfile.js",
          "**/Gruntfile.js",
        ],
      },
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],

    // Security Rules
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-require": "warn",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "error",

    // Node.js Specific
    "node/no-deprecated-api": "error",
    "node/prefer-global/process": ["error", "always"],
    "node/prefer-promises/fs": "error",
    "node/prefer-promises/dns": "error",

    // Performance & Memory
    "no-loop-func": "error",
    "no-await-in-loop": "warn",

    // Error Handling
    "handle-callback-err": ["error", "^(err|error)$"],
    "no-callback-literal": "error",
    "promise/catch-or-return": "off", // Handled by prefer-promise-reject-errors

    // Enterprise Customizations
    "no-underscore-dangle": [
      "error",
      {
        allow: ["_id", "__dirname", "__filename", "_"],
        allowAfterThis: true,
        allowAfterSuper: true,
      },
    ],
    "consistent-return": "off",
    "class-methods-use-this": "off",
    "func-names": "off",
    "max-len": [
      "error",
      {
        code: 120,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      },
    ],
    complexity: ["warn", 10],
    "max-depth": ["warn", 4],
    "max-nested-callbacks": ["warn", 3],
    "max-params": ["warn", 5],

    // JSDoc Requirements for Production
    "valid-jsdoc": [
      "warn",
      {
        requireReturn: false,
        requireReturnDescription: false,
        requireParamDescription: true,
        prefer: {
          return: "returns",
        },
      },
    ],
    "require-jsdoc": [
      "warn",
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
      },
    ],
  },

  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".json", ".mjs"],
      },
    },
  },

  overrides: [
    {
      files: ["**/*.test.js", "**/*.spec.js", "**/test/**/*.js"],
      env: {
        jest: true,
        mocha: true,
      },
      rules: {
        "no-console": "off",
        "import/no-extraneous-dependencies": "off",
        "security/detect-non-literal-fs-filename": "off",
        "max-len": "off",
        "require-jsdoc": "off",
      },
    },
    {
      files: ["**/config/**/*.js", "**/scripts/**/*.js"],
      rules: {
        "no-console": "off",
        "import/no-dynamic-require": "off",
        "security/detect-non-literal-require": "off",
      },
    },
    {
      files: ["**/*.config.js", "**/*.conf.js"],
      env: {
        node: true,
      },
      rules: {
        "no-console": "off",
        "import/no-dynamic-require": "off",
      },
    },
  ],

  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "logs/",
    "uploads/",
    "coverage/",
    "*.min.js",
    "public/",
    "static/",
  ],

  reportUnusedDisableDirectives: true,
};
