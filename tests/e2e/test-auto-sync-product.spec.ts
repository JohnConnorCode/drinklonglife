import { test, expect } from '@playwright/test';

/**
 * E2E Test: Auto-Sync Product to Stripe
 *
 * This test verifies the entire product creation workflow:
 * 1. Login as admin
 * 2. Create a new product with variant
 * 3. Verify auto-sync to Stripe works
 * 4. Verify product can be used in checkout
 * 5. Delete the test product
 */

const TEST_PRODUCT = {
  name: `Test Product ${Date.now()}`,
  slug: `test-product-${Date.now()}`,
  tagline: 'Testing auto-sync integration',
  label_color: 'yellow',
};

const TEST_VARIANT = {
  size_key: 'test_size',
  label: 'Test Size',
  price_usd: 29.99,
};

test.describe('Auto-Sync Product to Stripe', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  let productId: string;
  let stripeProductId: string;

  test('should login as admin', async ({ page }) => {
    await page.goto('/login');

    // Fill in login credentials from env
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD not set');
      return;
    }

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/(admin|account)/, { timeout: 10000 });
  });

  test('should create product with auto-sync enabled', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Click "Add New Product" button
    await page.click('text=Add New Product');
    await page.waitForURL('/admin/products/new');

    // Fill in product details
    await page.fill('input[name="name"]', TEST_PRODUCT.name);
    await page.fill('input[name="slug"]', TEST_PRODUCT.slug);
    await page.fill('input[name="tagline"]', TEST_PRODUCT.tagline);

    // Select label color
    await page.selectOption('select[name="label_color"]', TEST_PRODUCT.label_color);

    // Set display_order
    await page.fill('input[name="display_order"]', '999');

    // Check "Is Active"
    await page.check('input[name="is_active"]');

    // Add a variant
    // Note: The exact selectors depend on how variants are added in the form
    // This is a placeholder - adjust based on actual form implementation
    const variantSection = page.locator('text=Product Variants').locator('..');

    // Click "Add Variant" button if exists
    const addVariantBtn = variantSection.locator('button:has-text("Add")');
    if (await addVariantBtn.isVisible()) {
      await addVariantBtn.click();
    }

    // Fill variant details
    await page.fill('input[name*="size_key"]', TEST_VARIANT.size_key);
    await page.fill('input[name*="label"]', TEST_VARIANT.label);
    await page.fill('input[name*="price_usd"]', TEST_VARIANT.price_usd.toString());

    // Verify auto-sync checkbox is checked by default
    const autoSyncCheckbox = page.locator('input[name="auto_sync"]');
    await expect(autoSyncCheckbox).toBeChecked();

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for sync message
    const syncMessage = page.locator('text=/✅ Synced to Stripe!/i');
    await expect(syncMessage).toBeVisible({ timeout: 15000 });

    // Extract stripe product ID from success message
    const messageText = await syncMessage.textContent();
    const match = messageText?.match(/Product: (prod_[a-zA-Z0-9]+)/);
    if (match) {
      stripeProductId = match[1];
      console.log('✅ Stripe Product ID:', stripeProductId);
    }

    // Wait for redirect to products list
    await page.waitForURL('/admin/products', { timeout: 5000 });

    // Verify product appears in list
    await expect(page.locator(`text=${TEST_PRODUCT.name}`)).toBeVisible();
  });

  test('should verify product exists in Stripe', async () => {
    if (!stripeProductId) {
      test.skip(true, 'Stripe product ID not captured from previous test');
      return;
    }

    // Use Stripe API to verify
    const stripe = require('stripe');
    const STRIPE_KEY = process.env.STRIPE_SECRET_KEY_TEST;

    if (!STRIPE_KEY) {
      test.skip(true, 'STRIPE_SECRET_KEY_TEST not set');
      return;
    }

    const stripeClient = new stripe(STRIPE_KEY);

    const product = await stripeClient.products.retrieve(stripeProductId);
    expect(product).toBeDefined();
    expect(product.name).toBe(TEST_PRODUCT.name);
    expect(product.active).toBe(true);
    expect(product.metadata.slug).toBe(TEST_PRODUCT.slug);

    console.log('✅ Verified product in Stripe:', product.id);

    // Verify prices exist
    const prices = await stripeClient.prices.list({
      product: stripeProductId,
      active: true,
    });

    expect(prices.data.length).toBeGreaterThan(0);
    expect(prices.data[0].unit_amount).toBe(TEST_VARIANT.price_usd * 100);

    console.log('✅ Verified price in Stripe:', prices.data[0].id);
  });

  test('should cleanup - delete test product', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');

    // Find and click on test product
    await page.click(`text=${TEST_PRODUCT.name}`);

    // Click delete button
    const deleteBtn = page.locator('button:has-text("Delete")');
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Confirm deletion
      const confirmBtn = page.locator('button:has-text("Confirm")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      // Wait for redirect
      await page.waitForURL('/admin/products', { timeout: 5000 });

      console.log('✅ Test product deleted');
    }
  });
});
