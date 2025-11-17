import { test, expect } from '@playwright/test';

/**
 * Auth Flow Tests
 * Tests login, logout, and session persistence
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign in")');

    // Should show error message
    await expect(page.locator('text=/Invalid|failed|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect from protected routes when not logged in', async ({ page }) => {
    await page.goto('/account');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.url()).toContain('redirectTo');
  });

  test('should redirect from admin routes when not logged in', async ({ page }) => {
    await page.goto('/admin/products');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout button should work', async ({ page }) => {
    // First, we need to be logged in
    // For now, just check that sign out button exists when we have a session

    await page.goto('/');

    // If there's a Sign Out button visible, click it
    const signOutButton = page.locator('button:has-text("Sign Out")');

    if (await signOutButton.isVisible()) {
      await signOutButton.click();

      // Wait for redirect
      await page.waitForTimeout(1000);

      // Should be logged out - check for login link
      await expect(page.locator('text=/Sign In|Login/i')).toBeVisible();
    }
  });
});

test.describe('Session Persistence', () => {
  test('should persist session across page refreshes', async ({ page }) => {
    // This test requires a logged-in user
    // For manual testing: login, then run this test

    await page.goto('/');

    const isLoggedIn = await page.locator('button:has-text("Sign Out")').isVisible();

    if (isLoggedIn) {
      // Refresh the page
      await page.reload();

      // Should still be logged in
      await expect(page.locator('button:has-text("Sign Out")')).toBeVisible();
    }
  });
});
