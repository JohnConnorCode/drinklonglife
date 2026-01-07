#!/usr/bin/env node
/**
 * DEEP AUDIT - Find all hidden bugs that could be losing money
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Load from environment variables - NEVER hardcode credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY);

const issues = [];

function critical(msg) {
  console.log(`🔴 CRITICAL: ${msg}`);
  issues.push({ level: 'critical', msg });
}

function warning(msg) {
  console.log(`⚠️  WARNING: ${msg}`);
  issues.push({ level: 'warning', msg });
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

async function auditOrders() {
  console.log('\n' + '='.repeat(60));
  console.log('💰 ORDERS & REVENUE');
  console.log('='.repeat(60) + '\n');

  // Check database orders
  const { data: dbOrders, count: dbOrderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact' });

  console.log(`Database orders: ${dbOrderCount || 0}`);

  // Check Stripe for actual payments
  const stripePayments = await stripe.paymentIntents.list({ limit: 100 });
  const successfulPayments = stripePayments.data.filter(p => p.status === 'succeeded');

  console.log(`Stripe successful payments: ${successfulPayments.length}`);

  // Check Stripe checkout sessions
  const stripeSessions = await stripe.checkout.sessions.list({ limit: 100 });
  const completedSessions = stripeSessions.data.filter(s => s.status === 'complete');

  console.log(`Stripe completed checkouts: ${completedSessions.length}`);

  // CRITICAL: If Stripe has payments but DB has none, webhook is broken
  if (successfulPayments.length > 0 && (dbOrderCount || 0) === 0) {
    critical(`WEBHOOK BROKEN: ${successfulPayments.length} Stripe payments but 0 database orders!`);
    critical('Customers paid but orders were never recorded!');

    // Show the missing orders
    console.log('\nMissing orders from Stripe:');
    successfulPayments.slice(0, 5).forEach(p => {
      console.log(`  - ${p.id}: $${p.amount / 100} on ${new Date(p.created * 1000).toLocaleDateString()}`);
    });
  } else if (successfulPayments.length !== (dbOrderCount || 0)) {
    warning(`Order count mismatch: ${successfulPayments.length} Stripe vs ${dbOrderCount} DB`);
  } else if (dbOrderCount === 0 && successfulPayments.length === 0) {
    info('No orders yet - this may be normal for a new site');
  } else {
    ok(`Orders match: ${dbOrderCount} in both Stripe and DB`);
  }

  // Check for any failed webhooks in Stripe
  console.log('\nChecking webhook delivery...');
  try {
    const webhookEndpoints = await stripe.webhookEndpoints.list();
    const prodEndpoint = webhookEndpoints.data.find(w =>
      w.url.includes('drinklonglife.com') && w.status === 'enabled'
    );

    if (prodEndpoint) {
      ok(`Webhook endpoint active: ${prodEndpoint.url}`);

      // Check recent webhook attempts (if available via API)
      // Note: Stripe API doesn't expose failed webhook history directly
    } else {
      critical('No active webhook endpoint for drinklonglife.com!');
    }
  } catch (e) {
    warning(`Could not check webhooks: ${e.message}`);
  }
}

async function auditSubscriptions() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 SUBSCRIPTIONS');
  console.log('='.repeat(60) + '\n');

  // Check Stripe subscriptions
  const stripeSubs = await stripe.subscriptions.list({ limit: 100, status: 'all' });

  const activeSubs = stripeSubs.data.filter(s => s.status === 'active');
  const canceledSubs = stripeSubs.data.filter(s => s.status === 'canceled');
  const pastDueSubs = stripeSubs.data.filter(s => s.status === 'past_due');

  console.log(`Active subscriptions: ${activeSubs.length}`);
  console.log(`Past due subscriptions: ${pastDueSubs.length}`);
  console.log(`Canceled subscriptions: ${canceledSubs.length}`);

  if (pastDueSubs.length > 0) {
    warning(`${pastDueSubs.length} subscriptions are past due - revenue being lost!`);
    pastDueSubs.forEach(s => {
      console.log(`  - ${s.id}: ${s.customer} since ${new Date(s.current_period_end * 1000).toLocaleDateString()}`);
    });
  }

  // Check database subscriptions table
  const { data: dbSubs, error: subError } = await supabase
    .from('subscriptions')
    .select('*');

  if (subError) {
    warning(`Subscriptions table error: ${subError.message}`);
  } else {
    console.log(`\nDatabase subscriptions: ${dbSubs?.length || 0}`);

    if (activeSubs.length > 0 && (dbSubs?.length || 0) === 0) {
      warning('Stripe has active subscriptions but database has none - sync issue?');
    }
  }
}

async function auditEmails() {
  console.log('\n' + '='.repeat(60));
  console.log('📧 EMAIL SYSTEM');
  console.log('='.repeat(60) + '\n');

  // Check email notifications table
  const { data: emails, error: emailError } = await supabase
    .from('email_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (emailError) {
    warning(`Email notifications table error: ${emailError.message}`);
    return;
  }

  console.log(`Recent email records: ${emails?.length || 0}`);

  if (emails && emails.length > 0) {
    const sent = emails.filter(e => e.status === 'sent');
    const failed = emails.filter(e => e.status === 'failed');
    const pending = emails.filter(e => e.status === 'pending');

    console.log(`  Sent: ${sent.length}`);
    console.log(`  Failed: ${failed.length}`);
    console.log(`  Pending: ${pending.length}`);

    if (failed.length > 0) {
      critical(`${failed.length} emails FAILED to send!`);
      failed.slice(0, 3).forEach(e => {
        console.log(`    - ${e.template_name} to ${e.email}: ${e.error_message || 'unknown error'}`);
      });
    }

    if (pending.length > 5) {
      warning(`${pending.length} emails stuck in pending - email queue may be broken`);
    }
  } else {
    info('No email records - either no emails sent or table not being used');
  }

  // Check email templates exist
  const { data: templates } = await supabase
    .from('email_template_versions')
    .select('template_name, version_type')
    .eq('version_type', 'published');

  console.log(`\nPublished email templates: ${templates?.length || 0}`);

  const requiredTemplates = ['order_confirmation', 'welcome'];
  const existingTemplates = templates?.map(t => t.template_name) || [];
  const missing = requiredTemplates.filter(t => !existingTemplates.includes(t));

  if (missing.length > 0) {
    warning(`Missing email templates: ${missing.join(', ')}`);
  }
}

async function auditUserSignups() {
  console.log('\n' + '='.repeat(60));
  console.log('👥 USER SIGNUPS');
  console.log('='.repeat(60) + '\n');

  // Get auth users
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  console.log(`Total auth users: ${authUsers.length}`);

  // Get profiles
  const { data: profiles } = await supabase.from('profiles').select('id, email, created_at');

  console.log(`Total profiles: ${profiles?.length || 0}`);

  // Check for mismatches
  const authIds = new Set(authUsers.map(u => u.id));
  const profileIds = new Set(profiles?.map(p => p.id) || []);

  // Users without profiles (trigger failed)
  const usersWithoutProfiles = authUsers.filter(u => !profileIds.has(u.id));
  if (usersWithoutProfiles.length > 0) {
    critical(`${usersWithoutProfiles.length} users have NO PROFILE - trigger was broken!`);
    usersWithoutProfiles.slice(0, 5).forEach(u => {
      console.log(`  - ${u.email} (${u.id})`);
    });
  } else {
    ok('All auth users have profiles');
  }

  // Profiles without users (orphaned)
  const orphanedProfiles = profiles?.filter(p => !authIds.has(p.id)) || [];
  if (orphanedProfiles.length > 0) {
    warning(`${orphanedProfiles.length} orphaned profiles (no auth user)`);
  }

  // Recent signups
  const recentUsers = authUsers
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  console.log('\nRecent signups:');
  recentUsers.forEach(u => {
    console.log(`  - ${u.email} on ${new Date(u.created_at).toLocaleDateString()}`);
  });
}

async function auditNewsletter() {
  console.log('\n' + '='.repeat(60));
  console.log('📰 NEWSLETTER');
  console.log('='.repeat(60) + '\n');

  const { data: subs, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .eq('subscribed', true);

  console.log(`Active subscribers: ${count || 0}`);

  // Test the newsletter API
  try {
    const res = await fetch('https://drinklonglife.com/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' })
    });

    if (res.status === 400) {
      ok('Newsletter API responds correctly');
    } else if (res.status === 500) {
      critical('Newsletter API returns 500 error');
    }
  } catch (e) {
    warning(`Newsletter API check failed: ${e.message}`);
  }
}

async function auditContactForm() {
  console.log('\n' + '='.repeat(60));
  console.log('📝 CONTACT FORM');
  console.log('='.repeat(60) + '\n');

  try {
    const res = await fetch('https://drinklonglife.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (res.status === 400) {
      ok('Contact form API responds');
    } else if (res.status === 500) {
      critical('Contact form API returns 500');
    } else if (res.status === 404) {
      info('Contact form API not found (may not exist)');
    }
  } catch (e) {
    warning(`Contact form check failed: ${e.message}`);
  }
}

async function auditPasswordReset() {
  console.log('\n' + '='.repeat(60));
  console.log('🔑 PASSWORD RESET');
  console.log('='.repeat(60) + '\n');

  // Check if forgot-password page exists
  try {
    const res = await fetch('https://drinklonglife.com/forgot-password');
    if (res.ok) {
      ok('Forgot password page exists');
    } else {
      warning(`Forgot password page returns ${res.status}`);
    }
  } catch (e) {
    warning(`Could not check forgot-password page: ${e.message}`);
  }

  // Test password reset email sending (without actually sending)
  // This would require testing the actual flow
  info('Password reset email flow should be manually tested');
}

async function auditThirdPartyIntegrations() {
  console.log('\n' + '='.repeat(60));
  console.log('🔗 THIRD-PARTY INTEGRATIONS');
  console.log('='.repeat(60) + '\n');

  // Check Klaviyo (if configured)
  const klaviyoKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (klaviyoKey) {
    info('Klaviyo configured - check dashboard for delivery issues');
  } else {
    info('Klaviyo not configured locally (may be in Vercel)');
  }

  // Check Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    info('Resend configured - check dashboard for delivery issues');
  } else {
    info('Resend not configured locally (may be in Vercel)');
  }
}

async function auditAPIEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🌐 CRITICAL API ENDPOINTS');
  console.log('='.repeat(60) + '\n');

  const endpoints = [
    { url: '/api/checkout', method: 'POST', body: { items: [] }, expectStatus: 400 },
    { url: '/api/cart/validate', method: 'POST', body: { items: [] }, expectStatus: [200, 400] },
    { url: '/api/auth/signup', method: 'POST', body: {}, expectStatus: [400, 405] },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`https://drinklonglife.com${ep.url}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ep.body)
      });

      const expected = Array.isArray(ep.expectStatus) ? ep.expectStatus : [ep.expectStatus];

      if (expected.includes(res.status)) {
        ok(`${ep.url} responds correctly (${res.status})`);
      } else if (res.status === 500) {
        critical(`${ep.url} returns 500 SERVER ERROR`);
      } else {
        warning(`${ep.url} returns ${res.status} (expected ${expected.join(' or ')})`);
      }
    } catch (e) {
      critical(`${ep.url} unreachable: ${e.message}`);
    }
  }
}

async function runDeepAudit() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           🔍 DEEP AUDIT - Finding Hidden Bugs            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nTimestamp: ${new Date().toISOString()}\n`);

  await auditOrders();
  await auditSubscriptions();
  await auditEmails();
  await auditUserSignups();
  await auditNewsletter();
  await auditContactForm();
  await auditPasswordReset();
  await auditThirdPartyIntegrations();
  await auditAPIEndpoints();

  console.log('\n' + '='.repeat(60));
  console.log('📊 DEEP AUDIT SUMMARY');
  console.log('='.repeat(60));

  const criticals = issues.filter(i => i.level === 'critical');
  const warnings = issues.filter(i => i.level === 'warning');

  console.log(`\n🔴 CRITICAL: ${criticals.length}`);
  criticals.forEach((i, idx) => console.log(`   ${idx + 1}. ${i.msg}`));

  console.log(`\n⚠️  WARNINGS: ${warnings.length}`);
  warnings.forEach((i, idx) => console.log(`   ${idx + 1}. ${i.msg}`));

  if (criticals.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES NEED IMMEDIATE ATTENTION!\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Review warnings above.\n');
  } else {
    console.log('\n✅ No critical issues found!\n');
  }
}

runDeepAudit().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
