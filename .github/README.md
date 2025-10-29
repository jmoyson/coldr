# CI/CD Setup

## Overview

This project uses GitHub Actions for continuous integration. The workflow automatically runs on every push to `main` and on all pull requests.

## Workflow Steps

1. **Checkout code** - Gets the latest code
2. **Setup Node.js** - Installs Node.js 20 with npm caching
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Check formatting** - Verifies code is formatted with Prettier
5. **Run linter** - Checks code quality with ESLint
6. **Run tests** - Executes all unit and e2e tests with Vitest

## Local Development

### Available Scripts

```bash
# Format code
npm run format

# Check formatting without modifying files
npm run format:check

# Lint code
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Pre-commit Checklist

Before committing, ensure:

1. Code is formatted: `npm run format`
2. No lint errors: `npm run lint`
3. All tests pass: `npm test`

Or run all checks at once:

```bash
npm run format && npm run lint && npm test
```
