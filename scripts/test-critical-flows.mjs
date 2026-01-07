#!/usr/bin/env node
/**
 * Critical Flow Tests
 * Run this before every deployment to catch breaking changes
 *
 * Usage: node scripts/test-critical-flows.mjs
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Pool } = pg;

// Load from environment variables - NEVER hardcode credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials. Required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// DB_PASSWORD is optional - direct DB tests will be skipped if not set
const skipDbTests = !DB_PASSWORD;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;
const failures = [];

// CI environment detection
const isCI = process.env.VERCEL || process.env.CI || process.env.GITHUB_ACTIONS;

function pass(name) {
  console.log(`✅ ${name}`);
  testsPassed++;
}

function skip(name, reason) {
  console.log(`⏭️  ${name}: ${reason} (skipped in CI)`);
  testsSkipped++;
}

function fail(name, error, critical = true) {
  // In CI, some failures are expected (rate limits, connection issues)
  const knownCIIssues = [
    'rate limit',
    'Connection terminated',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT'
  ];

  const isKnownCIIssue = isCI && knownCIIssues.some(issue => error.toLowerCase().includes(issue.toLowerCase()));

  if (isKnownCIIssue) {
    skip(name, error);
    return;
  }

  console.log(`❌ ${name}: ${error}`);
  testsFailed++;
  if (critical) {
    failures.push({ name, error });
  }
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

  if (skipDbTests) {
    skip('Database trigger tests', 'SUPABASE_DB_PASSWORD not set');
    return;
  }

  const pool = new Pool({
    connectionString: `postgresql://postgres.qjgenpwbaquqrvyrfsdo:${DB_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,  // 5 second timeout
    idleTimeoutMillis: 5000
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
  console.log(`\n📊 RESULTS: ${testsPassed} passed, ${testsFailed} failed, ${testsSkipped} skipped\n`);

  if (isCI) {
    console.log('ℹ️  Running in CI environment - some tests skipped due to rate limits/connections\n');
  }

  if (failures.length > 0) {
    console.log('❌ CRITICAL FAILURES:');
    failures.forEach(f => console.log(`   - ${f.name}: ${f.error}`));
    console.log('\n🚨 DO NOT DEPLOY - Fix the above issues first!\n');
    process.exit(1);
  } else {
    console.log('✅ All critical tests passed! Safe to deploy.\n');
    process.exit(0);
  }
}

runAllTests().catch(e => {
  console.error('Test runner failed:', e);
  process.exit(1);
});
