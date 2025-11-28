# E2E Tests (Playwright)

## Structure

```
e2e/
├── specs/          # Test files (.spec.ts)
├── pages/          # Page Object Models
├── fixtures/       # Test data, mock data
├── screenshots/    # Captured screenshots (gitignored)
├── results/        # Test output (gitignored)
└── snapshots/      # Visual regression snapshots
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test e2e/specs/login.spec.ts

# Generate report
npx playwright show-report
```

## Configuration

See `playwright.config.js` in project root.

- **Base URL:** http://localhost:4000
- **Browser:** Chromium (default)
- **Screenshots:** On failure only
