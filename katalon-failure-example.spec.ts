import { test, expect } from '@playwright/test';

/**
 * Katalian Bank – INTENTIONAL FAILURE example for Katalon True demos.
 *
 * Same flow as katalian-banking-login.spec.ts, but the final validation expects
 * a Net Liquidity amount that will never be shown, so the test fails on that step.
 * Use it to demo failure reporting in Katalon True: the failed step in TEST STEPS,
 * the error message, and the screenshot, video and trace attachments.
 *
 * Do not wrap this in test.fail(): that would report it as an expected failure (passed).
 */

const LOGIN_URL = process.env.KATALIAN_LOGIN_URL ?? 'https://katalian-banking.vercel.app/login';
const USER_ID = process.env.KATALIAN_USER_ID ?? 'bankinguser123';
const PASSWORD = process.env.KATALIAN_PASSWORD ?? 'notapassword@123';

// Matches a displayed money amount such as $1,234.56, £12,000, €0.00 or USD 1,234.
const AMOUNT_PATTERN = /(?:[$£€¥]|USD|GBP|EUR)\s?-?\d[\d,]*(?:\.\d+)?/;

// An amount the dashboard will never display, which guarantees the validation fails.
const IMPOSSIBLE_AMOUNT = '$999,999,999,999.99';

test.describe('Katalian Bank - Failure Example', () => {
  test('katalon-failure-example', async ({ page }) => {
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

    await test.step('Verify Net Liquidity shows the expected amount (intentional failure)', async () => {
      const label = page.getByText(/net liquidity/i).first();
      await expect(label).toBeVisible({ timeout: 15_000 });

      // Innermost element holding both the label and a real amount (the card/tile),
      // so the failure message shows the actual value next to the expected one.
      const tile = page
        .locator('*', { hasText: /net liquidity/i })
        .filter({ hasText: AMOUNT_PATTERN })
        .last();

      await expect(
        tile,
        `Intentional failure: expected Net Liquidity to be ${IMPOSSIBLE_AMOUNT}`,
      ).toContainText(IMPOSSIBLE_AMOUNT, { timeout: 5_000 });
    });
  });
});
