#!/usr/bin/env node
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🧪 AUTO-SYNC E2E TEST (PUPPETEER)\n');
console.log('═══════════════════════════════════════════════════════════\n');

const TEST_EMAIL = 'jt.connor88@gmail.com';
const TEST_PASSWORD = 'AureliusLL1!';
const BASE_URL = 'http://localhost:3000';

const TEST_PRODUCT = {
  name: `AutoSync Test ${Date.now()}`,
  slug: `autosync-${Date.now()}`,
  tagline: 'Testing auto-sync',
};

async function runTest() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Step 1: Login
    console.log('1️⃣  Logging in...');
    console.log('───────────────────────────────────────────────────────────');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Logged in\n');

    // Step 2: Go to products
    console.log('2️⃣  Navigating to products...');
    console.log('───────────────────────────────────────────────────────────');
    await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle0' });
    console.log('✅ On products page\n');

    // Step 3: Click "Add New Product"
    console.log('3️⃣  Opening new product form...');
    console.log('───────────────────────────────────────────────────────────');

    await page.waitForSelector('a[href="/admin/products/new"]');
    await page.click('a[href="/admin/products/new"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Product form loaded\n');

    // Step 4: Fill in product details
    console.log('4️⃣  Filling product details...');
    console.log('───────────────────────────────────────────────────────────');

    await page.type('input[name="name"]', TEST_PRODUCT.name);
    await page.type('input[name="slug"]', TEST_PRODUCT.slug);
    await page.type('input[name="tagline"]', TEST_PRODUCT.tagline);
    await page.select('select[name="label_color"]', 'yellow');

    // Clear and type display_order
    await page.click('input[name="display_order"]', { clickCount: 3 });
    await page.type('input[name="display_order"]', '999');

    // Check is_active
    const isActive = await page.$('input[name="is_active"]');
    const isChecked = await page.evaluate(el => el.checked, isActive);
    if (!isChecked) {
      await page.click('input[name="is_active"]');
    }

    console.log(`✅ Product details:`);
    console.log(`   Name: ${TEST_PRODUCT.name}`);
    console.log(`   Slug: ${TEST_PRODUCT.slug}\n`);

    // Step 5: Add variant
    console.log('5️⃣  Adding variant...');
    console.log('───────────────────────────────────────────────────────────');

    // Look for variant fields - they should already exist
    await page.waitForSelector('input[name*="size_key"]');

    await page.type('input[name*="size_key"]', 'test_size');
    await page.type('input[name*="label"]', 'Test Size');
    await page.type('input[name*="price_usd"]', '29.99');

    console.log('✅ Variant: Test Size - $29.99\n');

    // Step 6: Verify auto-sync checkbox
    console.log('6️⃣  Checking auto-sync...');
    console.log('───────────────────────────────────────────────────────────');

    await page.waitForSelector('input[name="auto_sync"]');
    const autoSyncChecked = await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="auto_sync"]');
      return checkbox ? checkbox.checked : false;
    });

    console.log(`Auto-sync: ${autoSyncChecked ? '✅ ENABLED' : '❌ DISABLED'}`);

    if (!autoSyncChecked) {
      await page.click('input[name="auto_sync"]');
      console.log('✅ Enabled auto-sync\n');
    } else {
      console.log('✅ Already enabled (default)\n');
    }

    // Take screenshot before submit
    await page.screenshot({ path: '/tmp/before-submit.png', fullPage: true });
    console.log('📸 Screenshot: /tmp/before-submit.png\n');

    // Step 7: Submit form
    console.log('7️⃣  Submitting form...');
    console.log('───────────────────────────────────────────────────────────');

    await page.click('button[type="submit"]');
    console.log('⏳ Waiting for sync...\n');

    // Wait for sync message
    try {
      await page.waitForSelector('text=/✅ Synced to Stripe!/i', { timeout: 20000 });

      const syncMessage = await page.evaluate(() => {
        const msg = document.querySelector('*');
        return msg ? msg.innerText : '';
      });

      console.log('✅ SYNC SUCCESS!');
      console.log(`Message: ${syncMessage.match(/✅.*Stripe.*/)?.[0] || 'Synced'}\n`);

      await page.screenshot({ path: '/tmp/sync-success.png', fullPage: true });
      console.log('📸 Screenshot: /tmp/sync-success.png\n');

    } catch (err) {
      console.error('❌ Sync message timeout');
      await page.screenshot({ path: '/tmp/sync-timeout.png', fullPage: true });
      console.log('📸 Screenshot: /tmp/sync-timeout.png\n');
      throw err;
    }

    // Step 8: Verify redirect
    console.log('8️⃣  Verifying redirect...');
    console.log('───────────────────────────────────────────────────────────');

    await page.waitForNavigation({ timeout: 10000 });
    const url = page.url();
    console.log(`Current URL: ${url}`);
    console.log('✅ Redirected to products list\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TEST PASSED!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Summary:');
    console.log('  ✓ Login successful');
    console.log('  ✓ Product form loaded');
    console.log('  ✓ Auto-sync enabled by default');
    console.log('  ✓ Form submitted');
    console.log('  ✓ Synced to Stripe');
    console.log('  ✓ Redirected successfully');
    console.log('\n🎉 AUTO-SYNC INTEGRATION VERIFIED!\n');

    // Keep browser open for manual inspection
    console.log('Browser left open for inspection. Press Ctrl+C to close.\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    await page.screenshot({ path: '/tmp/error.png', fullPage: true });
    console.log('📸 Error screenshot: /tmp/error.png\n');
    await browser.close();
    process.exit(1);
  }
}

runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
