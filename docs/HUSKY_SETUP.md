# 🐕 Husky Setup Guide (2025+ Modern Approach)

## Overview

This project uses **Husky v9+** with the latest recommended configuration approach. The old `husky add` command is deprecated and replaced with direct file creation.

## Current Configuration

### Installed Hooks

| Hook | Command | Purpose |
|------|---------|---------|
| `pre-commit` | `npm run pre-commit` | Runs lint-staged (ESLint + Prettier) |
| `pre-push` | `npm run pre-push` | Runs linting and tests |
| `commit-msg` | `npx --no -- commitlint --edit $1` | Validates commit message format |

### Package.json Scripts

```json
{
  "scripts": {
    "prepare": "husky",
    "husky:setup": "node scripts/setup-husky.js",
    "pre-commit": "lint-staged",
    "pre-push": "npm run lint:check && npm run test"
  }
}
```

## Setup Instructions

### Automatic Setup

```bash
# Run the setup script
npm run husky:setup
```

### Manual Setup (if needed)

```bash
# 1. Install Husky
npm install husky --save-dev

# 2. Initialize Husky
npx husky

# 3. Create hooks manually
echo "npm run pre-commit" > .husky/pre-commit
echo "npm run pre-push" > .husky/pre-push
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# 4. Make executable (Linux/macOS only)
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

## What Changed from Old Husky?

### ❌ Old Way (Deprecated)
```bash
# This is now deprecated
npx husky add .husky/pre-commit "npm run pre-commit"
```

### ✅ New Way (2025+)
```bash
# Direct file creation
echo "npm run pre-commit" > .husky/pre-commit
```

## Verification

### Test Hooks Work

```bash
# Test pre-commit hook
git add .
git commit -m "test: verify husky setup"

# Test pre-push hook
git push origin feature-branch
```

### Check Hook Files

```bash
# Verify hook files exist
ls -la .husky/
cat .husky/pre-commit
cat .husky/pre-push
cat .husky/commit-msg
```

## Troubleshooting

### Hooks Not Running?

1. **Check if hooks are executable:**
   ```bash
   chmod +x .husky/*
   ```

2. **Verify Husky is installed:**
   ```bash
   npx husky --version
   ```

3. **Re-run setup:**
   ```bash
   npm run husky:setup
   ```

### Windows Issues

- Husky handles Windows compatibility automatically
- No need for `chmod` on Windows
- Use Git Bash or WSL for better compatibility

### Git Hooks Bypassed?

```bash
# Force hooks to run
git commit --no-verify  # Bypasses hooks (not recommended)
git commit              # Normal commit with hooks
```

## Best Practices

1. **Always commit with hooks enabled**
2. **Fix linting issues before committing**
3. **Use conventional commit messages**
4. **Test your changes before pushing**

## Conventional Commits

This project uses conventional commits. Examples:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login validation bug"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize database queries"
```

## Integration with CI/CD

The same scripts run in CI/CD:

```yaml
# GitHub Actions example
- name: Run linting
  run: npm run lint:check

- name: Run tests
  run: npm test
```

---

**📝 Note:** This setup ensures code quality and consistency across all contributors while using the latest Husky best practices.