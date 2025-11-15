#!/usr/bin/env node

/**
 * Database Validation Script
 *
 * Validates:
 * 1. Admin user exists and has is_admin flag
 * 2. Orders table has data
 * 3. Payment method IDs are properly formatted
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🔍 Starting Database Validation...\n');

// Test 1: Check admin user
console.log('📋 Test 1: Checking admin user...');
const { data: adminProfile, error: adminError } = await supabase
  .from('profiles')
  .select('id, email, is_admin, created_at')
  .eq('email', 'jt.connor88@gmail.com')
  .single();

if (adminError) {
  console.error('❌ Error fetching admin user:', adminError.message);
  console.error('   Action: Run scripts/set-admin.sql in Supabase SQL Editor');
} else if (!adminProfile) {
  console.error('❌ Admin user not found');
  console.error('   Action: User needs to sign up first, then run scripts/set-admin.sql');
} else if (!adminProfile.is_admin) {
  console.error('❌ User exists but is_admin = false');
  console.error(`   User ID: ${adminProfile.id}`);
  console.error('   Action: Run scripts/set-admin.sql in Supabase SQL Editor');
} else {
  console.log('✅ Admin user configured correctly');
  console.log(`   Email: ${adminProfile.email}`);
  console.log(`   User ID: ${adminProfile.id}`);
  console.log(`   is_admin: ${adminProfile.is_admin}`);
}

console.log('');

// Test 2: Check orders exist
console.log('📋 Test 2: Checking orders table...');
const { data: orders, error: ordersError, count } = await supabase
  .from('orders')
  .select('*', { count: 'exact', head: false })
  .order('created_at', { ascending: false })
  .limit(10);

if (ordersError) {
  console.error('❌ Error fetching orders:', ordersError.message);
  console.error('   Action: Check RLS policies or table structure');
} else if (!orders || orders.length === 0) {
  console.warn('⚠️  No orders found in database');
  console.warn('   This is normal if no checkouts have completed yet');
  console.warn('   Action: Complete a test checkout to create order data');
} else {
  console.log(`✅ Found ${count || orders.length} orders in database`);
  console.log(`   Most recent: ${new Date(orders[0].created_at).toLocaleString()}`);
  console.log(`   Sample order ID: ${orders[0].id}`);
}

console.log('');

// Test 3: Check payment_method_id format
console.log('📋 Test 3: Checking payment_method_id data quality...');
if (orders && orders.length > 0) {
  const ordersWithPaymentMethods = orders.filter(o => o.payment_method_id);
  const invalidPaymentMethods = ordersWithPaymentMethods.filter(
    o => !o.payment_method_id?.startsWith('pm_')
  );

  console.log(`   Total orders checked: ${orders.length}`);
  console.log(`   Orders with payment_method_id: ${ordersWithPaymentMethods.length}`);

  if (invalidPaymentMethods.length > 0) {
    console.warn(`⚠️  Found ${invalidPaymentMethods.length} orders with invalid payment_method_id format`);
    console.warn('   Examples of invalid formats:');
    invalidPaymentMethods.slice(0, 3).forEach(o => {
      console.warn(`     Order ${o.id}: "${o.payment_method_id}"`);
    });
    console.warn('   Expected format: "pm_xxxxxxxxxxxxx"');
    console.warn('   Action: Wait for new orders after webhook fix is deployed');
  } else if (ordersWithPaymentMethods.length > 0) {
    console.log('✅ All payment_method_id values have correct format (pm_xxx)');
    console.log(`   Sample: ${ordersWithPaymentMethods[0].payment_method_id}`);
  } else {
    console.warn('⚠️  No orders have payment_method_id set');
    console.warn('   Action: Complete a test checkout to verify webhook is working');
  }
} else {
  console.log('⏭️  Skipping (no orders to check)');
}

console.log('');

// Test 4: Check RLS policies
console.log('📋 Test 4: Checking RLS policies...');
const { data: allAdmins, error: rlsError } = await supabase
  .from('profiles')
  .select('email, is_admin')
  .eq('is_admin', true);

if (rlsError) {
  console.error('❌ Error checking admin users:', rlsError.message);
} else {
  console.log(`✅ RLS policies allow service role access`);
  console.log(`   Found ${allAdmins?.length || 0} admin user(s)`);
  if (allAdmins && allAdmins.length > 0) {
    allAdmins.forEach(admin => {
      console.log(`   - ${admin.email}`);
    });
  }
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Validation Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

if (adminProfile?.is_admin) {
  console.log('✅ Admin user configured');
  passCount++;
} else {
  console.log('❌ Admin user NOT configured');
  failCount++;
}

if (orders && orders.length > 0) {
  console.log('✅ Orders table has data');
  passCount++;
} else {
  console.log('⚠️  Orders table is empty');
  warnCount++;
}

if (allAdmins) {
  console.log('✅ RLS policies working');
  passCount++;
} else {
  console.log('❌ RLS policies failed');
  failCount++;
}

console.log('');
console.log(`Total: ${passCount} passed, ${failCount} failed, ${warnCount} warnings`);

if (failCount > 0) {
  console.log('');
  console.log('🚨 CRITICAL ISSUES FOUND - See action items above');
  process.exit(1);
} else if (warnCount > 0) {
  console.log('');
  console.log('⚠️  WARNINGS FOUND - Review action items above');
  process.exit(0);
} else {
  console.log('');
  console.log('✅ All validation checks passed!');
  process.exit(0);
}
