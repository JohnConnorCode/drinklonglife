import { test, expect } from '@playwright/test';

test('homepage has Header and Footer', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.waitForLoadState('networkidle');

  // Check for Header
  const header = page.locator('header');
  await expect(header).toBeVisible();

  // Check for Footer
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();

  console.log('✓ Homepage has Header and Footer');
});

test('Studio does NOT have Header and Footer', async ({ page }) => {
  await page.goto('http://localhost:8080/studio');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: 'test-results/studio-layout-check.png',
    fullPage: false
  });

  // Check that Header is NOT present
  const header = page.locator('header');
  const headerCount = await header.count();

  // Check that Footer is NOT present
  const footer = page.locator('footer');
  const footerCount = await footer.count();

  console.log(`Header count: ${headerCount}, Footer count: ${footerCount}`);

  expect(headerCount).toBe(0);
  expect(footerCount).toBe(0);

  console.log('✓ Studio does NOT have Header and Footer');
});
