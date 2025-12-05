#!/usr/bin/env node
/**
 * Critical Flow Tests
 * Run this before every deployment to catch breaking changes
 *
 * Usage: node scripts/test-critical-flows.mjs
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Pool } = pg;

// Get environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qjgenpwbaquqrvyrfsdo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ2VucHdiYXF1cXJ2eXJmc2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTY0ODIsImV4cCI6MjA3ODU3MjQ4Mn0.rJvxrKdSFf5yw-DdVTxbhWKf6ClVBrwQE1Fvgj6nh-o';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ2VucHdiYXF1cXJ2eXJmc2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5NjQ4MiwiZXhwIjoyMDc4NTcyNDgyfQ.NnjPDj-24lOqa1xXyGOLwDowko3cpSUkBsFPhYCt9iM';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || 'DrinkLongLife1!';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function pass(name) {
  console.log(`✅ ${name}`);
  testsPassed++;
}

function fail(name, error) {
  console.log(`❌ ${name}: ${error}`);
  testsFailed++;
  failures.push({ name, error });
}

async function testSignupFlow() {
  console.log('\n📝 TESTING SIGNUP FLOW\n');

  const testEmail = `test-${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Test 1: Create user via signup
    const { data: signupData, error: signupError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signupError) {
      fail('User signup', signupError.message);
      return;
    }
    pass('User signup');

    const userId = signupData.user?.id;
    if (!userId) {
      fail('User ID returned', 'No user ID in response');
      return;
    }
    pass('User ID returned');

    // Test 2: Profile created automatically
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      fail('Profile auto-creation', profileError?.message || 'Profile not found');
    } else {
      pass('Profile auto-creation');
    }

    // Test 3: Email preferences created automatically
    const { data: prefs, error: prefsError } = await supabaseAdmin
      .from('email_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (prefsError || !prefs) {
      fail('Email preferences auto-creation', prefsError?.message || 'Prefs not found');
    } else {
      pass('Email preferences auto-creation');
    }

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(userId);
    pass('Test user cleanup');

  } catch (e) {
    fail('Signup flow', e.message);
  }
}

async function testProductsFlow() {
  console.log('\n🛍️ TESTING PRODUCTS FLOW\n');

  try {
    // Test 1: Can fetch products
    const { data: products, error: prodError } = await supabaseAnon
      .from('products')
      .select('id, name, slug')
      .eq('is_active', true);

    if (prodError) {
      fail('Fetch products', prodError.message);
      return;
    }

    if (!products || products.length === 0) {
      fail('Products exist', 'No active products found');
      return;
    }
    pass(`Fetch products (${products.length} found)`);

    // Test 2: Can fetch product with variants
    const { data: product, error: varError } = await supabaseAnon
      .from('products')
      .select(`
        id, name, slug,
        variants:product_variants(id, label, stripe_price_id, price_usd, is_active)
      `)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (varError) {
      fail('Fetch product with variants', varError.message);
    } else if (!product.variants || product.variants.length === 0) {
      fail('Product has variants', 'No variants found');
    } else {
      pass(`Product variants (${product.variants.length} for ${product.name})`);
    }

    // Test 3: Variants have Stripe price IDs
    const activeVariants = product?.variants?.filter(v => v.is_active && v.stripe_price_id) || [];
    if (activeVariants.length === 0) {
      fail('Variants have Stripe prices', 'No variants with Stripe price IDs');
    } else {
      pass(`Variants have Stripe prices (${activeVariants.length} active)`);
    }

  } catch (e) {
    fail('Products flow', e.message);
  }
}

async function testDatabaseTriggers() {
  console.log('\n⚡ TESTING DATABASE TRIGGERS\n');

  const pool = new Pool({
    connectionString: `postgresql://postgres.qjgenpwbaquqrvyrfsdo:${DB_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();

    // Test 1: Auth triggers exist
    const triggers = await client.query(`
      SELECT trigger_name, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    `);

    if (triggers.rows.length === 0) {
      fail('Auth triggers exist', 'No triggers on auth.users');
    } else {
      pass(`Auth triggers exist (${triggers.rows.length} found)`);
    }

    // Test 2: handle_new_user has exception handling
    const func = await client.query(`
      SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user'
    `);

    if (!func.rows[0]?.prosrc) {
      fail('handle_new_user exists', 'Function not found');
    } else if (!func.rows[0].prosrc.includes('EXCEPTION')) {
      fail('handle_new_user has error handling', 'No EXCEPTION clause in function');
    } else {
      pass('handle_new_user has error handling');
    }

    // Test 3: create_default_email_preferences has exception handling
    const emailFunc = await client.query(`
      SELECT prosrc FROM pg_proc WHERE proname = 'create_default_email_preferences'
    `);

    if (!emailFunc.rows[0]?.prosrc) {
      fail('create_default_email_preferences exists', 'Function not found');
    } else if (!emailFunc.rows[0].prosrc.includes('EXCEPTION')) {
      fail('email_prefs function has error handling', 'No EXCEPTION clause in function');
    } else {
      pass('email_prefs function has error handling');
    }

    client.release();
    await pool.end();

  } catch (e) {
    fail('Database triggers', e.message);
    await pool.end();
  }
}

async function testLoginFlow() {
  console.log('\n🔐 TESTING LOGIN FLOW\n');

  const testEmail = `login-test-${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';

  try {
    // Create user first
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (createError) {
      fail('Create test user', createError.message);
      return;
    }

    // Test login
    const { data: session, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      fail('User login', loginError.message);
    } else if (!session.session) {
      fail('Session created', 'No session in response');
    } else {
      pass('User login');
      pass('Session created');
    }

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(user.user.id);
    pass('Test user cleanup');

  } catch (e) {
    fail('Login flow', e.message);
  }
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     CRITICAL FLOW TESTS - DrinkLongLife  ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nRunning at: ${new Date().toISOString()}\n`);

  await testSignupFlow();
  await testLoginFlow();
  await testProductsFlow();
  await testDatabaseTriggers();

  console.log('\n══════════════════════════════════════════');
  console.log(`\n📊 RESULTS: ${testsPassed} passed, ${testsFailed} failed\n`);

  if (testsFailed > 0) {
    console.log('❌ FAILURES:');
    failures.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
    console.log('\n🚨 DO NOT DEPLOY - Fix the above issues first!\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed! Safe to deploy.\n');
    process.exit(0);
  }
}

runAllTests().catch(e => {
  console.error('Test runner failed:', e);
  process.exit(1);
});
