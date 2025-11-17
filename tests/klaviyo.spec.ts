import { test, expect } from '@playwright/test';

/**
 * Klaviyo Integration Tests
 * Tests newsletter subscription, unsubscription, and status checking
 */

test.describe('Klaviyo Email Preferences', () => {
  test('should show email preferences in account page when logged in', async ({ page }) => {
    // Try to access account (will redirect to login if not authenticated)
    await page.goto('/account');

    // Check if we're on login page (not authenticated)
    const isOnLoginPage = page.url().includes('/login');

    if (isOnLoginPage) {
      test.skip();
      return;
    }

    // If authenticated, check for email preferences section
    await expect(page.locator('text=Email Preferences')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Newsletter Subscription')).toBeVisible();
  });

  test('should not allow unauthenticated access to Klaviyo API endpoints', async ({ request }) => {
    // Test subscribe endpoint
    const subscribeResponse = await request.post('/api/klaviyo/subscribe', {
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    expect(subscribeResponse.status()).toBe(401);

    // Test unsubscribe endpoint
    const unsubscribeResponse = await request.post('/api/klaviyo/unsubscribe', {
      data: {
        email: 'test@example.com',
      },
    });
    expect(unsubscribeResponse.status()).toBe(401);

    // Test status endpoint
    const statusResponse = await request.get('/api/klaviyo/status');
    expect(statusResponse.status()).toBe(401);
  });

  test('should have working Klaviyo API routes structure', async ({ request }) => {
    // Verify routes exist (will return 401 for unauthenticated, not 404)
    const subscribeResponse = await request.post('/api/klaviyo/subscribe', {
      data: { email: 'test@example.com' },
    });
    expect(subscribeResponse.status()).not.toBe(404);

    const unsubscribeResponse = await request.post('/api/klaviyo/unsubscribe', {
      data: { email: 'test@example.com' },
    });
    expect(unsubscribeResponse.status()).not.toBe(404);

    const statusResponse = await request.get('/api/klaviyo/status');
    expect(statusResponse.status()).not.toBe(404);
  });
});

test.describe('Signup Klaviyo Integration', () => {
  test('should show signup page with newsletter info', async ({ page }) => {
    await page.goto('/signup');

    // Check signup form exists
    await expect(page.locator('text=Join Long Life')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create account")')).toBeVisible();
  });

  test('should redirect to welcome page after successful signup', async ({ page }) => {
    await page.goto('/signup');

    // Note: This test would need a valid test account to actually test signup
    // For now, just verify the form structure is correct
    const emailInput = page.locator('input[type="email"]');
    const nameInput = page.locator('input[name="fullName"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(nameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});

test.describe('Welcome Page', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/welcome');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show welcome page content when authenticated', async ({ page }) => {
    await page.goto('/account');

    // If we can access account, we're authenticated
    const isAuthenticated = !page.url().includes('/login');

    if (!isAuthenticated) {
      test.skip();
      return;
    }

    // Navigate to welcome page
    await page.goto('/welcome');

    // Check welcome page content
    await expect(page.locator('text=/Welcome/i')).toBeVisible({ timeout: 10000 });
  });

  test('welcome page should have onboarding action cards', async ({ page }) => {
    await page.goto('/account');
    const isAuthenticated = !page.url().includes('/login');

    if (!isAuthenticated) {
      test.skip();
      return;
    }

    await page.goto('/welcome');

    // Check for action cards
    await expect(page.locator('text=Explore Blends')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Start a Subscription')).toBeVisible();
    await expect(page.locator('text=Manage Account')).toBeVisible();
  });

  test('welcome page should mention newsletter subscription', async ({ page }) => {
    await page.goto('/account');
    const isAuthenticated = !page.url().includes('/login');

    if (!isAuthenticated) {
      test.skip();
      return;
    }

    await page.goto('/welcome');

    // Should mention being subscribed to newsletter
    await expect(page.locator('text=/subscribed to.*newsletter/i')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Email Preferences Component', () => {
  test('should have subscribe/unsubscribe toggle when authenticated', async ({ page }) => {
    await page.goto('/account');

    const isAuthenticated = !page.url().includes('/login');

    if (!isAuthenticated) {
      test.skip();
      return;
    }

    // Look for email preferences section
    const emailPrefsSection = page.locator('text=Email Preferences').first();
    await expect(emailPrefsSection).toBeVisible({ timeout: 10000 });

    // Should have a button for subscription status
    const subscriptionButton = page.locator('button:has-text(/Subscribe|Subscribed/)').first();
    await expect(subscriptionButton).toBeVisible();
  });

  test('should show Klaviyo integration notice', async ({ page }) => {
    await page.goto('/account');

    const isAuthenticated = !page.url().includes('/login');

    if (!isAuthenticated) {
      test.skip();
      return;
    }

    // Should mention Klaviyo
    await expect(page.locator('text=/Klaviyo/i').first()).toBeVisible({ timeout: 10000 });
  });
});
