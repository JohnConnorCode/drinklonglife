#!/usr/bin/env node

/**
 * Fix Email Templates - Standardize All Templates
 *
 * This script updates the templates that have inconsistent styling
 * to use the standard header/footer wrapper.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DRY: Templates now use {{standardStyles}}, {{standardHeader}}, {{standardFooter}}
// These are injected by the Edge Function at send time
// This ensures all templates automatically get updated if we change the styling

// Templates to update with DRY placeholders
// {{standardStyles}}, {{standardHeader}}, {{standardFooter}} are injected by the Edge Function
const templatesToUpdate = [
  {
    template_name: 'welcome',
    category: 'account',
    description: 'Welcome Email - New Account Registration',
    subject_template: 'Welcome to Long Life! 🌱',
    data_schema: {
      customerName: 'string',
      customerEmail: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>{{standardStyles}}</style>
  </head>
  <body>
    <div class="email-container">
      {{standardHeader}}
      <div class="content">
        <h1>Welcome to Long Life!</h1>
        <p>Hi {{customerName}},</p>
        <p>
          Thank you for joining Long Life! We're thrilled to have you as part of our wellness community.
        </p>

        <div class="highlight-box">
          <h3 style="margin-top: 0;">What's Next?</h3>
          <ul style="margin-bottom: 0;">
            <li>Explore our cold-pressed juice blends</li>
            <li>Learn about our regenerative farming partners</li>
            <li>Start your wellness journey with a subscription</li>
          </ul>
        </div>

        <p>Ready to get started?</p>

        <div style="text-align: center;">
          <a href="https://drinklonglife.com/blends" class="button">
            Explore Our Blends
          </a>
        </div>

        <p>
          If you have any questions, we're here to help. Just reply to this email or reach out to our support team.
        </p>

        <p>
          Here's to your health!<br>
          <strong>The Long Life Team</strong>
        </p>
      </div>
      {{standardFooter}}
    </div>
  </body>
</html>
    `.trim(),
  },

  {
    template_name: 'password_reset',
    category: 'account',
    description: 'Password Reset Request',
    subject_template: 'Reset Your Password - Long Life',
    data_schema: {
      customerName: 'string',
      resetUrl: 'string',
      expiresIn: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>{{standardStyles}}</style>
  </head>
  <body>
    <div class="email-container">
      {{standardHeader}}
      <div class="content">
        <h1>Reset Your Password</h1>
        <p>Hi {{customerName}},</p>
        <p>
          We received a request to reset your password for your Long Life account.
          Click the button below to set a new password.
        </p>

        <div style="text-align: center;">
          <a href="{{resetUrl}}" class="button">
            Reset Password
          </a>
        </div>

        <div class="info-box">
          <p style="margin: 0;"><strong>This link expires in {{expiresIn}}.</strong></p>
        </div>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
          Your password won't be changed unless you click the button above.
        </p>

        <p style="color: #6b7280; font-size: 13px;">
          For security reasons, this link can only be used once. If you need to reset your
          password again, please visit <a href="https://drinklonglife.com/forgot-password">drinklonglife.com/forgot-password</a>.
        </p>
      </div>
      {{standardFooter}}
    </div>
  </body>
</html>
    `.trim(),
  },

  {
    template_name: 'shipping_confirmation',
    category: 'orders',
    description: 'Order Shipped Notification',
    subject_template: 'Your Order Has Shipped! 📦',
    data_schema: {
      customerName: 'string',
      orderNumber: 'string',
      trackingNumber: 'string',
      trackingUrl: 'string',
      carrier: 'string',
      estimatedDelivery: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>{{standardStyles}}</style>
  </head>
  <body>
    <div class="email-container">
      {{standardHeader}}
      <div class="content">
        <h1>Your Order Has Shipped!</h1>
        <p>Hi {{customerName}},</p>
        <p>
          Great news! Your order is on its way. Here are your tracking details:
        </p>

        <div class="info-box">
          <p style="margin: 0 0 10px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
          <p style="margin: 0 0 10px 0;"><strong>Carrier:</strong> {{carrier}}</p>
          <p style="margin: 0 0 10px 0;"><strong>Tracking Number:</strong> {{trackingNumber}}</p>
          <p style="margin: 0;"><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
        </div>

        <div style="text-align: center;">
          <a href="{{trackingUrl}}" class="button">
            Track Your Package
          </a>
        </div>

        <div class="highlight-box">
          <h3 style="margin-top: 0;">Important Reminder</h3>
          <p style="margin-bottom: 0;">
            Please refrigerate your juice immediately upon arrival.
            Our cold-pressed juices are best enjoyed within 5 days of delivery for maximum freshness and nutrition.
          </p>
        </div>

        <p>
          Thank you for choosing Long Life!
        </p>
      </div>
      {{standardFooter}}
    </div>
  </body>
</html>
    `.trim(),
  },

  {
    template_name: 'newsletter_welcome',
    category: 'marketing',
    description: 'Newsletter Welcome Email',
    subject_template: 'Welcome to Long Life! 🌱',
    data_schema: {
      email: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>{{standardStyles}}</style>
  </head>
  <body>
    <div class="email-container">
      {{standardHeader}}
      <div class="content">
        <h1>Thanks for Subscribing!</h1>
        <p>Hey there,</p>
        <p>
          We're thrilled to have you on board. You're now part of a community dedicated to
          living longer, healthier lives through cold-pressed, regenerative nutrition.
        </p>

        <div class="highlight-box">
          <h3 style="margin-top: 0;">What to Expect:</h3>
          <ul style="margin-bottom: 0;">
            <li>Weekly blend drops and exclusive offers</li>
            <li>Health tips and wellness insights</li>
            <li>Farm stories and ingredient spotlights</li>
            <li>Early access to new products</li>
          </ul>
        </div>

        <div style="text-align: center;">
          <a href="https://drinklonglife.com/blends" class="button">
            Explore Our Blends
          </a>
        </div>

        <p>
          Here's to your health!<br>
          <strong>The Long Life Team</strong>
        </p>
      </div>
      {{standardFooter}}
    </div>
  </body>
</html>
    `.trim(),
  },
];

async function updateTemplates() {
  console.log('🔧 Fixing email templates with inconsistent styling...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of templatesToUpdate) {
    try {
      const { data, error } = await supabase
        .from('email_template_versions')
        .upsert(
          {
            ...template,
            version_type: 'published',
            published_at: new Date().toISOString(),
            data_schema: JSON.stringify(template.data_schema),
          },
          {
            onConflict: 'template_name,version_type',
            ignoreDuplicates: false,
          }
        )
        .select()
        .single();

      if (error) {
        console.error(`❌ ${template.template_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ ${template.template_name} - Updated to standard styling`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ ${template.template_name}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Update complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors:  ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 All templates updated to standard styling!');
    console.log('\nThe following templates now have consistent styling:');
    templatesToUpdate.forEach(t => console.log(`   - ${t.template_name}`));
    process.exit(0);
  } else {
    console.log('\n⚠️  Some templates failed to update. Check errors above.');
    process.exit(1);
  }
}

updateTemplates();
