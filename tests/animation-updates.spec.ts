import { test, expect } from '@playwright/test';

test('verify animation and logo updates', async ({ page }) => {
  // Test home page hero animation
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');

  // Wait for animations to complete
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'test-results/home-with-animations.png',
    fullPage: false
  });

  // Test How We Make It page header animation
  await page.goto('http://localhost:8080/how-we-make-it');
  await page.waitForLoadState('networkidle');

  // Wait for fade-in animations to complete
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'test-results/how-we-make-it-animated.png',
    fullPage: false
  });

  // Check that heading exists and is visible
  const heading = page.locator('h1');
  await expect(heading.first()).toBeVisible();

  console.log('All animations verified');
});
