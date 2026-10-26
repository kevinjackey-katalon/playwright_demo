import { test, expect } from '@playwright/test';

/**
 * Katalian Bank – login and dashboard smoke test.
 *
 * Katalon True compatibility:
 *  - Tests are wrapped in a describe block, so Katalon parses this as a runnable test suite.
 *  - The browser comes from the `page` fixture (no chromium.launch()).
 *  - test.step() calls show up as named steps in Katalon's TEST STEPS tab.
 *
 * Credentials can be overridden with environment variables so they stay out of CI logs.
 */

const LOGIN_URL = process.env.KATALIAN_LOGIN_URL ?? 'https://katalian-banking.vercel.app/login';
const USER_ID = process.env.KATALIAN_USER_ID ?? 'bankinguser123';
const PASSWORD = process.env.KATALIAN_PASSWORD ?? 'notapassword@123';

// Matches a displayed money amount such as $1,234.56, £12,000, €0.00 or USD 1,234.
const AMOUNT_PATTERN = /(?:[$£€¥]|USD|GBP|EUR)\s?-?\d[\d,]*(?:\.\d+)?/;

test.describe('Katalian Bank - Login', () => {
  test('valid user can log in and sees a Net Liquidity amount', async ({ page }) => {
    await test.step('Open the login page', async () => {
      await page.goto(LOGIN_URL);
    });

    await test.step('Enter user ID and password', async () => {
      await page.locator('#username').fill(USER_ID);
      await page.locator('#password').fill(PASSWORD);
    });

    await test.step('Submit the login form', async () => {
      await page.getByRole('button', { name: 'Enter Vault Access' }).click();
    });

    await test.step('Verify the dashboard loaded', async () => {
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Portfolio' })).toBeVisible();
    });

    await test.step('Verify a Net Liquidity amount is displayed', async () => {
      const label = page.getByText(/net liquidity/i).first();
      await expect(label).toBeVisible({ timeout: 15_000 });

      // Ancestors of the label come first in document order, so .last() is the
      // innermost element that holds both the label and an amount (the card/tile).
      const tile = page
        .locator('*', { hasText: /net liquidity/i })
        .filter({ hasText: AMOUNT_PATTERN })
        .last();

      await expect(tile).toContainText(AMOUNT_PATTERN);

      const amount = (await tile.innerText()).match(AMOUNT_PATTERN)?.[0];
      test.info().annotations.push({ type: 'Net Liquidity', description: amount ?? 'not captured' });
    });
  });
});
