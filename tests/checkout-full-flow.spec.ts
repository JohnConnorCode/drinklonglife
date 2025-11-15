import { test, expect } from '@playwright/test';

test.describe('Full Checkout Flow', () => {
  test('should complete checkout from product page to Stripe', async ({ page }) => {
    // Step 1: Navigate to a product page
    console.log('Step 1: Loading product page...');
    await page.goto('http://localhost:3001/blends/yellow-bomb');
    await page.waitForLoadState('networkidle');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Yellow Bomb');
    console.log('✅ Product page loaded');

    // Step 2: Find and click "Add to Cart" button for 1 Gallon
    console.log('Step 2: Adding 1 Gallon to cart...');

    // Wait for variant selector to load
    await page.waitForSelector('text=Choose your size', { timeout: 10000 });

    // Find the 1 Gallon card and its Add to Cart button
    const gallonCard = page.locator('div', { hasText: /^1 Gallon$/ }).first();
    await expect(gallonCard).toBeVisible();

    // Verify price is $50
    await expect(gallonCard.locator('text=$50')).toBeVisible();
    console.log('✅ 1 Gallon shows $50 price');

    // Click Add to Cart
    const addToCartButton = gallonCard.locator('button:has-text("Add to Cart")');
    await addToCartButton.click();
    console.log('✅ Clicked Add to Cart');

    // Step 3: Verify item was added (button changes to "Added!")
    await expect(gallonCard.locator('button:has-text("Added!")')).toBeVisible({ timeout: 5000 });
    console.log('✅ Item added to cart');

    // Step 4: Click "View Cart" button
    const viewCartButton = gallonCard.locator('button:has-text("View Cart")');
    await expect(viewCartButton).toBeVisible();
    await viewCartButton.click();
    console.log('✅ Navigating to cart...');

    // Step 5: Verify we're on cart page and item is there
    await page.waitForURL('**/cart');
    await expect(page.locator('h1')).toContainText('Shopping Cart');

    // Verify the cart item
    await expect(page.locator('text=Yellow Bomb - 1 Gallon')).toBeVisible();
    await expect(page.locator('text=$50.00')).toBeVisible();
    console.log('✅ Cart page shows correct item and price');

    // Step 6: Click "Proceed to Checkout"
    console.log('Step 6: Proceeding to checkout...');

    // Set up listener for navigation to Stripe
    const checkoutPromise = page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });

    const checkoutButton = page.locator('button:has-text("Proceed to Checkout")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();
    console.log('✅ Clicked Proceed to Checkout');

    // Step 7: Verify redirect to Stripe Checkout
    await checkoutPromise;
    const currentUrl = page.url();
    expect(currentUrl).toContain('checkout.stripe.com');
    console.log('✅ Successfully redirected to Stripe Checkout');
    console.log(`   Stripe URL: ${currentUrl}`);

    // Step 8: Verify Stripe checkout page loaded
    await page.waitForLoadState('networkidle');

    // Check for Stripe elements (these selectors may need adjustment based on Stripe's UI)
    const stripeContent = await page.content();
    expect(stripeContent).toContain('stripe');
    console.log('✅ Stripe checkout page loaded');

    console.log('\n=== ✅ FULL CHECKOUT FLOW COMPLETE ===');
    console.log('Successfully tested:');
    console.log('  1. Product page loads with correct price ($50)');
    console.log('  2. Add to Cart button works');
    console.log('  3. Cart page shows correct item and price');
    console.log('  4. Checkout button redirects to Stripe');
    console.log('  5. Stripe checkout session created successfully');
  });

  test('should handle checkout with multiple items', async ({ page }) => {
    console.log('\n=== Testing Multi-Item Checkout ===\n');

    // Add Yellow Bomb 1 Gallon
    await page.goto('http://localhost:3001/blends/yellow-bomb');
    await page.waitForLoadState('networkidle');

    const gallonCard = page.locator('div', { hasText: /^1 Gallon$/ }).first();
    await gallonCard.locator('button:has-text("Add to Cart")').click();
    await expect(gallonCard.locator('button:has-text("Added!")')).toBeVisible({ timeout: 5000 });
    console.log('✅ Added Yellow Bomb 1 Gallon');

    // Add Yellow Bomb Shot
    const shotCard = page.locator('div', { hasText: /^2 oz Shot$/ }).first();
    await shotCard.locator('button:has-text("Add to Cart")').click();
    await expect(shotCard.locator('button:has-text("Added!")')).toBeVisible({ timeout: 5000 });
    console.log('✅ Added Yellow Bomb Shot');

    // Go to cart
    await page.goto('http://localhost:3001/cart');
    await page.waitForLoadState('networkidle');

    // Verify both items
    await expect(page.locator('text=Yellow Bomb - 1 Gallon')).toBeVisible();
    await expect(page.locator('text=Yellow Bomb - 2 oz Shot')).toBeVisible();
    console.log('✅ Cart has both items');

    // Check total
    const totalText = await page.locator('text=Total').locator('..').textContent();
    expect(totalText).toContain('$55.00'); // $50 + $5
    console.log('✅ Total is correct: $55.00');

    // Checkout
    const checkoutPromise = page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });
    await page.locator('button:has-text("Proceed to Checkout")').click();
    await checkoutPromise;

    expect(page.url()).toContain('checkout.stripe.com');
    console.log('✅ Multi-item checkout succeeded');
  });

  test('should clear invalid price IDs from localStorage', async ({ page }) => {
    console.log('\n=== Testing localStorage Migration ===\n');

    // Inject bad data into localStorage before loading page
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('cart-storage', JSON.stringify({
        state: {
          items: [{
            id: 'bad-item',
            priceId: 'price_usd', // Invalid price ID
            productName: 'Test Product',
            productType: 'one-time',
            quantity: 1,
            amount: 5000
          }]
        },
        version: 1 // Old version
      }));
    });
    console.log('✅ Injected bad cart data (version 1 with invalid priceId)');

    // Reload page to trigger migration
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that cart was cleared
    const cartData = await page.evaluate(() => {
      const data = localStorage.getItem('cart-storage');
      return data ? JSON.parse(data) : null;
    });

    console.log('Cart data after migration:', cartData);

    // Verify cart is empty or items are filtered
    if (cartData?.state?.items) {
      expect(cartData.state.items.length).toBe(0);
      console.log('✅ Invalid items cleared from cart');
    }

    // Verify version upgraded
    expect(cartData?.version).toBe(2);
    console.log('✅ Cart version upgraded to 2');
  });
});
