# 🎭 Playwright Testing Guide - LottoWebApp

Complete guide for running Playwright tests to verify the Lottery Web Application functionality.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Available Test Suites](#available-test-suites)
6. [Prize Type Refactor Tests](#prize-type-refactor-tests)
7. [Creating New Tests](#creating-new-tests)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses **Playwright** for end-to-end testing. All tests are located in the `/tests` directory.

**Current Test Count:** 15+ test suites
**Coverage:** User management, zones, betting pools, prizes, draws, sortitions

---

## Prerequisites

### 1. Install Playwright

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp
npm install
npx playwright install
```

### 2. Start Backend API

The tests require the .NET API running on port 5000:

```bash
cd /home/jorge/projects/Lottery-Apis
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
cd src/LotteryApi
dotnet run --urls "http://0.0.0.0:5000"
```

### 3. Start Frontend Dev Server

The tests target the React app on port 4200:

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp
npm run dev
```

Verify both services are running:
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000

---

## Test Structure

```
LottoWebApp/
├── tests/
│   ├── prize-type-refactor-verification.spec.js ⭐ NEW
│   ├── create-betting-pool.spec.js
│   ├── edit-betting-pool-persistence.spec.js
│   ├── prizes-configuration-test.spec.js
│   ├── prizes-system-complete.spec.js
│   ├── sortitions-persistence.spec.js
│   ├── lottery-to-draw-refactor.spec.js
│   ├── zones.spec.js
│   ├── edit-user.spec.js
│   └── ...
├── playwright.config.js
└── package.json
```

### Test File Naming Convention

- `*.spec.js` - Test files (Playwright convention)
- Descriptive names: `feature-action-context.spec.js`

### Standard Test Structure

```javascript
import { test, expect } from '@playwright/test';

// Test credentials
const TEST_USER = {
  username: 'admin',
  password: 'Admin123456'
};

// Before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.fill('input[name="username"]', TEST_USER.username);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home)/);
});

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Test implementation
  });
});
```

---

## Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/prize-type-refactor-verification.spec.js
```

### Run Tests in Headed Mode (see browser)

```bash
npx playwright test --headed
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Generate Test Report

```bash
npx playwright test
npx playwright show-report
```

---

## Available Test Suites

### 1. **Prize Type Refactor Verification** ⭐ NEW
**File:** `prize-type-refactor-verification.spec.js`

**Purpose:** Verify the complete refactor from `prizeFieldId` → `prizeTypeId`

**What it tests:**
- ✅ Create new betting pool (banca)
- ✅ Configure general prize types
- ✅ Configure draw-specific prize types
- ✅ Save configuration
- ✅ Logout and login again
- ✅ Verify prize configuration persisted
- ✅ Monitor API calls for `prizeTypeId` usage
- ✅ Detect if any API still uses `prizeFieldId` (should fail test)

**Run:**
```bash
npx playwright test tests/prize-type-refactor-verification.spec.js
```

**Expected Output:**
```
✅ REFACTOR SUCCESSFUL: All API responses use prizeTypeId
```

---

### 2. **Create Betting Pool**
**File:** `create-betting-pool.spec.js`

Tests the complete flow of creating a new betting pool with all configuration tabs.

---

### 3. **Edit Betting Pool Persistence**
**File:** `edit-betting-pool-persistence.spec.js`

Tests that changes to an existing betting pool are correctly saved and persisted.

---

### 4. **Prizes Configuration**
**Files:**
- `prizes-configuration-test.spec.js` - Basic prize configuration
- `prizes-system-complete.spec.js` - Complete prize system workflow
- `prizes-dynamic-api.spec.js` - Dynamic API integration

Tests prize configuration at different levels (general, per draw, per banca).

---

### 5. **Sortitions/Draws**
**Files:**
- `sortitions-persistence.spec.js` - Sortition configuration persistence
- `lottery-to-draw-refactor.spec.js` - Lottery → Draw refactor verification
- `debug-sortitions-load.spec.js` - Debug sortition loading

Tests draw/sortition management and configuration.

---

### 6. **Zones Management**
**Files:**
- `zones.spec.js` - Basic zone tests
- `manage-zones-real-data.spec.js` - Real data management
- `manage-zones-save.spec.js` - Save persistence

Tests geographic zone management.

---

### 7. **User Management**
**File:** `edit-user.spec.js`

Tests user editing and permission management.

---

## Prize Type Refactor Tests

### Background

On 2025-11-14, the API was refactored to rename `prize_fields` → `prize_types` for naming consistency:

```
✅ game_types    (tipos de juego)
✅ bet_types     (tipos de apuesta)
✅ prize_types   (tipos de premio) ← UPDATED
```

### Frontend Changes

All frontend references updated:
- `prizeFieldId` → `prizeTypeId`
- Variables, object properties, API calls, form fields, state, comments

### Verification Test

The test `prize-type-refactor-verification.spec.js` verifies this refactor works end-to-end.

**Test Flow:**

```
1. Login ✓
2. Create Betting Pool ✓
3. Configure General Prizes ✓
4. Configure Draw Prizes ✓
5. Save ✓
6. Logout ✓
7. Login Again ✓
8. Edit Same Banca ✓
9. Verify Prizes Persisted ✓
10. Monitor API Calls ✓
    └─ Verify uses prizeTypeId (NOT prizeFieldId)
```

**API Monitoring:**

The test tracks all API calls and responses:

```javascript
// Request tracking
page.on('request', request => {
  if (request.url().includes('/api/')) {
    apiCalls.push({ method, url, timestamp });
  }
});

// Response tracking
page.on('response', async response => {
  if (response.url().includes('/api/prize')) {
    const body = await response.json();
    // Check for prizeTypeId vs prizeFieldId
  }
});
```

**Success Criteria:**

✅ All API responses use `prizeTypeId`
❌ No API responses use `prizeFieldId`

**If test fails:**

```
❌ REFACTOR INCOMPLETE: X responses still use prizeFieldId
```

This means the refactor is not complete - some code still uses the old field name.

---

## Creating New Tests

### Template

Use this template to create new tests:

```javascript
import { test, expect } from '@playwright/test';

/**
 * Test Suite: [Feature Name]
 * Description: [What this test suite verifies]
 *
 * Prerequisites:
 * - Backend API running on port 5000
 * - Frontend running on port 4200
 * - Test user: admin/Admin123456
 */

const TEST_USER = {
  username: 'admin',
  password: 'Admin123456'
};

// Login before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page.waitForSelector('input[name="username"]', { timeout: 10000 });

  await page.fill('input[name="username"]', TEST_USER.username);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|home|inicio)/, { timeout: 10000 });
});

test.describe('[Feature Name]', () => {

  test('should [specific behavior]', async ({ page }) => {
    // 1. Navigate to page
    await page.goto('/your-feature');

    // 2. Wait for content
    await page.waitForSelector('[data-testid="feature"]', { timeout: 10000 });

    // 3. Perform action
    await page.click('button.action');

    // 4. Verify result
    await expect(page.locator('.result')).toBeVisible();

    // 5. Assertions
    const text = await page.textContent('.result');
    expect(text).toContain('Expected value');
  });

  test('should handle errors', async ({ page }) => {
    // Error scenario test
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Add waits** for async operations (`waitForSelector`, `waitForLoadState`)
3. **Use descriptive test names** - "should do X when Y"
4. **Clean up test data** - delete created entities after test
5. **Take screenshots** on failure for debugging
6. **Monitor API calls** when testing API integration
7. **Test persistence** - save, reload, verify

### API Call Monitoring

```javascript
// Track all API calls
const apiCalls = [];
page.on('request', request => {
  if (request.url().includes('/api/')) {
    apiCalls.push({
      method: request.method(),
      url: request.url(),
      timestamp: new Date().toISOString()
    });
  }
});

// Track responses
const apiResponses = [];
page.on('response', async response => {
  if (response.url().includes('/api/your-endpoint')) {
    const body = await response.json();
    apiResponses.push({ url: response.url(), body });
  }
});

// Later in test
console.log('API calls made:', apiCalls.length);
console.log('Responses received:', apiResponses.length);
```

### Screenshots

```javascript
// Take screenshot on specific step
await page.screenshot({
  path: `/tmp/test-${Date.now()}.png`,
  fullPage: true
});

// In try-catch for error handling
try {
  // Test code
} catch (error) {
  await page.screenshot({ path: '/tmp/error.png' });
  throw error;
}
```

---

## Troubleshooting

### Tests Fail to Start

**Problem:** `Error: Cannot find module '@playwright/test'`

**Solution:**
```bash
npm install
npx playwright install
```

---

### Browser Doesn't Open

**Problem:** Tests run but no browser window appears

**Solution:** Run in headed mode:
```bash
npx playwright test --headed
```

---

### Login Fails

**Problem:** Test fails at login step

**Checklist:**
1. ✅ Backend API running on port 5000?
2. ✅ Frontend running on port 4200?
3. ✅ Correct credentials? (`admin` / `Admin123456`)
4. ✅ User exists in database?

**Debug:**
```bash
npx playwright test --headed --debug
```

---

### Element Not Found

**Problem:** `Timeout waiting for selector`

**Solutions:**

1. Increase timeout:
```javascript
await page.waitForSelector('.element', { timeout: 30000 });
```

2. Use more flexible selectors:
```javascript
// Instead of exact match
await page.locator('button').filter({ hasText: /guardar/i }).click();
```

3. Wait for page load:
```javascript
await page.waitForLoadState('networkidle');
```

---

### API Calls Not Detected

**Problem:** `apiCalls` array is empty

**Solutions:**

1. Ensure listener is set BEFORE navigation:
```javascript
page.on('request', ...);  // Set listener first
await page.goto('/page'); // Then navigate
```

2. Check URL filtering:
```javascript
// Too strict
if (request.url().includes('/api/exact-endpoint'))

// Better
if (request.url().includes('/api/'))
```

---

### Prizes Not Loading

**Problem:** Prize configuration doesn't load

**Debug Steps:**

1. Check network tab in browser (when running headed)
2. Verify API endpoints:
   - GET `/api/bet-types`
   - GET `/api/prize-types` (formerly `/api/prize-fields`)
3. Check console for errors
4. Verify database has prize type data

---

## Test Execution Checklist

Before running tests:

- [ ] Backend API running on port 5000
- [ ] Frontend running on port 4200
- [ ] Database accessible and populated
- [ ] Test user exists (admin/Admin123456)
- [ ] No conflicting browser instances
- [ ] Sufficient disk space for screenshots

After running tests:

- [ ] Review test report
- [ ] Check screenshots in `/tmp` or `test-results/`
- [ ] Review API call logs if test failed
- [ ] Clean up test data if created
- [ ] Update this documentation if new patterns discovered

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Start Backend
        run: |
          cd ../Lottery-Apis/src/LotteryApi
          dotnet run &
      - name: Start Frontend
        run: npm run dev &
      - name: Run tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

---

## Changelog

### 2025-11-14
- ✅ Added `prize-type-refactor-verification.spec.js`
- ✅ Created this testing guide
- ✅ Documented Prize Type refactor (prizeFieldId → prizeTypeId)

---

## Contact

For questions or issues with tests, contact the development team or create an issue in the repository.

**Last Updated:** 2025-11-14
