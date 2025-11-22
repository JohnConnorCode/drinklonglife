#!/usr/bin/env node

/**
 * Test Checkout Flow
 *
 * Tests the entire checkout flow including:
 * - Checkout API endpoint
 * - Inventory reservation system
 * - Stripe session creation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCheckoutAPI() {
  console.log('\n🔍 Testing Checkout API Endpoint...\n');

  // Get a product variant to test with
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('id, stripe_price_id, label, track_inventory, stock_quantity, products:product_id (name)')
    .eq('is_active', true)
    .eq('track_inventory', true)
    .gt('stock_quantity', 5)
    .limit(1)
    .single();

  if (variantError || !variant) {
    console.error('❌ No suitable product variant found for testing');
    console.error('   Need a variant with track_inventory=true and stock_quantity>5');
    return false;
  }

  console.log(`✅ Found test variant: ${variant.products?.name} - ${variant.label}`);
  console.log(`   Price ID: ${variant.stripe_price_id}`);
  console.log(`   Current stock: ${variant.stock_quantity}\n`);

  // Test 1: Call checkout API
  console.log('📦 Test 1: Creating checkout session...');
  try {
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        items: [
          {
            priceId: variant.stripe_price_id,
            quantity: 1,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Checkout API failed: ${data.error || 'Unknown error'}`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Details:`, data);
      return false;
    }

    if (!data.url || !data.sessionId) {
      console.error('❌ Checkout API returned success but missing url or sessionId');
      console.error(`   Response:`, data);
      return false;
    }

    console.log(`✅ Checkout session created successfully`);
    console.log(`   Session ID: ${data.sessionId}`);
    console.log(`   Stripe URL: ${data.url.substring(0, 50)}...`);

    // Test 2: Verify inventory was reserved
    console.log('\n🔍 Test 2: Verifying inventory reservation...');
    const { data: reservation, error: reservationError } = await supabase
      .from('inventory_reservations')
      .select('*')
      .eq('checkout_session_id', data.sessionId)
      .single();

    if (reservationError || !reservation) {
      console.error('❌ Inventory reservation not found');
      console.error(`   Error:`, reservationError);
      return false;
    }

    console.log(`✅ Inventory reservation created`);
    console.log(`   Variant ID: ${reservation.variant_id}`);
    console.log(`   Quantity: ${reservation.quantity}`);
    console.log(`   Reserved at: ${reservation.reserved_at}`);
    console.log(`   Expires at: ${reservation.expires_at}`);

    // Test 3: Verify available stock decreased
    console.log('\n🔍 Test 3: Verifying available stock calculation...');
    const { data: availableStock, error: stockError } = await supabase
      .rpc('get_available_stock', {
        p_variant_id: variant.id,
      });

    if (stockError) {
      console.error('❌ Failed to get available stock');
      console.error(`   Error:`, stockError);
      return false;
    }

    const expectedAvailable = variant.stock_quantity - 1;
    if (availableStock !== expectedAvailable) {
      console.error(`❌ Available stock mismatch`);
      console.error(`   Expected: ${expectedAvailable}`);
      console.error(`   Actual: ${availableStock}`);
      return false;
    }

    console.log(`✅ Available stock correctly calculated`);
    console.log(`   Physical stock: ${variant.stock_quantity}`);
    console.log(`   Reserved: 1`);
    console.log(`   Available: ${availableStock}`);

    // Test 4: Release reservation
    console.log('\n🔍 Test 4: Releasing reservation...');
    const { error: releaseError } = await supabase.rpc('release_reservation', {
      p_session_id: data.sessionId,
    });

    if (releaseError) {
      console.error('❌ Failed to release reservation');
      console.error(`   Error:`, releaseError);
      return false;
    }

    console.log(`✅ Reservation released successfully`);

    // Test 5: Verify reservation marked as released
    const { data: releasedReservation } = await supabase
      .from('inventory_reservations')
      .select('released, released_at')
      .eq('checkout_session_id', data.sessionId)
      .single();

    if (!releasedReservation || !releasedReservation.released) {
      console.error('❌ Reservation not marked as released');
      return false;
    }

    console.log(`✅ Reservation marked as released in database`);
    console.log(`   Released at: ${releasedReservation.released_at}`);

    // Test 6: Verify stock back to original
    const { data: finalStock } = await supabase
      .rpc('get_available_stock', {
        p_variant_id: variant.id,
      });

    if (finalStock !== variant.stock_quantity) {
      console.error(`❌ Stock not restored after release`);
      console.error(`   Expected: ${variant.stock_quantity}`);
      console.error(`   Actual: ${finalStock}`);
      return false;
    }

    console.log(`✅ Stock restored to original level: ${finalStock}`);

    return true;
  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
    return false;
  }
}

async function testConcurrentCheckout() {
  console.log('\n🔍 Testing Concurrent Checkout (Race Condition Prevention)...\n');

  // Find a variant with only 1 item in stock
  const { data: variant } = await supabase
    .from('product_variants')
    .select('id, stripe_price_id, label, track_inventory, stock_quantity, products:product_id (name)')
    .eq('is_active', true)
    .eq('track_inventory', true)
    .gte('stock_quantity', 1)
    .lte('stock_quantity', 3)
    .limit(1)
    .single();

  if (!variant) {
    console.log('⚠️  Skipping concurrent checkout test - no suitable variant found');
    console.log('   Need a variant with stock_quantity between 1-3');
    return true; // Don't fail the entire test
  }

  console.log(`✅ Found test variant: ${variant.products?.name} - ${variant.label}`);
  console.log(`   Current stock: ${variant.stock_quantity}\n`);

  // Set stock to exactly 1 for this test
  await supabase
    .from('product_variants')
    .update({ stock_quantity: 1 })
    .eq('id', variant.id);

  console.log('📦 Attempting two simultaneous checkouts for the same last item...');

  // Attempt two simultaneous checkouts
  const checkout1 = fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify({
      items: [{ priceId: variant.stripe_price_id, quantity: 1 }],
    }),
  });

  const checkout2 = fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.2',
    },
    body: JSON.stringify({
      items: [{ priceId: variant.stripe_price_id, quantity: 1 }],
    }),
  });

  const [response1, response2] = await Promise.all([checkout1, checkout2]);
  const [data1, data2] = await Promise.all([response1.json(), response2.json()]);

  const success1 = response1.ok;
  const success2 = response2.ok;

  // Exactly ONE should succeed, ONE should fail
  if (success1 && success2) {
    console.error('❌ RACE CONDITION: Both checkouts succeeded!');
    console.error('   This means inventory locking is NOT working');

    // Cleanup
    if (data1.sessionId) {
      await supabase.rpc('release_reservation', { p_session_id: data1.sessionId });
    }
    if (data2.sessionId) {
      await supabase.rpc('release_reservation', { p_session_id: data2.sessionId });
    }

    // Restore stock
    await supabase
      .from('product_variants')
      .update({ stock_quantity: variant.stock_quantity })
      .eq('id', variant.id);

    return false;
  }

  if (!success1 && !success2) {
    console.error('❌ Both checkouts failed (expected one to succeed)');
    console.error('   Response 1:', data1);
    console.error('   Response 2:', data2);
    return false;
  }

  console.log('✅ Atomic locking working correctly');
  console.log(`   Checkout 1: ${success1 ? 'SUCCESS' : 'FAILED (insufficient stock)'}`);
  console.log(`   Checkout 2: ${success2 ? 'SUCCESS' : 'FAILED (insufficient stock)'}`);

  // Cleanup - release the successful reservation
  const successfulSession = success1 ? data1.sessionId : data2.sessionId;
  await supabase.rpc('release_reservation', { p_session_id: successfulSession });

  // Restore original stock
  await supabase
    .from('product_variants')
    .update({ stock_quantity: variant.stock_quantity })
    .eq('id', variant.id);

  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  CHECKOUT FLOW TEST SUITE');
  console.log('═══════════════════════════════════════════');

  let allPassed = true;

  // Test 1: Basic checkout flow
  const test1Passed = await testCheckoutAPI();
  allPassed = allPassed && test1Passed;

  // Test 2: Concurrent checkout
  const test2Passed = await testConcurrentCheckout();
  allPassed = allPassed && test2Passed;

  console.log('\n═══════════════════════════════════════════');
  if (allPassed) {
    console.log('  ✅ ALL TESTS PASSED');
  } else {
    console.log('  ❌ SOME TESTS FAILED');
  }
  console.log('═══════════════════════════════════════════\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
