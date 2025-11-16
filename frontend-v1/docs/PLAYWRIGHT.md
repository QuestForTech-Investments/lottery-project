# Playwright Testing Documentation - Frontend V1

## Table of Contents
1. [Login Information](#login-information)
2. [Application Routes](#application-routes)
3. [Common Selectors](#common-selectors)
4. [Helper Functions](#helper-functions)
5. [Example Tests](#example-tests)
6. [Best Practices](#best-practices)

---

## Login Information

### Credentials
- **URL:** `http://localhost:3000/login`
- **Username:** `admin`
- **Password:** `Admin123456`

### Login Form Selectors
```javascript
const loginSelectors = {
  usernameInput: 'input#username',  // or '#username'
  passwordInput: 'input#password',  // or '#password'
  submitButton: 'button#log-in',    // or '#log-in'
  generalError: '.bg-red-100',      // General error message container
  fieldError: '.text-red-500'       // Field-specific error messages
};
```

### Login Flow
1. Navigate to `http://localhost:3000/login`
2. Wait for username input to be visible
3. Fill username field with `admin`
4. Fill password field with `Admin123456`
5. Click submit button
6. Wait for navigation to `/dashboard`

---

## Application Routes

### Public Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Login | Login page (redirects to /login) |
| `/login` | Login | Main login page |

### Protected Routes (Require Authentication)

#### Dashboard
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Main dashboard after login |

#### Usuarios (Users)
| Route | Component | Description |
|-------|-----------|-------------|
| `/usuarios/crear` | CreateUser | Create new user form |
| `/usuarios/editar/:userId` | EditUser | Edit existing user |
| `/usuarios/lista` | UserList | List all users |

#### Bancas (Betting Pools)
| Route | Component | Description |
|-------|-----------|-------------|
| `/bancas/lista` | BancasList | List all betting pools |
| `/bancas/crear` | CreateBanca | Create new betting pool |
| `/bancas/editar/:id` | EditBanca | Edit existing betting pool |

#### Zones
| Route | Component | Description |
|-------|-----------|-------------|
| `/zones/list` | ZonesList | List all zones |
| `/zones/new` | CreateZone | Create new zone |
| `/zones/edit/:id` | EditZone | Edit existing zone |

---

## Common Selectors

### CreateBanca Form (Tab: General)
```javascript
const createBancaSelectors = {
  // Tab buttons
  generalTab: 'button.tab:has-text("General")',
  configTab: 'button.tab:has-text("Configuración")',
  footerTab: 'button.tab:has-text("Pies de página")',
  prizesTab: 'button.tab:has-text("Premios & Comisiones")',
  schedulesTab: 'button.tab:has-text("Horarios de sorteos")',
  drawsTab: 'button.tab:has-text("Sorteos")',
  stylesTab: 'button.tab:has-text("Estilos")',
  expensesTab: 'button.tab:has-text("Gastos automáticos")',

  // General tab fields
  branchName: 'input[name="branchName"]',
  username: 'input[name="username"]',
  password: 'input[name="password"]',
  confirmPassword: 'input[name="confirmPassword"]',
  location: 'input[name="location"]',
  reference: 'input[name="reference"]',
  comment: 'textarea[name="comment"]',

  // Configuration tab fields
  selectedZone: 'select[name="selectedZone"]',

  // Buttons
  createButton: 'button.create-button:has-text("CREAR")',
  cancelButton: 'button:has-text("CANCELAR")',

  // Messages
  errorMessage: '.error-message',
  successMessage: '.success-message'
};
```

### BancasList Form
```javascript
const bancasListSelectors = {
  searchInput: 'input[placeholder*="Buscar"]',
  createButton: 'a[href="/bancas/crear"]',
  table: 'table',
  tableRows: 'tbody tr',
  editButton: 'button:has-text("Editar")',
  deleteButton: 'button:has-text("Eliminar")',
  pagination: '.pagination'
};
```

### UserList Form
```javascript
const userListSelectors = {
  createUserButton: 'a[href="/usuarios/crear"]',
  searchInput: 'input[type="search"]',
  table: 'table',
  tableRows: 'tbody tr',
  editButton: 'button:has-text("Editar")',
  deleteButton: 'button:has-text("Eliminar")'
};
```

### CreateUser Form
```javascript
const createUserSelectors = {
  firstName: 'input[name="firstName"]',
  lastName: 'input[name="lastName"]',
  email: 'input[name="email"]',
  username: 'input[name="username"]',
  password: 'input[name="password"]',
  confirmPassword: 'input[name="confirmPassword"]',
  roleSelect: 'select[name="roleId"]',
  submitButton: 'button[type="submit"]'
};
```

---

## Helper Functions

### Login Helper
```javascript
/**
 * Performs login action
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} username - Username (default: 'admin')
 * @param {string} password - Password (default: 'Admin123456')
 */
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000); // Extra wait for UI to settle
}
```

### Navigation Helper
```javascript
/**
 * Navigates to a protected route (assumes already logged in)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} route - Route path (e.g., '/bancas/crear')
 */
async function navigateTo(page, route) {
  await page.goto(`http://localhost:3000${route}`);
  await page.waitForLoadState('networkidle');
}
```

### Wait for API Response Helper
```javascript
/**
 * Waits for specific API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} urlPattern - URL pattern to match (e.g., '/api/betting-pools')
 * @param {string} method - HTTP method (e.g., 'POST', 'GET')
 * @returns {Promise<Response>} - Response object
 */
async function waitForAPIResponse(page, urlPattern, method = 'POST') {
  return await page.waitForResponse(
    response => response.url().includes(urlPattern) && response.request().method() === method,
    { timeout: 10000 }
  );
}
```

### Fill Form Helper
```javascript
/**
 * Fills multiple form fields at once
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} fields - Object with selector: value pairs
 */
async function fillForm(page, fields) {
  for (const [selector, value] of Object.entries(fields)) {
    if (value !== null && value !== undefined) {
      await page.fill(selector, String(value));
    }
  }
}
```

---

## Example Tests

### Example 1: Login Test
```javascript
import { test, expect } from '@playwright/test';

test('should login successfully with valid credentials', async ({ page }) => {
  // Navigate to login
  await page.goto('http://localhost:3000/login');

  // Fill login form
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123456');

  // Submit
  await page.click('button[type="submit"]');

  // Verify navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  expect(page.url()).toContain('/dashboard');
});
```

### Example 2: Create Banca Test
```javascript
import { test, expect } from '@playwright/test';

test('should create new banca with minimum required fields', async ({ page }) => {
  // Step 1: Login
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Step 2: Navigate to Create Banca
  await page.goto('http://localhost:3000/bancas/crear');
  await page.waitForSelector('input[name="branchName"]', { timeout: 10000 });

  // Step 3: Fill General tab
  await page.fill('input[name="branchName"]', 'Test Banca Playwright');
  await page.fill('input[name="username"]', 'testuser' + Date.now());
  await page.fill('input[name="password"]', 'test123');
  await page.fill('input[name="confirmPassword"]', 'test123');
  await page.fill('input[name="location"]', 'Test Location');
  await page.fill('input[name="reference"]', 'Test Reference');

  // Step 4: Go to Configuration tab and select zone
  await page.click('button.tab:has-text("Configuración")');
  await page.waitForSelector('select[name="selectedZone"]');
  await page.selectOption('select[name="selectedZone"]', { index: 1 });

  // Step 5: Setup API response listener
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/betting-pools') &&
                response.request().method() === 'POST',
    { timeout: 10000 }
  );

  // Step 6: Submit form
  await page.click('button.create-button:has-text("CREAR")');

  // Step 7: Wait for API response
  const response = await responsePromise;
  expect(response.status()).toBe(201);

  // Step 8: Verify success message or navigation
  await page.waitForTimeout(2000);
  const successMessage = await page.locator('.success-message').textContent().catch(() => null);
  expect(successMessage).toBeTruthy();
});
```

### Example 3: List Bancas Test
```javascript
import { test, expect } from '@playwright/test';

test('should display list of bancas', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // Navigate to Bancas List
  await page.goto('http://localhost:3000/bancas/lista');

  // Wait for API response
  await page.waitForResponse(response =>
    response.url().includes('/api/betting-pools') &&
    response.request().method() === 'GET'
  );

  // Verify table is visible
  const table = await page.locator('table');
  await expect(table).toBeVisible();

  // Verify at least one row exists
  const rows = await page.locator('tbody tr').count();
  expect(rows).toBeGreaterThan(0);
});
```

### Example 4: Using Helper Functions
```javascript
import { test, expect } from '@playwright/test';

// Helper function
async function login(page, username = 'admin', password = 'Admin123456') {
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test('create banca using helper functions', async ({ page }) => {
  // Login using helper
  await login(page);

  // Navigate to create page
  await page.goto('http://localhost:3000/bancas/crear');
  await page.waitForSelector('input[name="branchName"]');

  // Fill form
  const formData = {
    'input[name="branchName"]': 'Banca Helper Test',
    'input[name="username"]': 'helperuser',
    'input[name="password"]': 'test123',
    'input[name="confirmPassword"]': 'test123',
    'input[name="location"]': 'Helper Location',
    'input[name="reference"]': 'Helper Reference'
  };

  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value);
  }

  // Select zone
  await page.click('button.tab:has-text("Configuración")');
  await page.waitForSelector('select[name="selectedZone"]');
  await page.selectOption('select[name="selectedZone"]', { index: 1 });

  // Submit
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/betting-pools') &&
                response.request().method() === 'POST'
  );

  await page.click('button.create-button:has-text("CREAR")');
  const response = await responsePromise;

  expect(response.status()).toBe(201);
});
```

---

## Best Practices

### 1. Always Use Explicit Waits
```javascript
// Good
await page.waitForSelector('input[name="username"]', { timeout: 10000 });
await page.fill('input[name="username"]', 'admin');

// Avoid
await page.fill('input[name="username"]', 'admin'); // Might fail if element not ready
```

### 2. Wait for API Responses
```javascript
// Good - Wait for specific API call
const responsePromise = page.waitForResponse(
  response => response.url().includes('/api/betting-pools')
);
await page.click('button[type="submit"]');
const response = await responsePromise;

// Bad - Generic timeout
await page.click('button[type="submit"]');
await page.waitForTimeout(3000); // Brittle and slow
```

### 3. Use Descriptive Test Names
```javascript
// Good
test('should create banca with all required fields filled', async ({ page }) => {
  // ...
});

// Bad
test('test1', async ({ page }) => {
  // ...
});
```

### 4. Clean Up After Tests
```javascript
test.afterEach(async ({ page }) => {
  // Logout or clear state
  await page.goto('http://localhost:3000/login');
});
```

### 5. Use Data-Testid When Possible
If you can modify the frontend code, add `data-testid` attributes:
```jsx
<button data-testid="create-banca-button">CREAR</button>
```

Then in tests:
```javascript
await page.click('[data-testid="create-banca-button"]');
```

### 6. Handle Dynamic Content
```javascript
// Wait for loading to finish
await page.waitForLoadState('networkidle');

// Or wait for specific element
await page.waitForSelector('table tbody tr:first-child');
```

### 7. Capture Screenshots on Failure
```javascript
test('should create banca', async ({ page }) => {
  try {
    // Test steps...
  } catch (error) {
    await page.screenshot({ path: `failure-${Date.now()}.png`, fullPage: true });
    throw error;
  }
});
```

### 8. Use Page Object Model for Complex Tests
```javascript
class CreateBancaPage {
  constructor(page) {
    this.page = page;
    this.branchNameInput = 'input[name="branchName"]';
    this.usernameInput = 'input[name="username"]';
    this.createButton = 'button.create-button:has-text("CREAR")';
  }

  async fillGeneralInfo(name, username, password) {
    await this.page.fill(this.branchNameInput, name);
    await this.page.fill(this.usernameInput, username);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="confirmPassword"]', password);
  }

  async submit() {
    await this.page.click(this.createButton);
  }
}

