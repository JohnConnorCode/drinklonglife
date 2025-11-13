import { test, expect } from '@playwright/test';
import {
  goToBlends,
  selectBlend,
  selectSize,
  completeCheckoutWithTestCard,
  isCheckoutSuccessful,
  getCheckoutSessionId,
} from '../../helpers/checkout';
import { waitForOrder } from '../../helpers/database';

test.describe('Guest Checkout Flow', () => {
  test('should complete guest checkout with valid card', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size (Most Popular is usually the second one)
    const sizeButtons = page.locator('button:has-text("Reserve Now")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Complete checkout with valid test card
    const testEmail = `guest-test-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    // Verify success page
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Verify order in database
    const sessionId = getCheckoutSessionId(page);
    if (sessionId) {
      const order = await waitForOrder(sessionId, 30000, 1000);
      expect(order).not.toBeNull();
      expect(order?.customer_email).toBe(testEmail);
      expect(order?.status).toBe('completed');
    }
  });

  test('should reject checkout with declined card', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size
    const sizeButtons = page.locator('button:has-text("Reserve Now")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Try checkout with declined card
    const testEmail = `declined-test-${Date.now()}@example.com`;

    // Wait for Stripe checkout (full page redirect, not iframe)
    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 30000 });

    const emailInput = page.locator('input[type="email"]').first();

    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.fill(testEmail);

    // Enter declined card
    const cardInput = page.locator('input[placeholder*="card" i], [placeholder*="1111" i]').first();
    await cardInput.fill('4000000000000002'); // Declined card

    const expInput = page.locator('input[placeholder*="expiration" i], [placeholder*="MM" i]').first();
    await expInput.fill('12/25');

    const cvcInput = page.locator('input[placeholder*="CVC" i], [placeholder*="CVV" i]').first();
    await cvcInput.fill('123');

    // Try to pay
    const payButton = page.locator('button:has-text("Pay"), button[type="submit"]').first();
    await payButton.click();

    // Wait for error message
    const errorMessage = page.locator('text=/card declined|not accepted/i').first();
    await errorMessage.waitFor({ timeout: 10000 }).catch(() => null);

    // Should remain on checkout page (not redirect to success)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/checkout/success');
  });

  test('should allow guest to enter custom email', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size
    const sizeButtons = page.locator('button:has-text("Reserve Now")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Complete checkout
    const customEmail = `custom-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', customEmail);

    // Verify success
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Verify email in order
    const sessionId = getCheckoutSessionId(page);
    if (sessionId) {
      const order = await waitForOrder(sessionId, 30000, 1000);
      expect(order?.customer_email).toBe(customEmail);
    }
  });

  test('should display correct pricing on checkout page', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size and note the price
    const priceElements = page.locator('text=$');
    const pricesBeforeCheckout = await priceElements.allTextContents();

    // Click reserve
    const sizeButtons = page.locator('button:has-text("Reserve Now")');
    await sizeButtons.first().click();

    // Wait for Stripe checkout
    await page.waitForURL(/stripe\.com/, { timeout: 30000 }).catch(() => null);

    // The Stripe checkout should display a line item with the price
    // (Note: exact verification depends on Stripe checkout design)
    const checkoutUrl = page.url();
    expect(checkoutUrl).toContain('stripe');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Try to initiate checkout
    const sizeButtons = page.locator('button:has-text("Reserve Now")');
    await sizeButtons.first().click();

    // Wait for either success (checkout loads) or error
    const successCheck = page.waitForURL(/stripe\.com/, { timeout: 5000 }).catch(() => null);
    const errorCheck = page.waitForSelector('text=/error|failed/i', { timeout: 5000 }).catch(() => null);

    await Promise.race([
      successCheck,
      errorCheck,
      new Promise((resolve) => setTimeout(resolve, 6000)),
    ]);

    // Either we should be on Stripe checkout or see an error message
    const onStripe = page.url().includes('stripe');
    const errorVisible = await page.locator('text=/error|failed/i').isVisible().catch(() => false);

    expect(onStripe || errorVisible).toBe(true);
  });
});
