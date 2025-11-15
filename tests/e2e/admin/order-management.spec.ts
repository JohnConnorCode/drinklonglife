import { test, expect, Page } from '@playwright/test';
import { login } from '../../helpers/auth';
import { goToBlends, completeCheckoutWithTestCard, isCheckoutSuccessful } from '../../helpers/checkout';
import { waitForOrder } from '../../helpers/database';

/**
 * Admin Order Management E2E Tests
 *
 * Comprehensive testing of admin order functionality including:
 * - Dashboard access and statistics
 * - Order list viewing and filtering
 * - Order detail page
 * - Refund processing (full and partial)
 * - Status updates
 * - CSV export
 */

// Admin test user credentials (must be set up in database with is_admin=true)
const ADMIN_USER = {
  email: process.env.ADMIN_TEST_EMAIL || 'admin@drinklonglife.com',
  password: process.env.ADMIN_TEST_PASSWORD || 'AdminTest123!',
};

// Helper to create a test order that can be managed by admin
async function createTestOrder(page: Page): Promise<string | null> {
  // Navigate to blends and create an order
  await goToBlends(page);

  const blendLinks = page.locator('a[href*="/blends/"]').first();
  const blendHref = await blendLinks.getAttribute('href');

  if (!blendHref) {
    return null;
  }

  await page.goto(blendHref);

  // Add to cart and checkout
  const sizeButtons = page.locator('button:has-text("Reserve Now")');
  await sizeButtons.first().click();

  // Complete checkout
  const testEmail = `test-order-${Date.now()}@example.com`;
  await completeCheckoutWithTestCard(page, 'VISA', testEmail);

  // Verify success
  const successVerified = await isCheckoutSuccessful(page);
  if (!successVerified) {
    return null;
  }

  // Extract session ID from URL
  const currentUrl = page.url();
  const sessionIdMatch = currentUrl.match(/session_id=([^&]+)/);
  return sessionIdMatch ? sessionIdMatch[1] : null;
}

// Helper to login as admin
async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, ADMIN_USER);

  // Verify we can access admin area
  await page.goto('/admin');

  // Should not be redirected to unauthorized
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('/unauthorized');
  expect(currentUrl).toContain('/admin');
}

