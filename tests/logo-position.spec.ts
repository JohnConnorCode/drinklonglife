import { test, expect } from '@playwright/test';

test('verify logo image position', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: 'test-results/logo-position.png',
    fullPage: false
  });

  const logo = page.locator('img[alt="Long Life Logo"]');
  await expect(logo.first()).toBeVisible();
});
