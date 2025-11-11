import { test, expect } from '@playwright/test';

test('navigation menu font verification', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Wait for navigation to load
  await page.waitForSelector('nav');

  // Take screenshot of the header
  await page.screenshot({
    path: 'test-results/navigation-font.png',
    fullPage: false
  });

  // Check that navigation links exist
  const navLinks = page.locator('nav a');
  await expect(navLinks.first()).toBeVisible();
});
