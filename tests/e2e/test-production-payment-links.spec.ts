import { test, expect } from '@playwright/test';

test('Production checkout with Payment Links - Yellow Bomb Shot', async ({ page }) => {
  console.log('🧪 Testing Yellow Bomb checkout on production...');

  // Go to production Yellow Bomb page
  await page.goto('https://drinklonglife.com/blends/yellow-bomb');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('✓ Page loaded');

  // Find and click the first "Reserve Now" button (Shot - $5)
  const reserveButtons = page.locator('button:has-text("Reserve Now")');
  const firstButton = reserveButtons.first();

  console.log('✓ Found Reserve button');

  // Click the button
  await firstButton.click();
  console.log('✓ Clicked Reserve Now');

  // Wait for redirect to Stripe Payment Link
  await page.waitForURL(/buy\.stripe\.com/, { timeout: 10000 });
  console.log('✓ Redirected to Stripe Payment Link!');

  // Verify we're on a Stripe payment page
  const url = page.url();
  expect(url).toContain('buy.stripe.com');
  console.log(`✓ On Stripe checkout: ${url}`);

  // Check for payment form elements
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toBeVisible({ timeout: 5000 });
  console.log('✓ Payment form loaded');

  console.log('\n🎉 SUCCESS! Production checkout is working with Payment Links!');
});

test('Production checkout subscription - Yellow Bomb Shot Monthly', async ({ page }) => {
  console.log('🧪 Testing Yellow Bomb subscription checkout...');

  // Go to production Yellow Bomb page
  await page.goto('https://drinklonglife.com/blends/yellow-bomb');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Click "Monthly" toggle
  const monthlyButton = page.locator('button:has-text("Monthly")').first();
  await monthlyButton.click();
  console.log('✓ Switched to Monthly subscription');

  // Click Reserve Now
  const reserveButtons = page.locator('button:has-text("Reserve Now")');
  await reserveButtons.first().click();
  console.log('✓ Clicked Reserve Now');

  // Wait for redirect to Stripe Payment Link
  await page.waitForURL(/buy\.stripe\.com/, { timeout: 10000 });
  console.log('✓ Redirected to Stripe subscription Payment Link!');

  // Verify URL
  const url = page.url();
  expect(url).toContain('buy.stripe.com');
  console.log(`✓ On Stripe checkout: ${url}`);

  console.log('\n🎉 SUCCESS! Subscription checkout working!');
});
