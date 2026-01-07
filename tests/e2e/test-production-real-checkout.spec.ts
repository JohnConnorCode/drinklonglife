import { test, expect } from '@playwright/test';

test('Production checkout - real flow', async ({ page }) => {
  console.log('Step 1: Going to production site...');
  await page.goto('https://drinklonglife.com');
  await page.waitForLoadState('networkidle');

  console.log('Step 2: Navigating to blends page...');
  await page.goto('https://drinklonglife.com/blends');
  await page.waitForLoadState('networkidle');

  console.log('Step 3: Clicking on first blend...');
  // Click on any blend card to go to its detail page
  const blendCard = page.locator('a[href^="/blends/"]').first();
  const blendUrl = await blendCard.getAttribute('href');
  console.log(`Found blend: ${blendUrl}`);
  await blendCard.click();
  await page.waitForLoadState('networkidle');

  console.log(`Step 4: On blend page: ${page.url()}`);

  // Wait for the Reserve Now button to be visible
  console.log('Step 5: Looking for "Reserve Now" button...');
  const reserveButton = page.locator('button:has-text("Reserve Now")').first();

  await reserveButton.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Found "Reserve Now" button!');

  // Click it and wait for redirect
  console.log('Step 6: Clicking "Reserve Now"...');
  await reserveButton.click();

  // Wait up to 10 seconds for redirect to Stripe
  console.log('Step 7: Waiting for redirect to Stripe...');
  await page.waitForTimeout(10000);

  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);

  if (finalUrl.includes('stripe.com') || finalUrl.includes('checkout.stripe.com')) {
    console.log('✅ SUCCESS - Redirected to Stripe!');
    expect(finalUrl).toContain('stripe.com');
  } else {
    console.log('❌ FAILED - Did NOT redirect to Stripe');
    console.log('Current page:', finalUrl);

    // Check for error messages on page
    const pageText = await page.textContent('body');
    if (pageText?.includes('Failed to create checkout session')) {
      console.log('ERROR MESSAGE: "Failed to create checkout session"');
    }

    // Take screenshot
    await page.screenshot({ path: '/tmp/checkout-real-failed.png' });
    throw new Error('Did not redirect to Stripe');
  }
});
