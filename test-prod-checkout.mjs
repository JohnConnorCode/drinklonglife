import { chromium } from 'playwright';

(async () => {
  console.log('🧪 Testing production checkout at https://drinklonglife.com');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('\n1️⃣  Navigating to https://drinklonglife.com/blends...');
    await page.goto('https://drinklonglife.com/blends', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('2️⃣  Finding first blend...');
    const blendCard = page.locator('a[href^="/blends/"]').first();
    const blendUrl = await blendCard.getAttribute('href');
    console.log(`   Found blend: ${blendUrl}`);

    await blendCard.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log(`   Loaded: ${page.url()}`);

    console.log('3️⃣  Looking for "Reserve Now" button...');
    const reserveButton = page.locator('button:has-text("Reserve Now")').first();
    await reserveButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Found "Reserve Now" button');

    console.log('4️⃣  Clicking "Reserve Now"...');
    await reserveButton.click();

    console.log('5️⃣  Waiting for redirect...');
    await page.waitForTimeout(12000);

    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);

    if (finalUrl.includes('stripe.com') || finalUrl.includes('checkout.stripe.com')) {
      console.log('\n✅ SUCCESS - Production checkout redirected to Stripe!');
      console.log('   Checkout is WORKING! 🎉\n');
      process.exit(0);
    } else {
      console.log('\n❌ FAILED - Did NOT redirect to Stripe');
      console.log(`   Still on: ${finalUrl}`);

      const pageText = await page.textContent('body').catch(() => '');
      if (pageText.includes('Failed to create checkout session')) {
        console.log('   ERROR: "Failed to create checkout session" found on page');
      }

      await page.screenshot({ path: '/tmp/checkout-test-failed.png' });
      console.log('   Screenshot saved to /tmp/checkout-test-failed.png\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: '/tmp/checkout-test-error.png' }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
