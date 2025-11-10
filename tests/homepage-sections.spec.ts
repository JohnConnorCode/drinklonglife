import { test, expect } from '@playwright/test';

test('homepage sections screenshots', async ({ page }) => {
  await page.goto('/');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for animations

  // Scroll to newsletter section
  await page.evaluate(() => {
    document.querySelector('#newsletter')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await page.waitForTimeout(1500);

  // Screenshot newsletter section with parallax images
  await page.screenshot({
    path: 'test-results/newsletter-section.png',
    fullPage: false
  });

  // Scroll to process section
  await page.evaluate(() => {
    const processHeading = Array.from(document.querySelectorAll('h2')).find(
      h => h.textContent?.includes('How We Make It')
    );
    processHeading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(1500);

  // Screenshot process section
  await page.screenshot({
    path: 'test-results/process-section.png',
    fullPage: false
  });

  // Full homepage screenshot
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: 'test-results/homepage-full.png',
    fullPage: true
  });

  console.log('Screenshots saved to test-results/');
});
