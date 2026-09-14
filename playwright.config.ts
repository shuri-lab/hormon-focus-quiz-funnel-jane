import { defineConfig, devices } from '@playwright/test';

/* Uses the Chrome already installed on the machine rather than downloading a
   browser, so `npm install` stays small. On a box without Chrome — CI, a fresh
   container — run `npx playwright install chromium` and set
   PLAYWRIGHT_CHROMIUM_FALLBACK=1. */
const browser = process.env.PLAYWRIGHT_CHROMIUM_FALLBACK ? {} : { channel: 'chrome' as const };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4317',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'phone-320', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 320, height: 568 } } },
    { name: 'phone-390', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 390, height: 844 } } },
    { name: 'phone-430', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 430, height: 932 } } },
    { name: 'tablet-768', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], ...browser, viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4317 --strictPort',
    url: 'http://localhost:4317',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