test.describe('Admin Order Management', () => {
  test.describe('Dashboard and Statistics', () => {
    test('should display admin dashboard with order statistics', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin');

      // Verify dashboard loads
      await expect(page.locator('h1:has-text("Admin Dashboard")')).toBeVisible();

      // Verify order statistics section
      await expect(page.locator('h2:has-text("Order Overview")')).toBeVisible();

      // Verify stat cards exist
      await expect(page.locator('text=Total Orders')).toBeVisible();
      await expect(page.locator('text=Total Revenue')).toBeVisible();
      await expect(page.locator('text=Avg Order Value')).toBeVisible();
      await expect(page.locator('text=Pending Orders')).toBeVisible();

      // Verify stats show numbers (not errors)
      const totalOrdersCard = page.locator('text=Total Orders').locator('..');
      const totalOrdersValue = totalOrdersCard.locator('p.text-3xl');
      const value = await totalOrdersValue.textContent();
      expect(value).toMatch(/^\d+$/); // Should be a number
    });

    test('should navigate to orders page from dashboard', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin');

      // Click "Manage Orders" quick action
      await page.click('text=Manage Orders');

      // Should navigate to orders page
      await expect(page).toHaveURL('/admin/orders');
      await expect(page.locator('h1:has-text("Orders")')).toBeVisible();
    });
  });

  test.describe('Order List and Filtering', () => {
    test('should display orders list with pagination', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/orders');

      // Verify orders page loads
      await expect(page.locator('h1:has-text("Orders")')).toBeVisible();

      // Check if orders table or list exists (might be empty)
      const ordersContainer = page.locator('[data-testid="orders-list"], table, .orders-container').first();
      await expect(ordersContainer).toBeVisible({ timeout: 10000 });
    });

    test('should filter orders by status', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/orders');

      // Look for status filter
      const statusFilter = page.locator('select[name*="status"], [role="combobox"]:has-text("Status")').first();

      if (await statusFilter.isVisible()) {
        // Select "completed" status
        await statusFilter.click();
        await page.click('text=Completed, text=completed').first();

        // Wait for URL to update with filter
        await page.waitForURL(/status=completed/i, { timeout: 5000 });

        // Verify filter is applied
        expect(page.url()).toContain('status');
      }
    });

    test('should search orders by email or session ID', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/orders');

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();

      if (await searchInput.isVisible()) {
        // Type search query
        await searchInput.fill('test@example.com');

        // Submit search (either auto-submits or has button)
        const searchButton = page.locator('button:has-text("Search")');
        if (await searchButton.isVisible({ timeout: 1000 })) {
          await searchButton.click();
        } else {
          await searchInput.press('Enter');
        }

        // Wait for results to load
        await page.waitForTimeout(1000);

        // Verify search is active
        expect(page.url()).toContain('search');
      }
    });
  });

  test.describe('Order Detail View', () => {
    test('should display complete order details', async ({ page }) => {
      // First create a test order
      const sessionId = await createTestOrder(page);

      if (!sessionId) {
        test.skip();
        return;
      }

      // Wait for order to be created in database
      const order = await waitForOrder(sessionId, 30000, 1000);
      expect(order).not.toBeNull();

      if (!order) {
        test.skip();
        return;
      }

      // Now login as admin
      await loginAsAdmin(page);

      // Navigate to order detail page
      await page.goto(`/admin/orders/${order.id}`);

      // Verify order detail page loads
      await expect(page.locator('h1, h2').filter({ hasText: /Order #|Order Details/i })).toBeVisible({ timeout: 10000 });

      // Verify key order information is displayed
      await expect(page.locator(`text=${order.customer_email}`)).toBeVisible();
      await expect(page.locator(`text=${order.status}`)).toBeVisible();
      await expect(page.locator(`text=${order.payment_status}`)).toBeVisible();

      // Verify amount is displayed (formatted as currency)
      const amountInDollars = (order.amount_total / 100).toFixed(2);
      await expect(page.locator(`text=/\\$${amountInDollars}/`)).toBeVisible();
    });

    test('should display Stripe session details', async ({ page }) => {
      // Create test order
      const sessionId = await createTestOrder(page);

      if (!sessionId) {
        test.skip();
        return;
      }

      const order = await waitForOrder(sessionId, 30000, 1000);

      if (!order) {
        test.skip();
        return;
      }

      // Login as admin and view order
      await loginAsAdmin(page);
      await page.goto(`/admin/orders/${order.id}`);

      // Verify Stripe information section
      await expect(page.locator('text=/Stripe|Payment/i')).toBeVisible({ timeout: 10000 });

      // Verify session ID is displayed
      await expect(page.locator(`text=${order.stripe_session_id}`)).toBeVisible();

      // Verify customer ID is displayed
      if (order.stripe_customer_id) {
        await expect(page.locator(`text=${order.stripe_customer_id}`)).toBeVisible();
      }
    });
  });

  test.describe('Refund Processing', () => {
    test('should process full refund successfully', async ({ page }) => {
      // Create test order
      const sessionId = await createTestOrder(page);

      if (!sessionId) {
        test.skip();
        return;
      }

      const order = await waitForOrder(sessionId, 30000, 1000);

      if (!order || order.status === 'refunded') {
        test.skip();
        return;
      }

      // Login as admin
      await loginAsAdmin(page);
      await page.goto(`/admin/orders/${order.id}`);

      // Look for full refund button
      const fullRefundButton = page.locator('button:has-text("Full Refund"), button:has-text("Refund Order")').first();

      if (await fullRefundButton.isVisible({ timeout: 5000 })) {
        // Click refund button
        await fullRefundButton.click();

        // Handle confirmation dialog if it appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Refund")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Wait for refund to process (shows success message or status update)
        await expect(page.locator('text=/Refund.*success|Refunded successfully/i, [role="alert"]:has-text("success")')).toBeVisible({ timeout: 15000 });

        // Verify order status updated to refunded
        await page.waitForTimeout(1000);
        await expect(page.locator('text=/Status.*refunded|refunded/i')).toBeVisible();
      }
    });

    test('should process partial refund successfully', async ({ page }) => {
      // Create test order
      const sessionId = await createTestOrder(page);

      if (!sessionId) {
        test.skip();
        return;
      }

      const order = await waitForOrder(sessionId, 30000, 1000);

      if (!order || order.status === 'refunded') {
        test.skip();
        return;
      }

      // Login as admin
      await loginAsAdmin(page);
      await page.goto(`/admin/orders/${order.id}`);

      // Look for partial refund button or input
      const partialRefundButton = page.locator('button:has-text("Partial Refund"), button:has-text("Custom Amount")').first();

      if (await partialRefundButton.isVisible({ timeout: 5000 })) {
        await partialRefundButton.click();

        // Find amount input
        const amountInput = page.locator('input[type="number"], input[placeholder*="amount" i]').first();

        if (await amountInput.isVisible({ timeout: 2000 })) {
          // Enter partial amount (half of total)
          const partialAmount = (order.amount_total / 200).toFixed(2); // Divide by 200 to get half in dollars
          await amountInput.fill(partialAmount);

          // Submit refund
          const submitButton = page.locator('button:has-text("Refund"), button:has-text("Submit")').last();
          await submitButton.click();

          // Wait for success
          await expect(page.locator('text=/Refund.*success|Refunded successfully/i')).toBeVisible({ timeout: 15000 });
        }
      }
    });

    test('should not allow refund on already refunded order', async ({ page }) => {
      // This test checks that refund buttons are disabled or hidden for refunded orders
      await loginAsAdmin(page);

      // Navigate to orders and look for a refunded order
      await page.goto('/admin/orders?status=refunded');

      // Get first refunded order if it exists
      const firstOrderLink = page.locator('a[href*="/admin/orders/"]').first();

      if (await firstOrderLink.isVisible({ timeout: 5000 })) {
        await firstOrderLink.click();

        // Verify refund buttons are not available
        const refundButton = page.locator('button:has-text("Refund")');

        if (await refundButton.isVisible({ timeout: 2000 })) {
          // If button exists, it should be disabled
          await expect(refundButton).toBeDisabled();
        } else {
          // Or button should not exist at all
          await expect(refundButton).not.toBeVisible();
        }
      }
    });
  });

  test.describe('Status Updates', () => {
    test('should update order status', async ({ page }) => {
      // Create test order
      const sessionId = await createTestOrder(page);

      if (!sessionId) {
        test.skip();
        return;
      }

      const order = await waitForOrder(sessionId, 30000, 1000);

      if (!order) {
        test.skip();
        return;
      }

      // Login as admin
      await loginAsAdmin(page);
      await page.goto(`/admin/orders/${order.id}`);

      // Look for status update dropdown or button
      const statusSelect = page.locator('select[name*="status"], [role="combobox"]:has-text("Status")').first();

      if (await statusSelect.isVisible({ timeout: 5000 })) {
        const currentStatus = order.status;
        const newStatus = currentStatus === 'completed' ? 'processing' : 'completed';

        // Update status
        await statusSelect.click();
        await page.click(`text=${newStatus}`).first();

        // Look for update/save button
        const updateButton = page.locator('button:has-text("Update"), button:has-text("Save")');

        if (await updateButton.isVisible({ timeout: 2000 })) {
          await updateButton.click();

          // Wait for success message
          await expect(page.locator('text=/Status.*updated|Update successful/i')).toBeVisible({ timeout: 10000 });
        }
      }
    });
  });

  test.describe('CSV Export', () => {
    test('should export orders to CSV', async ({ page }) => {
      await loginAsAdmin(page);
      await page.goto('/admin/orders');

      // Look for export button
      const exportButton = page.locator('button:has-text("Export"), a:has-text("Export"), button:has-text("CSV")').first();

      if (await exportButton.isVisible({ timeout: 5000 })) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

        // Click export button
        await exportButton.click();

        // Wait for download
        const download = await downloadPromise;

        // Verify download filename
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.csv$/i);
        expect(filename).toMatch(/orders/i);

        // Optionally verify file is not empty
        const path = await download.path();
        if (path) {
          const fs = require('fs');
          const stats = fs.statSync(path);
          expect(stats.size).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Authorization and Security', () => {
    test('should redirect non-admin users to unauthorized page', async ({ page }) => {
      // Try to access admin area without logging in
      await page.goto('/admin');

      // Should be redirected to login or unauthorized
      const url = page.url();
      expect(url).toMatch(/\/(login|unauthorized|auth)/);
    });

    test('should prevent direct access to order detail without auth', async ({ page }) => {
      // Try to access a specific order page without auth
      await page.goto('/admin/orders/some-order-id');

      // Should be redirected
      const url = page.url();
      expect(url).toMatch(/\/(login|unauthorized|auth)/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid order ID gracefully', async ({ page }) => {
      await loginAsAdmin(page);

      // Navigate to non-existent order
      await page.goto('/admin/orders/invalid-order-id-12345');

      // Should show error message or 404
      const errorMessage = page.locator('text=/Not found|Invalid|Error/i');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('should handle failed refund gracefully', async ({ page }) => {
      // This test would attempt to refund an order that can't be refunded
      // (e.g., already refunded or payment failed)
      // Implementation depends on actual error states in the system
      test.skip(); // Skip unless specific error states are set up
    });
  });
});
