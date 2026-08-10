import { test, expect } from '@playwright/test';

test('Katalian Banking - Login', async ({ page }) => {
  // 1. Navigate to the login page
  await page.goto('https://katalian-banking.vercel.app/login');

  // 2. Perform login (selectors confirmed against the live app)
  await page.locator('#username').fill('bankinguser123');
  await page.locator('#password').fill('notapassword@123');
  await page.getByRole('button', { name: 'Enter Vault Access' }).click();

  // 3. Assert login succeeded — redirects to /dashboard with account nav
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Portfolio' })).toBeVisible();
});
