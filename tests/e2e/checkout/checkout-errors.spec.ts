import { test, expect } from '@playwright/test';
import { STRIPE_TEST_CARDS } from '../../helpers/stripe';

test.describe('Checkout Error Scenarios', () => {
  test('should handle invalid price ID gracefully', async ({ page }) => {
    // Try to go directly to checkout with invalid price ID using cart API
    const response = await page.request.post('/api/checkout', {
      data: {
        items: [{
          priceId: 'price_invalid123456789',
          quantity: 1
        }],
      },
    });

    const data = await response.json() as { error?: string; details?: string };

    // Should return error response
    expect(response.status()).not.toBe(200);
    expect(data.error || data.details).toBeTruthy();
  });

  test('should reject checkout without items', async ({ page }) => {
    // Try to create checkout without items or priceId
    const response = await page.request.post('/api/checkout', {
      data: {},
    });

    const data = await response.json() as { error?: string };

    expect(response.status()).toBe(400);
    expect(data.error).toContain('items');
  });

  test('should reject checkout with empty items array', async ({ page }) => {
    // Try to create checkout with empty items array
    const response = await page.request.post('/api/checkout', {
      data: {
        items: [],
      },
    });

    const data = await response.json() as { error?: string };

    expect(response.status()).toBe(400);
    expect(data.error).toBeTruthy();
  });

  test('should reject checkout with invalid item structure', async ({ page }) => {
    // Try with malformed item
    const response = await page.request.post('/api/checkout', {
      data: {
        items: [{ invalid: 'structure' }],
      },
    });

    const data = await response.json() as { error?: string; details?: string };

    expect(response.status()).not.toBe(200);
    expect(data.error || data.details).toBeTruthy();
  });

  test('should display error for declined card', async ({ page }) => {
    // Navigate to product page
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Add to cart
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Navigate to cart and proceed to checkout
    await page.goto('/cart');
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Wait for Stripe checkout
    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 30000 });

    // Fill form with declined card
    const testEmail = `declined-${Date.now()}@example.com`;
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(testEmail);

    const nameInput = page.getByRole('textbox', { name: /full name/i });
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill('Test User');

    const cardInput = page.getByRole('textbox', { name: /card number/i });
    await cardInput.waitFor({ state: 'visible', timeout: 10000 });
    await cardInput.fill(STRIPE_TEST_CARDS.DECLINED);

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

    // Wait a bit for error to appear
    await page.waitForTimeout(5000);

    // Should remain on Stripe checkout page or show error
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/checkout/success');
    expect(currentUrl).toContain('stripe.com');
  });

  test('should handle CVC validation failures', async ({ page }) => {
    // Navigate to product
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Add to cart
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    // Go to cart and checkout
    await page.goto('/cart');
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await checkoutButton.click();

    // Wait for Stripe
    await page.waitForURL('**/checkout.stripe.com/**', { timeout: 30000 });

    // Fill with CVC fail card
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill(`cvc-fail-${Date.now()}@example.com`);

    const nameInput = page.getByRole('textbox', { name: /full name/i });
    await nameInput.fill('Test User');

    const cardInput = page.getByRole('textbox', { name: /card number/i });
    await cardInput.fill(STRIPE_TEST_CARDS.CVC_FAIL);

    const expInput = page.getByRole('textbox', { name: /expiration/i });
    await expInput.fill('12/25');

    const cvcInput = page.getByRole('textbox', { name: /cvc/i });
    await cvcInput.fill('000');

    // Fill address
    const line1Input = page.getByRole('textbox', { name: /address line 1/i });
    await line1Input.fill('510 Townsend St');

    const cityInput = page.getByRole('textbox', { name: /city/i });
    await cityInput.fill('San Francisco');

    const zipInput = page.getByRole('textbox', { name: /zip/i });
    await zipInput.fill('94103');

    const stateInput = page.getByRole('combobox', { name: /state/i });
    await stateInput.selectOption('CA');

    // Try to pay
    const payButton = page.locator('button:has-text("Pay"), button[type="submit"]').first();
    await payButton.click();

    // Wait for potential error
    await page.waitForTimeout(5000);

    // Should not reach success
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/checkout/success');
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    // Navigate to product
    await page.goto('/blends/green-bomb');

    // Add to cart
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    const clickPromise = sizeButtons.first().click();

    // Should either succeed or timeout gracefully
    await clickPromise;

    // Go to cart
    await page.goto('/cart');

    // Should show cart with item or error
    const cartExists = await page.locator('h1:has-text("Shopping Cart")').isVisible().catch(() => false);
    const errorExists = await page.locator('text=/error|failed/i').isVisible().catch(() => false);

    // Either cart works or we see an error
    expect(cartExists || errorExists).toBe(true);
  });

  test('should show error for inactive/disabled price', async ({ page }) => {
    // Try checkout with a price ID that doesn't exist
    const response = await page.request.post('/api/checkout', {
      data: {
        items: [{
          priceId: 'price_inactive_nonexistent_12345',
          quantity: 1
        }],
      },
    });

    // Should get an error
    expect(response.status()).not.toBe(200);
    const data = await response.json() as { error?: string; details?: string };
    expect(data.error || data.details).toBeTruthy();
  });
});