// Usage
test('create banca using page object', async ({ page }) => {
  const createBancaPage = new CreateBancaPage(page);
  await createBancaPage.fillGeneralInfo('Test', 'user123', 'pass123');
  await createBancaPage.submit();
});
```

---

## Debugging Tips

### 1. Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### 2. Use Playwright Inspector
```bash
npx playwright test --debug
```

### 3. Slow Down Test Execution
```javascript
test.use({ slowMo: 1000 }); // Wait 1 second between actions
```

### 4. Enable Trace
```javascript
test('my test', async ({ page, context }) => {
  await context.tracing.start({ screenshots: true, snapshots: true });
  // Test steps...
  await context.tracing.stop({ path: 'trace.zip' });
});
```

### 5. Console Logging
```javascript
// Log page console messages
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

// Log network requests
page.on('request', request => console.log('REQUEST:', request.url()));
page.on('response', response => console.log('RESPONSE:', response.url(), response.status()));
```

---

## Common Issues and Solutions

### Issue 1: Element Not Found
**Error:** `TimeoutError: page.waitForSelector: Timeout exceeded`

**Solution:**
- Verify selector is correct
- Check if element is in correct tab/modal
- Increase timeout
- Wait for page load/network idle

### Issue 2: Form Submission Fails
**Error:** API returns 400 Bad Request

**Solution:**
- Verify all required fields are filled
- Check field name mappings (branchName vs bettingPoolName)
- Ensure zone is selected in Configuration tab
- Check API endpoint expectations

### Issue 3: Login Redirect Issues
**Error:** Test gets stuck after login

**Solution:**
```javascript
// Use waitForURL instead of waitForNavigation
await page.waitForURL('**/dashboard', { timeout: 10000 });
```

### Issue 4: Flaky Tests
**Solution:**
- Use explicit waits instead of timeouts
- Wait for API responses
- Use networkidle load state
- Add retry logic for critical tests

---

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test tests/create-banca-test.spec.js
```

