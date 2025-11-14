#!/usr/bin/env node

import { chromium } from '@playwright/test';

async function testProductionCheckout() {
  console.log('🧪 Testing Production Checkout with Screenshots\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Navigate to production site
    console.log('📍 Navigating to https://drinklonglife.com/blends/green-bomb...');
    await page.goto('https://drinklonglife.com/blends/green-bomb', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take initial screenshot
    await page.screenshot({
      path: 'test-results/1-blend-page.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved: test-results/1-blend-page.png');

    // Wait for the page to load
    await page.waitForTimeout(2000);

    // Find and click subscription toggle
    console.log('\n📍 Looking for subscription toggle...');

    // Try to find the subscribe button/toggle
    const subscribeButton = await page.locator('button:has-text("Subscribe"), button:has-text("Subscription")').first();

    if (await subscribeButton.isVisible()) {
      console.log('✓ Found subscription toggle, clicking...');
      await subscribeButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'test-results/2-subscription-selected.png',
        fullPage: true
      });
      console.log('✓ Screenshot saved: test-results/2-subscription-selected.png');
    }

    // Find and click "Reserve Your Blend" button
    console.log('\n📍 Looking for Reserve button...');
    const reserveButton = await page.locator('button:has-text("Reserve")').first();

    if (await reserveButton.isVisible()) {
      console.log('✓ Found Reserve button, clicking...');

      // Set up a listener for the navigation
      const navigationPromise = page.waitForURL('**/checkout.stripe.com/**', {
        timeout: 10000
      }).catch(() => null);

      await reserveButton.click();

      // Wait a bit for the checkout to process
      await page.waitForTimeout(3000);

      // Check current URL
      const currentUrl = page.url();
      console.log(`\n📍 Current URL: ${currentUrl}`);

      if (currentUrl.includes('checkout.stripe.com')) {
        console.log('✅ SUCCESS! Redirected to Stripe Checkout');
        await page.screenshot({
          path: 'test-results/3-stripe-checkout.png',
          fullPage: true
        });
        console.log('✓ Screenshot saved: test-results/3-stripe-checkout.png');
      } else if (currentUrl.includes('error')) {
        console.log('❌ FAILED! Redirected to error page');
        await page.screenshot({
          path: 'test-results/3-error-page.png',
          fullPage: true
        });
        console.log('✓ Screenshot saved: test-results/3-error-page.png');
      } else {
        console.log('⚠️  Still on the same page, checking for errors...');
        await page.screenshot({
          path: 'test-results/3-no-redirect.png',
          fullPage: true
        });
        console.log('✓ Screenshot saved: test-results/3-no-redirect.png');
      }
    } else {
      console.log('❌ Could not find Reserve button');
      await page.screenshot({
        path: 'test-results/error-no-button.png',
        fullPage: true
      });
    }

    // Test one-time purchase too
    console.log('\n\n📍 Testing ONE-TIME purchase...');
    await page.goto('https://drinklonglife.com/blends/green-bomb', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Look for one-time toggle
    const oneTimeButton = await page.locator('button:has-text("One-time"), button:has-text("One time")').first();

    if (await oneTimeButton.isVisible()) {
      console.log('✓ Found one-time toggle, clicking...');
      await oneTimeButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'test-results/4-onetime-selected.png',
        fullPage: true
      });
      console.log('✓ Screenshot saved: test-results/4-onetime-selected.png');
    }

    const reserveButton2 = await page.locator('button:has-text("Reserve")').first();
    if (await reserveButton2.isVisible()) {
      console.log('✓ Clicking Reserve for one-time purchase...');
      await reserveButton2.click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (currentUrl.includes('checkout.stripe.com')) {
        console.log('✅ SUCCESS! One-time checkout works');
        await page.screenshot({
          path: 'test-results/5-onetime-stripe-checkout.png',
          fullPage: true
        });
        console.log('✓ Screenshot saved: test-results/5-onetime-stripe-checkout.png');
      }
    }

    console.log('\n════════════════════════════════════════');
    console.log('✓ Test complete! Check test-results/ folder for screenshots');
    console.log('════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({
      path: 'test-results/error.png',
      fullPage: true
    });
    console.log('✓ Error screenshot saved: test-results/error.png');
  } finally {
    await page.waitForTimeout(3000); // Keep browser open for a moment
    await browser.close();
  }
}

testProductionCheckout().catch(console.error);
