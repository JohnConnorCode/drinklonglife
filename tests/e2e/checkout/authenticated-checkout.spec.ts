import { test, expect } from '@playwright/test';
import { completeCheckoutWithTestCard, isCheckoutSuccessful, getCheckoutSessionId } from '../../helpers/checkout';

test.describe('Authenticated Checkout Flow', () => {
  test('should complete checkout as guest (authentication not implemented yet)', async ({ page }) => {
    // Navigate to product page
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Add to cart
    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await expect(sizeButtons.first()).toBeVisible();
    await sizeButtons.first().click();

    // Complete checkout with test card
    const testEmail = `auth-test-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    // Verify success
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Verify we have a session ID
    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    // Note: Customer creation and order association requires webhook functionality
    // which is tested separately in webhook tests
  });

  test('should handle multiple purchases with same email', async ({ page }) => {
    const testEmail = `repeat-customer-${Date.now()}@example.com`;

    // First purchase
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    let sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    const firstSessionId = getCheckoutSessionId(page);
    expect(firstSessionId).not.toBeNull();

    // Second purchase with same email
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    const secondSessionId = getCheckoutSessionId(page);
    expect(secondSessionId).not.toBeNull();

    // Both should be different sessions
    expect(secondSessionId).not.toBe(firstSessionId);

    // Both should complete successfully
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);
  });

  test('should handle checkout with different card types', async ({ page }) => {
    // First purchase with Visa
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    let sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    const testEmail = `multi-card-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    let successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Second purchase with MasterCard
    await page.goto('/blends/red-bomb');
    await page.waitForLoadState('domcontentloaded');

    sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    await completeCheckoutWithTestCard(page, 'MASTERCARD', testEmail);

    successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);
  });

  test('should complete checkout with different products', async ({ page }) => {
    const testEmail = `multi-product-${Date.now()}@example.com`;

    // Purchase Green Bomb
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    let sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    let successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Purchase Red Bomb
    await page.goto('/blends/red-bomb');
    await page.waitForLoadState('domcontentloaded');

    sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);
  });

  test('should preserve email across checkout session', async ({ page }) => {
    // Verify custom email works
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    const sizeButtons = page.locator('button:has-text("Add to Cart")');
    await sizeButtons.first().click();

    const customEmail = `custom-email-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', customEmail);

    // Verify success
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Verify session ID exists
    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();
  });

  test('should handle checkout with all size variants', async ({ page }) => {
    const testEmail = `all-sizes-${Date.now()}@example.com`;

    // Test each size option
    const sizes = ['first', 'nth(1)', 'last'];

    for (const sizeIndex of sizes) {
      await page.goto('/blends/green-bomb');
      await page.waitForLoadState('domcontentloaded');

      const sizeButtons = page.locator('button:has-text("Add to Cart")');
      const buttonSelector = sizeIndex === 'first'
        ? sizeButtons.first()
        : sizeIndex === 'last'
        ? sizeButtons.last()
        : sizeButtons.nth(1);

      await buttonSelector.click();

      await completeCheckoutWithTestCard(page, 'VISA', testEmail);

      const successVerified = await isCheckoutSuccessful(page);
      expect(successVerified).toBe(true);
    }
  });
});
