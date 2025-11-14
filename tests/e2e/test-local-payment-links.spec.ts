import { test, expect } from '@playwright/test';

test('Local checkout with Payment Links - Yellow Bomb Shot', async ({ page }) => {
  console.log('Testing Yellow Bomb checkout on localhost...');

  // Go to local Yellow Bomb page
  await page.goto('http://localhost:3000/blends/yellow-bomb');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('Page loaded');

  // Find and click the first "Reserve Now" button (Shot - $5)
  const reserveButtons = page.locator('button:has-text("Reserve Now")');
  const firstButton = reserveButtons.first();

  console.log('Found Reserve button');

  // Click the button
  await firstButton.click();
  console.log('Clicked Reserve Now');

  // Wait for redirect to Stripe Payment Link
  await page.waitForURL(/buy\.stripe\.com/, { timeout: 10000 });
  console.log('Redirected to Stripe Payment Link!');

  // Verify we're on a Stripe payment page
  const url = page.url();
  expect(url).toContain('buy.stripe.com');
  console.log(`On Stripe checkout: ${url}`);

  // Check for payment form elements
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 5000 });
  console.log('Payment form loaded');

  console.log('\nSUCCESS! Local checkout is working with Payment Links!');
});
