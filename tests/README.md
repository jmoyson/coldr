# Tests

This directory contains all tests for the coldr project.

## Structure

```
tests/
├── unit/          # Unit tests for domain logic
└── e2e/           # End-to-end tests with real file system
```

## Testing Strategy

### What We Test

- **Domain Logic** (`unit/`): Business rules in the campaign service (validation, error handling, state management)
- **E2E Flows** (`e2e/`): Complete user workflows (init, schedule) with real file operations

### What We Don't Test

- External libraries (zod, chalk, commander) - already tested by their maintainers
- Simple utility wrappers - tested implicitly through domain logic tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Test Files

- `unit/campaign.service.test.js` - Campaign domain logic (creation, validation, loading)
- `e2e/init.test.js` - Init command workflow
- `e2e/schedule.test.js` - Schedule command workflow
