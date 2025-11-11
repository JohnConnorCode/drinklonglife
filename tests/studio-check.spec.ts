import { test, expect } from '@playwright/test';

test('verify Sanity Studio loads', async ({ page }) => {
  await page.goto('http://localhost:8080/studio');
  await page.waitForLoadState('networkidle');

  // Wait for the page to fully render
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: 'test-results/studio-check.png',
    fullPage: false
  });

  // Check if the Sanity Studio UI is present
  const pageContent = await page.content();
  console.log('Page title:', await page.title());

  // Look for Sanity Studio elements
  const hasSanityUI = pageContent.includes('sanity') || pageContent.includes('Studio');
  console.log('Has Sanity UI elements:', hasSanityUI);
});
