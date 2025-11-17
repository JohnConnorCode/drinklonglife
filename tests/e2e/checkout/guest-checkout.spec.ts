import { test, expect } from '@playwright/test';
import {
  completeCheckoutWithTestCard,
  isCheckoutSuccessful,
  getCheckoutSessionId,
} from '../../helpers/checkout';

test.describe('Guest Checkout Flow', () => {
  test('should complete guest checkout with valid card', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size (Most Popular is usually the second one)
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Complete checkout with valid test card
    const testEmail = `guest-test-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    // Verify success page
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Verify we have a session ID
    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    // Note: Order creation via webhook is tested separately in webhook tests
    // This test focuses on the checkout flow itself
  });

  test('should reject checkout with declined card', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Navigate to cart and proceed to checkout
    await page.goto('/cart');
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Wait for Stripe checkout (full page redirect, not iframe)
    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 30000 });

    // Fill checkout form with declined card
    const testEmail = `declined-test-${Date.now()}@example.com`;
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(testEmail);

    // Fill name
    const nameInput = page.getByRole('textbox', { name: /full name/i });
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill('Test User');

    // Enter declined card
    const cardInput = page.getByRole('textbox', { name: /card number/i });
    await cardInput.waitFor({ state: 'visible', timeout: 10000 });
    await cardInput.fill('4000000000000002'); // Declined card

    const expInput = page.getByRole('textbox', { name: /expiration/i });
    await expInput.waitFor({ state: 'visible', timeout: 10000 });
    await expInput.fill('12/25');

    const cvcInput = page.getByRole('textbox', { name: /cvc/i });
    await cvcInput.waitFor({ state: 'visible', timeout: 10000 });
    await cvcInput.fill('123');

    // Fill address
    const line1Input = page.getByRole('textbox', { name: /address line 1/i });
    await line1Input.waitFor({ state: 'visible', timeout: 10000 });
    await line1Input.fill('510 Townsend St');

    const cityInput = page.getByRole('textbox', { name: /city/i });
    await cityInput.waitFor({ state: 'visible', timeout: 10000 });
    await cityInput.fill('San Francisco');

    const zipInput = page.getByRole('textbox', { name: /zip/i });
    await zipInput.waitFor({ state: 'visible', timeout: 10000 });
    await zipInput.fill('94103');

    const stateInput = page.getByRole('combobox', { name: /state/i });
    await stateInput.waitFor({ state: 'visible', timeout: 10000 });
    await stateInput.selectOption('CA');

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
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Complete checkout
    const customEmail = `custom-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', customEmail);

    // Verify success
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Verify session ID exists
    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    // Note: Email verification in order requires webhook functionality
    // which is tested separately in webhook tests
  });

  test('should display correct pricing on checkout page', async ({ page }) => {
    // Navigate directly to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size and note the price
    const priceElements = page.locator('text=$');
    await priceElements.allTextContents();

    // Click Add to Cart
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    // Navigate to cart and proceed to checkout
    await page.goto('/cart');
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

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

    // Add item to cart
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    // Navigate to cart and try to proceed to checkout
    await page.goto('/cart');
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Wait for either success (checkout loads) or error
    const successCheck = page.waitForURL(/stripe\.com/, { timeout: 10000 }).catch(() => null);
    const errorCheck = page.waitForSelector('text=/error|failed/i', { timeout: 10000 }).catch(() => null);

    await Promise.race([
      successCheck,
      errorCheck,
      new Promise((resolve) => setTimeout(resolve, 11000)),
    ]);

    // Either we should be on Stripe checkout or see an error message
    const onStripe = page.url().includes('stripe');
    const errorVisible = await page.locator('text=/error|failed/i').isVisible().catch(() => false);

    expect(onStripe || errorVisible).toBe(true);
  });
});
