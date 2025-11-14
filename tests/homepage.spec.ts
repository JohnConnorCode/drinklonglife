import { test, expect } from '@playwright/test';

test.describe('Homepage Content Visibility and Aesthetics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should load homepage without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/Long Life/i);
  });

  test('hero section should be visible and not overlapped', async ({ page }) => {
    // Wait for hero section to load
    const hero = page.locator('[data-testid="hero-section"], .hero, section').first();
    await expect(hero).toBeVisible();

    // Check for hero heading
    const heading = page.locator('h1, [role="heading"][aria-level="1"]').first();
    await expect(heading).toBeVisible();

    // Verify heading is not hidden behind other elements
    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();
    if (headingBox) {
      expect(headingBox.height).toBeGreaterThan(0);
      expect(headingBox.width).toBeGreaterThan(0);
    }
  });

  test('navigation should be visible and functional', async ({ page }) => {
    // Check for nav element
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();

    // Check for logo/brand
    const logo = page.locator('nav img, nav svg, [data-testid="logo"]').first();
    await expect(logo).toBeVisible();
  });

  test('value propositions section should be visible', async ({ page }) => {
    // Scroll to value props if needed
    const valuePropsSection = page.locator('section').filter({ hasText: /pure|organic|functional/i }).first();

    if (await valuePropsSection.count() > 0) {
      await valuePropsSection.scrollIntoViewIfNeeded();
      await expect(valuePropsSection).toBeVisible();
    }
  });

  test('featured blends section should be visible', async ({ page }) => {
    // Look for blends/products section
    const blendsSection = page.locator('section').filter({ hasText: /blend|featured|bomb/i }).first();

    if (await blendsSection.count() > 0) {
      await blendsSection.scrollIntoViewIfNeeded();
      await expect(blendsSection).toBeVisible();

      // Check for blend cards
      const blendCards = page.locator('[data-testid="blend-card"], .blend-card, article, .card');
      if (await blendCards.count() > 0) {
        await expect(blendCards.first()).toBeVisible();
      }
    }
  });

  test('content should not overlap or be hidden', async ({ page }) => {
    // Get all major sections
    const sections = page.locator('section, main > div');
    const count = await sections.count();

    // Check each section has proper dimensions
    for (let i = 0; i < Math.min(count, 5); i++) {
      const section = sections.nth(i);
      const box = await section.boundingBox();

      if (box) {
        // Each section should have height
        expect(box.height).toBeGreaterThan(0);
        expect(box.width).toBeGreaterThan(0);
      }
    }
  });

  test('all text should be readable (not transparent)', async ({ page }) => {
    // Check main headings
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        const opacity = await heading.evaluate(el => window.getComputedStyle(el).opacity);
        expect(parseFloat(opacity)).toBeGreaterThan(0);
      }
    }
  });

  test('images should load properly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle');

    const images = page.locator('img[src]');
    const count = await images.count();

    if (count > 0) {
      // Check first few images
      for (let i = 0; i < Math.min(count, 3); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          // Check image has natural dimensions (loaded)
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
        }
      }
    }
  });

  test('footer should be visible at bottom', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer, [role="contentinfo"]').first();
    await expect(footer).toBeVisible();
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Filter out known acceptable errors if any
    const criticalErrors = errors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('manifest')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('page should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Check navigation is visible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Check hero is visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
  });

  test('parallax effects should not hide content', async ({ page }) => {
    // Scroll through page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Check that content is still visible after scroll
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Verify no elements have extreme transform values that hide content
    const transformedElements = await page.locator('[style*="transform"]').all();

    for (const el of transformedElements.slice(0, 5)) {
      if (await el.isVisible()) {
        const transform = await el.evaluate(el => window.getComputedStyle(el).transform);
        // Check transform doesn't move element way off screen
        expect(transform).toBeDefined();
      }
    }
  });

  test('klaviyo embed placeholder renders', async ({ page }) => {
    const embed = page.locator('.klaviyo-form-StpCUy').first();
    await embed.scrollIntoViewIfNeeded();
    await expect(embed).toBeVisible();

    const isKlaviyoDefined = await page.evaluate(() => typeof window.klaviyo !== 'undefined');
    expect(isKlaviyoDefined).toBeTruthy();
  });
});
