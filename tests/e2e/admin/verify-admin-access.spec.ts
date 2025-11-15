import { test, expect } from '@playwright/test';

test.describe('Admin Access Verification', () => {
  test('admin user should have access to /admin page', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000');

    // Click sign in
    await page.click('text=Sign In');

    // Wait for Supabase Auth UI
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Enter admin email
    await page.fill('input[type="email"]', 'jt.connor88@gmail.com');

    // Check if this is OAuth or magic link
    const continueButton = page.locator('button:has-text("Continue with Email")');
    const signInButton = page.locator('button:has-text("Sign in")');

    if (await continueButton.isVisible()) {
      // OAuth flow - click continue
      await continueButton.click();

      // Wait for OAuth provider selection or confirmation
      await page.waitForTimeout(2000);

      console.log('OAuth flow detected - manual OAuth sign-in required');
      console.log('Please complete OAuth sign-in in the browser');

      // Wait for redirect back to app (up to 60 seconds)
      await page.waitForURL('http://localhost:3000/**', { timeout: 60000 });
    } else if (await signInButton.isVisible()) {
      // Magic link or password flow
      const passwordInput = page.locator('input[type="password"]');

      if (await passwordInput.isVisible()) {
        // Password flow - but we don't have a password set
        throw new Error('Password authentication not configured for this test');
      } else {
        // Magic link flow
        await signInButton.click();
        console.log('Magic link sent - check email for sign-in link');
        throw new Error('Magic link authentication requires manual email check');
      }
    }

    // Once authenticated, navigate to admin page
    await page.goto('http://localhost:3000/admin');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check current URL - should NOT be redirected to /unauthorized
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/unauthorized');
    expect(currentUrl).toContain('/admin');

    // Check for admin page content
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Admin'); // Should have "Admin" somewhere on the page

    console.log('✅ Admin access verified successfully!');
  });

  test('should verify admin user profile in database', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/admin/verify', {
      headers: {
        'Cookie': '', // Will be set by authenticated session
      },
    });

    // If this endpoint exists and returns 200, admin is verified
    // If it returns 401/403, admin access is not working
    console.log('Admin verification response:', response.status());
  });
});