### Run in Headed Mode
```bash
npx playwright test --headed
```

### Run with UI Mode
```bash
npx playwright test --ui
```

### Generate HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## Configuration

### playwright.config.js
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## API Endpoint Reference

### Betting Pools (Bancas)
- `GET /api/betting-pools` - List all (paginated)
- `POST /api/betting-pools` - Create new
- `GET /api/betting-pools/{id}` - Get by ID
- `PUT /api/betting-pools/{id}` - Update
- `DELETE /api/betting-pools/{id}` - Delete (soft)

### Response Format (List)
```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 4,
  "totalPages": 1
}
```

### Response Format (Create)
```json
{
  "bettingPoolId": 5,
  "bettingPoolName": "Test Banca",
  "bettingPoolCode": "LAN-0005",
  "zoneId": 1,
  "username": "testuser",
  "location": "Test Location",
  "reference": "Test Reference",
  "isActive": true
}
```

---

## Frontend-Backend Field Mapping

| Frontend Field | API Field | Type | Required |
|----------------|-----------|------|----------|
| branchName | bettingPoolName | string | Yes |
| branchCode | bettingPoolCode | string | Auto-generated |
| username | username | string | Yes |
| password | password | string | Yes |
| location | location | string | Yes |
| reference | reference | string | Yes |
| comment | comment | string | No |
| selectedZone | zoneId | int | Yes |
| isActive | isActive | bool | Default: true |

**Note:** Only the fields listed above are currently sent to the API. Other form fields (commissionRate, creditLimit, etc.) are kept in the UI for future implementation but not sent to the backend yet.

---

**Last Updated:** 2025-10-28
**Frontend Version:** V1
**Base URL:** http://localhost:3000
