export default {
  "*.{js,jsx,ts,tsx}": ["npx eslint --fix", "npx prettier --write"],
  "*.{json,md,yml,yaml,css,scss}": ["npx prettier --write"],
};
