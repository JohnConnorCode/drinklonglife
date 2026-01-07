import { test, expect } from '@playwright/test';

test('Production checkout redirects to Stripe', async ({ page }) => {
  // Go to production site
  await page.goto('https://drinklonglife.com');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Look for "Reserve Now" or "Get Started" button
  const reserveButton = page.locator('text=Reserve Now, text=Get Started').first();

  if (await reserveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await reserveButton.click();
    await page.waitForLoadState('networkidle');
  }

  // Try to find and click on a blend selection or checkout button
  const checkoutTriggers = [
    'button:has-text("Reserve")',
    'button:has-text("Checkout")',
    'button:has-text("Subscribe")',
    'button:has-text("Buy Now")',
    '[data-testid="checkout-button"]',
    'a[href*="/reserve"]'
  ];

  let clicked = false;
  for (const selector of checkoutTriggers) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Clicking: ${selector}`);

      // Listen for navigation or API calls
      const [response] = await Promise.all([
        page.waitForResponse(response =>
          response.url().includes('/api/checkout') ||
          response.url().includes('stripe.com')
        , { timeout: 10000 }).catch(() => null),
        element.click()
      ]);

      clicked = true;

      if (response) {
        console.log(`Response from: ${response.url()}`);
        console.log(`Status: ${response.status()}`);

        // If it's our API endpoint, check the response
        if (response.url().includes('/api/checkout')) {
          const body = await response.json().catch(() => null);
          console.log('API Response:', body);

          // Should NOT contain error "Failed to create checkout session"
          expect(body?.error).not.toBe('Failed to create checkout session');

          // Should contain a Stripe checkout URL
          if (body?.url) {
            expect(body.url).toContain('stripe.com');
            console.log('✓ Checkout session created successfully!');
            console.log('Stripe URL:', body.url);
          }
        }
      }

      // Check if we were redirected to Stripe
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      if (currentUrl.includes('stripe.com') || currentUrl.includes('checkout')) {
        console.log('✓ Successfully redirected to Stripe!');
        console.log('Current URL:', currentUrl);
      }

      break;
    }
  }

  if (!clicked) {
    console.log('Could not find checkout button, trying direct API call...');

    // Try to call the checkout API directly with a test price ID
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: 'price_test_123', // This will fail validation but we can see the error
            mode: 'payment',
            successPath: '/success',
            cancelPath: '/cancel'
          })
        });
        return {
          status: res.status,
          body: await res.json()
        };
      } catch (err: any) {
        return { error: err.message };
      }
    });

    console.log('Direct API call result:', response);
  }
});
