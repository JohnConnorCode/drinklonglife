import { test, expect } from '@playwright/test';
import {
  completeCheckoutWithTestCard,
  isCheckoutSuccessful,
  getCheckoutSessionId,
} from '../../helpers/checkout';
import {
  waitForOrder,
  getOrderBySessionId,
  deleteOrderBySessionId,
} from '../../helpers/database';

/**
 * Webhook Verification Tests
 *
 * IMPORTANT: These tests require Stripe CLI webhook forwarding:
 * 1. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook
 * 2. Ensure STRIPE_WEBHOOK_SECRET in .env.local matches the webhook signing secret
 * 3. Keep the dev server running: npm run dev
 *
 * These tests verify that:
 * - Stripe webhooks are received by the application
 * - checkout.session.completed events create orders in the database
 * - Order data is correctly populated from webhook events
 * - RLS policies allow webhook handler to create orders
 */

test.describe('Webhook Verification', () => {
  test('should create order in database after successful checkout', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Select a size and add to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Complete checkout with test card
    const testEmail = `webhook-test-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    // Verify checkout completed successfully
    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    // Get session ID from success page
    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    if (!sessionId) {
      throw new Error('Session ID not found on success page');
    }

    // Wait for webhook to create order (up to 30 seconds)
    console.log(`Waiting for order with session ID: ${sessionId}`);
    const order = await waitForOrder(sessionId, 30000);

    // Verify order was created
    expect(order).not.toBeNull();
    expect(order?.stripe_session_id).toBe(sessionId);
    expect(order?.customer_email).toBe(testEmail);
    expect(order?.status).toBe('paid');

    // Cleanup: Delete test order
    if (order) {
      await deleteOrderBySessionId(sessionId);
    }
  });

  test('should populate order with correct customer email', async ({ page }) => {
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    const customEmail = `webhook-email-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', customEmail);

    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    if (!sessionId) {
      throw new Error('Session ID not found');
    }

    const order = await waitForOrder(sessionId, 30000);

    expect(order).not.toBeNull();
    expect(order?.customer_email).toBe(customEmail);

    // Cleanup
    if (order) {
      await deleteOrderBySessionId(sessionId);
    }
  });

  test('should create order with correct payment status', async ({ page }) => {
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    const testEmail = `webhook-status-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    if (!sessionId) {
      throw new Error('Session ID not found');
    }

    const order = await waitForOrder(sessionId, 30000);

    expect(order).not.toBeNull();
    expect(order?.status).toBe('paid');
    expect(order?.amount_total).toBeGreaterThan(0);

    // Cleanup
    if (order) {
      await deleteOrderBySessionId(sessionId);
    }
  });

  test('should handle webhook for different product sizes', async ({ page }) => {
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Get all Add to Cart buttons (different sizes)
    const addToCartButtons = page.locator('button:has-text("Add to Cart")');
    const count = await addToCartButtons.count();

    // Test with the last size option (if multiple exist)
    const buttonToClick = count > 1 ? addToCartButtons.nth(count - 1) : addToCartButtons.first();
    await buttonToClick.click();

    const testEmail = `webhook-size-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    if (!sessionId) {
      throw new Error('Session ID not found');
    }

    const order = await waitForOrder(sessionId, 30000);

    expect(order).not.toBeNull();
    expect(order?.stripe_session_id).toBe(sessionId);

    // Cleanup
    if (order) {
      await deleteOrderBySessionId(sessionId);
    }
  });

  test('should verify webhook handler respects RLS policies', async ({ page }) => {
    // This test verifies that the webhook handler can create orders
    // even though it's not authenticated (uses service role key)

    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    const testEmail = `webhook-rls-${Date.now()}@example.com`;
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    if (!sessionId) {
      throw new Error('Session ID not found');
    }

    // Wait for order creation via webhook
    const order = await waitForOrder(sessionId, 30000);

    // If order exists, webhook handler bypassed RLS correctly
    expect(order).not.toBeNull();

    // Verify we can also query it directly (proves it's in the database)
    const queriedOrder = await getOrderBySessionId(sessionId);
    expect(queriedOrder).not.toBeNull();
    expect(queriedOrder?.id).toBe(order?.id);

    // Cleanup
    if (order) {
      await deleteOrderBySessionId(sessionId);
    }
  });

  test('should create order within reasonable time after checkout', async ({ page }) => {
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    const testEmail = `webhook-timing-${Date.now()}@example.com`;

    const startTime = Date.now();
    await completeCheckoutWithTestCard(page, 'VISA', testEmail);

    const successVerified = await isCheckoutSuccessful(page);
    expect(successVerified).toBe(true);

    const sessionId = getCheckoutSessionId(page);
    expect(sessionId).not.toBeNull();

    if (!sessionId) {
      throw new Error('Session ID not found');
    }

    const order = await waitForOrder(sessionId, 30000);
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    expect(order).not.toBeNull();

    // Webhook should typically arrive within 10 seconds
    // But we allow up to 30 seconds for slower environments
    console.log(`Order created in ${elapsedTime}ms after checkout started`);
    expect(elapsedTime).toBeLessThan(30000);

    // Cleanup
    if (order) {
      await deleteOrderBySessionId(sessionId);
    }
  });
});
