import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for shopping cart functionality
 * Tests cart operations, persistence, and UI interactions
 */

const PRODUCTION_URL = 'https://drinklonglife.com';

test.describe('Shopping Cart - Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test('should add item to cart from blend page', async ({ page }) => {
    // Navigate to a blend page
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');

    // Wait for add to cart button and click it
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Verify success state
    await expect(page.locator('button:has-text("Added!")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("View Cart")')).toBeVisible();

    // Verify cart has item in localStorage
    const cartData = await page.evaluate(() => {
      const data = localStorage.getItem('cart-storage');
      return data ? JSON.parse(data) : null;
    });

    expect(cartData).not.toBeNull();
    expect(cartData.state.items).toHaveLength(1);
    expect(cartData.state.items[0].quantity).toBe(1);
  });

  test('should navigate to cart page after adding item', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');

    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();

    // Click View Cart button
    await page.locator('button:has-text("View Cart")').click();

    // Verify we're on cart page
    await expect(page).toHaveURL(`${PRODUCTION_URL}/cart`);
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
  });
});

test.describe('Shopping Cart - Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    // Add item to cart first
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.goto(`${PRODUCTION_URL}/cart`);
    await page.waitForLoadState('networkidle');
  });

  test('should display cart items correctly', async ({ page }) => {
    // Verify cart header
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    await expect(page.locator('text=/1 item/')).toBeVisible();

    // Verify item is displayed
    await expect(page.locator('text=Green Bomb')).toBeVisible();

    // Verify order summary exists
    await expect(page.locator('h2:has-text("Order Summary")')).toBeVisible();
    await expect(page.locator('text=Subtotal')).toBeVisible();
    await expect(page.locator('text=Shipping')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('should increase quantity', async ({ page }) => {
    // Find quantity controls
    const increaseButton = page.locator('button[aria-label="Increase quantity"]').first();
    const quantityDisplay = page.locator('span:has-text("Qty:")').first();

    // Get initial quantity
    const initialText = await quantityDisplay.textContent();
    expect(initialText).toContain('1');

    // Increase quantity
    await increaseButton.click();
    await page.waitForTimeout(500);

    // Verify quantity increased
    const newText = await quantityDisplay.textContent();
    expect(newText).toContain('2');

    // Verify header updated
    await expect(page.locator('text=/2 items/')).toBeVisible();
  });

  test('should decrease quantity', async ({ page }) => {
    // First increase to 2
    const increaseButton = page.locator('button[aria-label="Increase quantity"]').first();
    await increaseButton.click();
    await page.waitForTimeout(500);

    // Then decrease back to 1
    const decreaseButton = page.locator('button[aria-label="Decrease quantity"]').first();
    await decreaseButton.click();
    await page.waitForTimeout(500);

    // Verify quantity is 1
    const quantityDisplay = page.locator('span:has-text("Qty:")').first();
    const text = await quantityDisplay.textContent();
    expect(text).toContain('1');
  });

  test('should remove item from cart', async ({ page }) => {
    // Click remove button
    const removeButton = page.locator('button[aria-label="Remove item"]').first();
    await removeButton.click();
    await page.waitForTimeout(500);

    // Verify cart is empty
    await expect(page.locator('h2:has-text("Your cart is empty")')).toBeVisible();
    await expect(page.locator('a:has-text("Browse Blends")')).toBeVisible();
  });

  test('should clear cart', async ({ page }) => {
    // Click clear cart button
    await page.locator('button:has-text("Clear Cart")').click();

    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await page.waitForTimeout(500);

    // Verify cart is empty
    await expect(page.locator('h2:has-text("Your cart is empty")')).toBeVisible();
  });
});

test.describe('Shopping Cart - Persistence', () => {
  test('should persist cart across page reloads', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    // Add item to cart
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate to cart and verify item is still there
    await page.goto(`${PRODUCTION_URL}/cart`);
    await expect(page.locator('text=Green Bomb')).toBeVisible();
    await expect(page.locator('text=/1 item/')).toBeVisible();
  });

  test('should persist cart across navigation', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    // Add item to cart
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();
    await page.waitForTimeout(1000);

    // Navigate to home
    await page.goto(PRODUCTION_URL);

    // Navigate to cart and verify item is still there
    await page.goto(`${PRODUCTION_URL}/cart`);
    await expect(page.locator('text=Green Bomb')).toBeVisible();
  });
});

test.describe('Shopping Cart - Multiple Items', () => {
  test('should handle multiple different items', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    // Add first item
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');
    let addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();
    await page.waitForTimeout(1000);

    // Add second item
    await page.goto(`${PRODUCTION_URL}/blends/red-bomb`);
    await page.waitForLoadState('networkidle');
    addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();
    await page.waitForTimeout(1000);

    // Go to cart and verify both items
    await page.goto(`${PRODUCTION_URL}/cart`);
    await expect(page.locator('text=/2 items/')).toBeVisible();
    await expect(page.locator('text=Green Bomb')).toBeVisible();
    await expect(page.locator('text=Red Bomb')).toBeVisible();
  });

  test('should handle same item with different sizes', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');

    // Add first size
    const addButtons = page.locator('button:has-text("Add to Cart")');
    const count = await addButtons.count();

    if (count > 1) {
      // Click first size
      await addButtons.nth(0).click();
      await page.waitForTimeout(1000);

      // Click second size
      await addButtons.nth(1).click();
      await page.waitForTimeout(1000);

      // Go to cart and verify 2 items (different sizes)
      await page.goto(`${PRODUCTION_URL}/cart`);
      await expect(page.locator('text=/2 items/')).toBeVisible();
    }
  });
});

test.describe('Shopping Cart - Empty State', () => {
  test('should display empty cart message', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    await page.goto(`${PRODUCTION_URL}/cart`);
    await expect(page.locator('h2:has-text("Your cart is empty")')).toBeVisible();
    await expect(page.locator('text=Add some delicious juice blends to get started')).toBeVisible();
    await expect(page.locator('a:has-text("Browse Blends")')).toBeVisible();
  });

  test('should navigate to blends from empty cart', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    await page.goto(`${PRODUCTION_URL}/cart`);
    await page.locator('a:has-text("Browse Blends")').click();

    await expect(page).toHaveURL(`${PRODUCTION_URL}/blends`);
  });
});

test.describe('Shopping Cart - Trust Badges', () => {
  test('should display trust badges on cart page', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.evaluate(() => localStorage.clear());

    // Add item and go to cart
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    await addButton.click();
    await page.waitForTimeout(1000);

    await page.goto(`${PRODUCTION_URL}/cart`);

    // Verify trust badges
    await expect(page.locator('text=Free shipping on orders over $50')).toBeVisible();
    await expect(page.locator('text=Secure checkout')).toBeVisible();
    await expect(page.locator('text=30-day money-back guarantee')).toBeVisible();
  });
});
