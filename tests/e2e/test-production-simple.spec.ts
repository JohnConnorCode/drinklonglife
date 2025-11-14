import { test, expect } from '@playwright/test';

test('Does production checkout redirect to Stripe?', async ({ page }) => {
  console.log('Going to https://drinklonglife.com...');
  await page.goto('https://drinklonglife.com');
  await page.waitForLoadState('networkidle');

  // Find and click Reserve Now or Subscribe button
  const buttons = await page.locator('button, a').all();
  let clicked = false;

  for (const button of buttons) {
    const text = await button.textContent().catch(() => '');
    if (text && (text.includes('Reserve') || text.includes('Subscribe') || text.includes('Buy'))) {
      console.log(`Found button: ${text}`);
      await button.click().catch(() => {});
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.log('NO BUTTON FOUND');
    throw new Error('Could not find checkout button');
  }

  // Wait a bit for any redirects
  await page.waitForTimeout(5000);

  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);

  if (finalUrl.includes('stripe.com') || finalUrl.includes('checkout.stripe.com')) {
    console.log('YES - Redirected to Stripe!');
    expect(finalUrl).toContain('stripe.com');
  } else {
    console.log('NO - Did NOT redirect to Stripe');
    console.log('Current page:', finalUrl);

    // Take screenshot
    await page.screenshot({ path: '/tmp/checkout-failed.png' });
    throw new Error('Did not redirect to Stripe');
  }
});
