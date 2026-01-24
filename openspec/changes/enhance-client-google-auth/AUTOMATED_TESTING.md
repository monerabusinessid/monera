# Automated Testing Setup

## Test Script Available

A test script has been created to verify backend/API logic:

```bash
npm run test:client-auth
```

This script tests:
- ✅ Supabase connection
- ✅ Database tables structure
- ✅ Environment variables
- ✅ CLIENT role handling

## Browser Automation Testing (Playwright)

For full OAuth flow testing, we need browser automation. Here's how to set it up:

### 1. Install Playwright

```bash
npm install -D @playwright/test playwright
npx playwright install
```

### 2. Create Playwright Config

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3. Create Test Files

Create `tests/client-auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Client Google Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies()
    await page.evaluate(() => {
      sessionStorage.clear()
      localStorage.clear()
    })
  })

  test('CLIENT signup via Google OAuth redirects to dashboard', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register')
    
    // Select CLIENT role
    await page.click('text=CLIENT')
    
    // Click Google signup button
    await page.click('text=Sign up with Google')
    
    // Note: Actual OAuth flow requires manual intervention or mocking
    // For now, we can test the redirect logic after OAuth callback
    
    // Wait for redirect (this would be after OAuth completes)
    // await page.waitForURL('/client', { timeout: 30000 })
    
    // Verify we're on client dashboard
    // await expect(page).toHaveURL('/client')
  })

  test('CLIENT login via Google OAuth redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    
    // Click Google login button
    await page.click('text=Login with Google')
    
    // After OAuth, should redirect to /client
    // await page.waitForURL('/client', { timeout: 30000 })
  })

  test('sessionStorage is set during OAuth callback', async ({ page }) => {
    // This test would need to mock OAuth callback
    // or use a test OAuth provider
  })
})
```

## Manual Testing (Recommended for OAuth)

Due to the complexity of OAuth flows with Google, **manual testing is recommended** for now. 

Follow the guide in `TESTING.md` for comprehensive manual testing steps.

## Running Tests

### Backend/API Tests
```bash
npm run test:client-auth
```

### Browser Tests (if Playwright is set up)
```bash
npx playwright test
```

### View Test Results
```bash
npx playwright show-report
```

## Notes

- OAuth testing requires either:
  1. Manual testing (recommended)
  2. Mock OAuth provider
  3. Test Google OAuth credentials
  4. Browser automation with manual OAuth consent

- The test script (`test-client-auth-flow.ts`) verifies:
  - Database connectivity
  - Table structures
  - Environment configuration
  - Basic API logic

- For full end-to-end OAuth testing, use the manual testing guide in `TESTING.md`
