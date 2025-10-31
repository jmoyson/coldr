# Contributing to Coldr

Thanks for thinking about contributing! Coldr is intentionally small and DX-focused—pull requests, issues, and ideas are all welcome.

## Getting started

1. **Fork & clone**
   ```bash
   git clone https://github.com/<you>/coldr.git
   cd coldr
   npm install
   ```

2. **Run the test suite**
   ```bash
   npm test
   ```

3. **Explore the CLI locally**
   ```bash
   node bin/index.js init
   node bin/index.js schedule --dry-run
   ```

## Development workflow

- Use feature branches (`feat/…`, `fix/…`, `docs/…`).
- Keep commits focused; descriptive messages help a lot (`docs: update README for DX`).
- Add tests for behavioural changes—Vitest (unit) and the existing e2e suites are a good reference.
- Run `npm run lint` before opening a PR.

## Pull requests

Please include:

- A short summary of the change and the problem it solves.
- Screenshots or terminal output if the UX changes.
- Checklist results (tests, lint).

## Issues

Bug? Enhancement idea? DX papercut? Open an issue with:

- Environment (OS, Node version)
- Steps to reproduce
- Expected vs. actual behaviour

## Code of conduct

Be kind, stay constructive, and assume positive intent. This is a DX-first, builder-friendly space.

## Stay in the loop

- ⭐️ Star the repo if you want to stay close to new releases.
- 🧊 Follow [@jeremymoyson](https://x.com/jeremymoyson) on X for roadmap updates and product drops.

Thank you for helping make Coldr better! 🧊
