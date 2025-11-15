#!/usr/bin/env node
import fetch from 'node-fetch';

console.log('🧪 Testing product pages...\n');

async function testPage(url, description) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);

    const response = await fetch(url);
    const html = await response.text();

    // Check for "Reserve Now" OR "Add to Cart" button
    const hasReserveButton = html.includes('Reserve Now') || html.includes('Add to Cart');

    // Check for product pricing
    const hasPricing = html.includes('$48') || html.includes('$28') || html.includes('$6');

    // Check for errors
    const hasError = html.includes('Error fetching') || html.includes('PGRST116');

    console.log(`  Status: ${response.status}`);
    console.log(`  Has "Reserve Now" button: ${hasReserveButton ? '✅' : '❌'}`);
    console.log(`  Has pricing: ${hasPricing ? '✅' : '❌'}`);
    console.log(`  Has errors: ${hasError ? '❌ YES' : '✅ NO'}`);
    console.log('');

    return { url, hasReserveButton, hasPricing, hasError, status: response.status };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}\n`);
    return { url, error: error.message };
  }
}

const results = [];

// Test main blends page
results.push(await testPage('http://localhost:3000/blends', 'Blends listing page'));

// Test individual blend pages
results.push(await testPage('http://localhost:3000/blends/green-bomb', 'Green Bomb product page'));
results.push(await testPage('http://localhost:3000/blends/red-bomb', 'Red Bomb product page'));
results.push(await testPage('http://localhost:3000/blends/yellow-bomb', 'Yellow Bomb product page'));

// Test pricing page
results.push(await testPage('http://localhost:3000/pricing', 'Pricing page'));

console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const successful = results.filter(r => r.hasReserveButton && r.hasPricing && !r.hasError).length;
const total = results.length;

console.log(`\n✅ ${successful}/${total} pages loaded correctly`);

if (successful < total) {
  console.log('\n❌ Issues found:');
  results.forEach(r => {
    if (!r.hasReserveButton || !r.hasPricing || r.hasError) {
      console.log(`  - ${r.url}`);
      if (!r.hasReserveButton) console.log(`     Missing "Reserve Now" button`);
      if (!r.hasPricing) console.log(`     Missing pricing`);
      if (r.hasError) console.log(`     Has errors`);
    }
  });
} else {
  console.log('\n🎉 All pages loaded successfully!');
}
