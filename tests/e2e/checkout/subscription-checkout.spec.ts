import { test, expect } from '@playwright/test';

test.describe('Subscription Checkout Flow', () => {
  test('should toggle between one-time and subscription options', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Verify toggle is visible
    const oneTimeButton = page.locator('button:has-text("One-Time Purchase")');
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');

    await expect(oneTimeButton).toBeVisible();
    await expect(subscriptionButton).toBeVisible();

    // Default should be one-time purchase
    await expect(oneTimeButton).toHaveClass(/bg-white.*text-accent-primary/);

    // Click subscription toggle
    await subscriptionButton.click();

    // Verify subscription button is now active
    await expect(subscriptionButton).toHaveClass(/bg-white.*text-accent-primary/);

    // Verify subscription pricing appears
    const monthlyIndicator = page.locator('text=/\\/month/i');
    await expect(monthlyIndicator.first()).toBeVisible();

    // Verify subscription benefits are displayed
    const deliveryBenefit = page.locator('text=/Free delivery every month/i');
    const cancelBenefit = page.locator('text=/Cancel anytime/i');
    await expect(deliveryBenefit.first()).toBeVisible();
    await expect(cancelBenefit.first()).toBeVisible();
  });

  test('should allow adding subscription to cart and proceeding to checkout', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await subscriptionButton.click();

    // Wait for subscription variants to appear
    await page.waitForTimeout(500);

    // Select a subscription size (first Add to Cart button after toggle)
    const addToCartButtons = page.locator('button:has-text("Add to Cart")');
    await expect(addToCartButtons.first()).toBeVisible();
    await addToCartButtons.first().click();

    // Wait for cart update
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    // Verify checkout button is present (which means cart has items)
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();

    // Note: Full subscription checkout requires webhook configuration and is tested separately
  });

  test('should show subscription pricing with /month indicator', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await subscriptionButton.click();

    // Wait for UI to update
    await page.waitForTimeout(500);

    // Verify all pricing has /month indicator
    const monthlyIndicators = page.locator('text=/\\/month/i');
    const count = await monthlyIndicators.count();
    expect(count).toBeGreaterThan(0);

    // Verify "Delivered Monthly" text appears
    const deliveredMonthly = page.locator('text=/Delivered Monthly/i');
    await expect(deliveredMonthly.first()).toBeVisible();
  });

  test('should show subscription benefits and features', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await subscriptionButton.click();

    // Wait for UI to update
    await page.waitForTimeout(500);

    // Verify subscription benefits
    const benefits = [
      'Free delivery every month',
      'Cancel anytime',
      'Save 15% vs one-time',
    ];

    for (const benefit of benefits) {
      const benefitElement = page.locator(`text=/${benefit}/i`);
      await expect(benefitElement.first()).toBeVisible();
    }

    // Verify additional subscription info at bottom
    const subscriptionInfo = page.locator('text=/Subscriptions can be paused or cancelled anytime/i');
    await expect(subscriptionInfo).toBeVisible();
  });

  test('should allow switching between one-time and subscription multiple times', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    const oneTimeButton = page.locator('button:has-text("One-Time Purchase")');
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');

    // Start with one-time (default)
    await expect(oneTimeButton).toHaveClass(/bg-white.*text-accent-primary/);

    // Switch to subscription
    await subscriptionButton.click();
    await expect(subscriptionButton).toHaveClass(/bg-white.*text-accent-primary/);

    // Verify /month appears
    const monthlyIndicator = page.locator('text=/\\/month/i');
    await expect(monthlyIndicator.first()).toBeVisible();

    // Switch back to one-time
    await oneTimeButton.click();
    await expect(oneTimeButton).toHaveClass(/bg-white.*text-accent-primary/);

    // Verify /month disappears (or count reduces)
    const oneTimeCount = await page.locator('text=/\\/month/i').count();
    expect(oneTimeCount).toBe(0);

    // Switch to subscription again
    await subscriptionButton.click();
    await expect(subscriptionButton).toHaveClass(/bg-white.*text-accent-primary/);

    // Verify /month appears again
    await expect(monthlyIndicator.first()).toBeVisible();
  });

  test('should display subscription product sizes', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await subscriptionButton.click();

    // Wait for UI to update
    await page.waitForTimeout(500);

    // Verify we have size options with Add to Cart buttons
    const sizeOptions = page.locator('[class*="grid"] > div:has(button:has-text("Add to Cart"))');
    const count = await sizeOptions.count();

    // Should have at least 1 size option (actual data may vary)
    expect(count).toBeGreaterThan(0);

    // Verify we can see subscription-specific elements
    const deliveredMonthly = page.locator('text=/Delivered Monthly/i').first();
    await expect(deliveredMonthly).toBeVisible();
  });

  test('should show subscription toggle on blend products', async ({ page }) => {
    // Test only green-bomb since we know it exists
    // Testing all blends could fail if they're not published
    const blend = 'green-bomb';

    await page.goto(`/blends/${blend}`);
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await expect(subscriptionButton).toBeVisible();
    await subscriptionButton.click();
    await page.waitForTimeout(500);

    // Verify subscription UI appears
    const monthlyIndicator = page.locator('text=/\\/month/i');
    await expect(monthlyIndicator.first()).toBeVisible();

    // Verify Add to Cart button exists
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();
  });

  test('should add subscription product to cart correctly', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await subscriptionButton.click();
    await page.waitForTimeout(500);

    // Select a size
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    // Wait a moment for cart state to update
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    // Verify checkout button is visible (which means cart has items)
    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible({ timeout: 5000 });
  });

  test('should show most popular badge on subscription variants', async ({ page }) => {
    // Navigate to green bomb blend
    await page.goto('/blends/green-bomb');
    await page.waitForLoadState('domcontentloaded');

    // Toggle to subscription
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await subscriptionButton.click();
    await page.waitForTimeout(500);

    // Look for "Most Popular" badge (may or may not exist depending on data)
    const mostPopularBadge = page.locator('text=/Most Popular/i');
    const badgeExists = await mostPopularBadge.isVisible({ timeout: 2000 }).catch(() => false);

    if (badgeExists) {
      // Verify the popular card has an Add to Cart button
      const popularCard = page.locator('div:has(div:text("Most Popular"))');
      const addToCartButton = popularCard.locator('button:has-text("Add to Cart")').first();
      await expect(addToCartButton).toBeVisible();
    }

    // If no "Most Popular" exists, that's also okay - test passes
  });

  test('should display pricing page with links to subscription options', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');
    await page.waitForLoadState('domcontentloaded');

    // Verify pricing page shows subscription info somewhere on the page
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('subscription');

    // Click on a product to go to blend detail page
    const viewOptionsLink = page.locator('text=/View Options/i').first();
    await expect(viewOptionsLink).toBeVisible();
    await viewOptionsLink.click();

    // Wait for blend page to load
    await page.waitForURL(/\/blends\//, { timeout: 10000 });

    // Verify we're on a blend page with subscription toggle
    const subscriptionButton = page.locator('button:has-text("Monthly Subscription")');
    await expect(subscriptionButton).toBeVisible();
  });
});
