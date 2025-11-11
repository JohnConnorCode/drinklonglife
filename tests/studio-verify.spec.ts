import { test, expect } from '@playwright/test';

test('verify Sanity Studio loads without errors', async ({ page }) => {
  // Navigate to studio
  await page.goto('http://localhost:8080/studio');
  await page.waitForLoadState('networkidle');

  // Wait for page to fully render
  await page.waitForTimeout(3000);

  // Take screenshot for verification
  await page.screenshot({
    path: 'test-results/studio-verify.png',
    fullPage: true
  });

  // Get page content and title
  const pageContent = await page.content();
  const pageTitle = await page.title();

  console.log('Page title:', pageTitle);

  // Check that "Tool not found: studio" error is NOT present
  const hasToolError = pageContent.includes('Tool not found: studio');
  console.log('Has "Tool not found" error:', hasToolError);

  // Check for Sanity Studio UI elements
  const hasSanityUI = pageContent.includes('sanity') || pageContent.includes('Studio');
  console.log('Has Sanity UI elements:', hasSanityUI);

  // Check for login provider (indicates Studio loaded correctly)
  const hasLoginProvider = pageContent.includes('Choose login provider') || pageContent.includes('Google') || pageContent.includes('GitHub');
  console.log('Has login provider:', hasLoginProvider);

  // Assertions
  expect(hasToolError).toBe(false);
  expect(hasSanityUI).toBe(true);
  expect(hasLoginProvider).toBe(true);

  console.log('✓ Sanity Studio loaded successfully without errors');
});
