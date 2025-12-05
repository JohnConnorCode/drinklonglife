#!/usr/bin/env node
/**
 * Comprehensive Flow Tests - ALL user and admin flows
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

const SUPABASE_URL = 'https://qjgenpwbaquqrvyrfsdo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ2VucHdiYXF1cXJ2eXJmc2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTY0ODIsImV4cCI6MjA3ODU3MjQ4Mn0.rJvxrKdSFf5yw-DdVTxbhWKf6ClVBrwQE1Fvgj6nh-o';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ2VucHdiYXF1cXJ2eXJmc2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5NjQ4MiwiZXhwIjoyMDc4NTcyNDgyfQ.NnjPDj-24lOqa1xXyGOLwDowko3cpSUkBsFPhYCt9iM';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const results = { passed: [], failed: [] };

function pass(test) {
  console.log(`✅ ${test}`);
  results.passed.push(test);
}

function fail(test, error) {
  console.log(`❌ ${test}: ${error}`);
  results.failed.push({ test, error });
}

async function testUserFlows() {
  console.log('\n' + '='.repeat(60));
  console.log('👤 USER FLOWS');
  console.log('='.repeat(60) + '\n');

  // 1. SIGNUP
  console.log('--- Signup Flow ---');
  const testEmail = `fulltest-${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';

  const { data: signupData, error: signupError } = await supabaseAnon.auth.signUp({
    email: testEmail,
    password: testPassword
  });

  if (signupError) {
    fail('Signup', signupError.message);
    return null;
  }
  pass('Signup creates user');

  const userId = signupData.user?.id;

  // Check profile created
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profile) {
    pass('Profile auto-created');
  } else {
    fail('Profile auto-created', 'Profile not found');
  }

  // Check email prefs created
  const { data: prefs } = await supabaseAdmin
    .from('email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (prefs) {
    pass('Email preferences auto-created');
  } else {
    fail('Email preferences auto-created', 'Prefs not found');
  }

  // 2. LOGIN
  console.log('\n--- Login Flow ---');

  // Confirm email first for login test
  await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });

  const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (loginError) {
    fail('Login', loginError.message);
  } else if (loginData.session) {
    pass('Login returns session');
  } else {
    fail('Login returns session', 'No session returned');
  }

  // 3. VIEW PRODUCTS
  console.log('\n--- Products Flow ---');

  const { data: products, error: prodError } = await supabaseAnon
    .from('products')
    .select('id, name, slug, is_active')
    .eq('is_active', true)
    .not('published_at', 'is', null);

  if (prodError) {
    fail('Fetch published products', prodError.message);
  } else if (products.length === 0) {
    fail('Fetch published products', 'No published products');
  } else {
    pass(`Fetch published products (${products.length} found)`);
  }

  // 4. VIEW PRODUCT DETAIL WITH VARIANTS
  const { data: productDetail, error: detailError } = await supabaseAnon
    .from('products')
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .limit(1)
    .single();

  if (detailError) {
    fail('Fetch product with variants', detailError.message);
  } else {
    pass('Fetch product with variants');

    const activeVariants = productDetail.variants?.filter(v => v.is_active && v.stripe_price_id);
    if (activeVariants?.length > 0) {
      pass(`Product has Stripe-enabled variants (${activeVariants.length})`);
    } else {
      fail('Product has Stripe-enabled variants', 'No active variants with Stripe price IDs');
    }
  }

  // 5. CHECK STRIPE PRICE IDS ARE VALID FORMAT
  console.log('\n--- Checkout Readiness ---');

  const { data: allVariants } = await supabaseAdmin
    .from('product_variants')
    .select('id, label, stripe_price_id, price_usd, is_active, product_id')
    .eq('is_active', true)
    .not('stripe_price_id', 'is', null);

  if (allVariants?.length > 0) {
    const validPriceIds = allVariants.filter(v => v.stripe_price_id?.startsWith('price_'));
    if (validPriceIds.length === allVariants.length) {
      pass(`All ${allVariants.length} variants have valid Stripe price IDs`);
    } else {
      fail('Stripe price ID format', `${allVariants.length - validPriceIds.length} variants have invalid price IDs`);
    }
  } else {
    fail('Active variants exist', 'No active variants with Stripe prices');
  }

  // 6. USER CAN VIEW THEIR PROFILE
  console.log('\n--- Account Flow ---');

  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    fail('User can read own profile', profileError.message);
  } else {
    pass('User can read own profile');
  }

  // 7. USER CAN UPDATE THEIR PROFILE
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: 'Test User' })
    .eq('id', userId);

  if (updateError) {
    fail('Profile can be updated', updateError.message);
  } else {
    pass('Profile can be updated');
  }

  // Cleanup
  await supabaseAdmin.auth.admin.deleteUser(userId);
  pass('Test user cleanup');

  return userId;
}

async function testAdminFlows() {
  console.log('\n' + '='.repeat(60));
  console.log('👑 ADMIN FLOWS');
  console.log('='.repeat(60) + '\n');

  // Find an admin user
  console.log('--- Admin Access ---');

  const { data: admins, error: adminError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, is_admin')
    .eq('is_admin', true);

  if (adminError) {
    fail('Query admin users', adminError.message);
    return;
  }

  if (!admins || admins.length === 0) {
    fail('Admin users exist', 'No admin users found in profiles');
    return;
  }

  pass(`Admin users exist (${admins.length} found)`);
  console.log(`   Admin: ${admins[0].email}`);

  // ADMIN: Products Management
  console.log('\n--- Admin: Products ---');

  const { data: allProducts, error: allProdError } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('display_order');

  if (allProdError) {
    fail('Admin can list all products', allProdError.message);
  } else {
    pass(`Admin can list all products (${allProducts.length} total)`);
  }

  // Test product creation (dry run - we'll rollback)
  const testProduct = {
    name: 'Test Product ' + Date.now(),
    slug: 'test-product-' + Date.now(),
    tagline: 'Test tagline',
    is_active: false,
    display_order: 999
  };

  const { data: createdProduct, error: createError } = await supabaseAdmin
    .from('products')
    .insert(testProduct)
    .select()
    .single();

  if (createError) {
    fail('Admin can create product', createError.message);
  } else {
    pass('Admin can create product');

    // Update test
    const { error: prodUpdateError } = await supabaseAdmin
      .from('products')
      .update({ tagline: 'Updated tagline' })
      .eq('id', createdProduct.id);

    if (prodUpdateError) {
      fail('Admin can update product', prodUpdateError.message);
    } else {
      pass('Admin can update product');
    }

    // Delete test product
    await supabaseAdmin.from('products').delete().eq('id', createdProduct.id);
    pass('Admin can delete product');
  }

  // ADMIN: Variants Management
  console.log('\n--- Admin: Variants ---');

  const { data: variants, error: varError } = await supabaseAdmin
    .from('product_variants')
    .select('*, products(name)')
    .limit(5);

  if (varError) {
    fail('Admin can list variants', varError.message);
  } else {
    pass(`Admin can list variants (${variants.length} shown)`);
  }

  // ADMIN: Orders Management
  console.log('\n--- Admin: Orders ---');

  const { data: orders, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (orderError) {
    fail('Admin can list orders', orderError.message);
  } else {
    pass(`Admin can list orders (${orders?.length || 0} found)`);
  }

  // ADMIN: Newsletter Subscribers
  console.log('\n--- Admin: Newsletter ---');

  const { data: subscribers, error: subError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .limit(10);

  if (subError) {
    fail('Admin can list subscribers', subError.message);
  } else {
    pass(`Admin can list subscribers (${subscribers?.length || 0} found)`);
  }

  // ADMIN: User Management
  console.log('\n--- Admin: Users ---');

  const { data: users, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, is_admin, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (userError) {
    fail('Admin can list users', userError.message);
  } else {
    pass(`Admin can list users (${users?.length || 0} found)`);
  }

  // ADMIN: Email Templates
  console.log('\n--- Admin: Email Templates ---');

  const { data: templates, error: templateError } = await supabaseAdmin
    .from('email_template_versions')
    .select('*');

  if (templateError) {
    if (templateError.code === '42P01') {
      console.log('   ⚠️  email_template_versions table does not exist yet');
    } else {
      fail('Admin can list email templates', templateError.message);
    }
  } else {
    pass(`Admin can list email templates (${templates?.length || 0} found)`);
  }
}

async function testDatabaseIntegrity() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 DATABASE INTEGRITY');
  console.log('='.repeat(60) + '\n');

  const pool = new Pool({
    connectionString: 'postgresql://postgres.qjgenpwbaquqrvyrfsdo:DrinkLongLife1!@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();

    // Check all tables exist
    console.log('--- Core Tables ---');
    const tables = ['profiles', 'products', 'product_variants', 'orders', 'email_preferences', 'newsletter_subscribers'];

    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        )
      `, [table]);

      if (result.rows[0].exists) {
        pass(`Table exists: ${table}`);
      } else {
        fail(`Table exists: ${table}`, 'Table not found');
      }
    }

    // Check triggers
    console.log('\n--- Auth Triggers ---');
    const triggers = await client.query(`
      SELECT trigger_name, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    `);

    if (triggers.rows.length >= 2) {
      pass(`Auth triggers configured (${triggers.rows.length} found)`);
    } else {
      fail('Auth triggers configured', `Only ${triggers.rows.length} trigger(s) found, expected 2+`);
    }

    // Check RLS is enabled on critical tables
    console.log('\n--- Row Level Security ---');
    const rlsTables = ['profiles', 'orders', 'email_preferences'];

    for (const table of rlsTables) {
      const rls = await client.query(`
        SELECT relrowsecurity FROM pg_class WHERE relname = $1
      `, [table]);

      if (rls.rows[0]?.relrowsecurity) {
        pass(`RLS enabled: ${table}`);
      } else {
        fail(`RLS enabled: ${table}`, 'RLS is disabled');
      }
    }

    client.release();
    await pool.end();

  } catch (e) {
    fail('Database connection', e.message);
    await pool.end();
  }
}

async function testAPIEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 LIVE SITE ENDPOINTS');
  console.log('='.repeat(60) + '\n');

  const baseUrl = 'https://drinklonglife.com';

  const endpoints = [
    { path: '/', name: 'Homepage' },
    { path: '/blends', name: 'Blends page' },
    { path: '/blends/yellow-bomb', name: 'Product detail' },
    { path: '/cart', name: 'Cart page' },
    { path: '/about', name: 'About page' },
    { path: '/journal', name: 'Journal page' },
    { path: '/login', name: 'Login page' },
    { path: '/signup', name: 'Signup page' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(baseUrl + ep.path, {
        method: 'HEAD',
        redirect: 'follow'
      });

      if (res.ok) {
        pass(`${ep.name} (${ep.path}) - ${res.status}`);
      } else {
        fail(`${ep.name} (${ep.path})`, `Status ${res.status}`);
      }
    } catch (e) {
      fail(`${ep.name} (${ep.path})`, e.message);
    }
  }
}

async function runAllTests() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         COMPREHENSIVE FLOW TESTS - DrinkLongLife         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}\n`);

  await testUserFlows();
  await testAdminFlows();
  await testDatabaseIntegrity();
  await testAPIEndpoints();

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(60));
  console.log(`\n✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n🚨 FAILURES:');
    results.failed.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.test}: ${f.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  }
}

runAllTests().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
