import { test, expect } from '@playwright/test';

/**
 * Diagnostic test to check what data is available on production blend pages
 */

const PRODUCTION_URL = 'https://drinklonglife.com';

test.describe('Production Diagnostic - Blend Page Data', () => {
  test('should check green-bomb page HTML and data', async ({ page }) => {
    // Navigate to a blend page
    await page.goto(`${PRODUCTION_URL}/blends/green-bomb`);
    await page.waitForLoadState('networkidle');

    // Get the entire page content
    const htmlContent = await page.content();

    // Check for various button types
    const hasAddToCart = htmlContent.includes('Add to Cart');
    const hasReserveBlend = htmlContent.includes('Reserve Blend') || htmlContent.includes('Reserve this Blend');

    console.log('=== GREEN BOMB PAGE DIAGNOSTIC ===');
    console.log('Has "Add to Cart" button:', hasAddToCart);
    console.log('Has "Reserve Blend" button:', hasReserveBlend);

    // Check for AddToCartButton component in DOM
    const addToCartButtons = await page.locator('button:has-text("Add to Cart")').count();
    const reserveButtons = await page.locator('button:has-text("Reserve"), a:has-text("Reserve")').count();

    console.log('Add to Cart button count:', addToCartButtons);
    console.log('Reserve button count:', reserveButtons);

    // Get all button text on page
    const allButtons = await page.locator('button, a[class*="button"]').allTextContents();
    console.log('All buttons on page:', allButtons);

    // Check if there are any pricing elements
    const priceElements = await page.locator('[class*="price"], [class*="Price"]').count();
    console.log('Price elements count:', priceElements);

    // Log the current URL
    console.log('Current URL:', page.url());

    // This test always passes - it's just for diagnostics
    expect(true).toBe(true);
  });

  test('should check red-bomb page HTML and data', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/blends/red-bomb`);
    await page.waitForLoadState('networkidle');

    const htmlContent = await page.content();

    const hasAddToCart = htmlContent.includes('Add to Cart');
    const hasReserveBlend = htmlContent.includes('Reserve Blend') || htmlContent.includes('Reserve this Blend');

    console.log('=== RED BOMB PAGE DIAGNOSTIC ===');
    console.log('Has "Add to Cart" button:', hasAddToCart);
    console.log('Has "Reserve Blend" button:', hasReserveBlend);

    const addToCartButtons = await page.locator('button:has-text("Add to Cart")').count();
    const reserveButtons = await page.locator('button:has-text("Reserve"), a:has-text("Reserve")').count();

    console.log('Add to Cart button count:', addToCartButtons);
    console.log('Reserve button count:', reserveButtons);

    // Get all button text on page
    const allButtons = await page.locator('button, a[class*="button"]').allTextContents();
    console.log('All buttons on page:', allButtons);

    expect(true).toBe(true);
  });

  test('should check blends list page', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/blends`);
    await page.waitForLoadState('networkidle');

    console.log('=== BLENDS LIST PAGE ===');
    console.log('URL:', page.url());

    // Check if blends are listed
    const blendLinks = await page.locator('a[href*="/blends/"]').count();
    console.log('Blend links found:', blendLinks);

    // Get first few blend links
    const firstBlends = await page.locator('a[href*="/blends/"]').first().getAttribute('href');
    console.log('First blend link:', firstBlends);

    expect(true).toBe(true);
  });
});
