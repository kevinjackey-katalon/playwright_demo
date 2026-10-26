import { defineConfig, devices } from '@playwright/test';
import { getGlobalSetupPath } from '@katalon/playwright-reporter';

/**
 * Playwright config for the Katalon True interoperability demo.
 *
 * - Must stay at the repo root so Katalon True can detect it (Approach 1).
 * - The `projects` below appear in Katalon's PROFILE column when a run is
 *   triggered from the platform (platform runs use Chrome only).
 * - Results upload to Katalon True when KATALON_API_KEY is set (Approach 2):
 *     KATALON_API_KEY=... KATALON_PROJECT_ID=... npx playwright test
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/node_modules/**'],
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  globalSetup: getGlobalSetupPath(),

  use: {
    baseURL: 'https://katalian-banking.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      '@katalon/playwright-reporter',
      {
        outputDir: './reports',
        ...(process.env.KATALON_API_KEY && {
          platform: {
            apiKey: process.env.KATALON_API_KEY,
            projectId: process.env.KATALON_PROJECT_ID,
            baseUrl: process.env.KATALON_BASE_URL,
            authUrl: process.env.KATALON_AUTH_URL,
          },
        }),
      },
    ],
  ],

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
