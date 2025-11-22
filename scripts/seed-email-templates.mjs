#!/usr/bin/env node

/**
 * Seed Email Templates
 *
 * This script seeds the database with initial email templates converted from
 * the existing React Email templates. Templates use {{variableName}} syntax
 * for variable substitution.
 *
 * Usage:
 *   node scripts/seed-email-templates.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Standardized styles for all templates (DRY)
const standardStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .header {
    text-align: center;
    padding: 20px 0;
    border-bottom: 2px solid #22c55e;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    color: #22c55e;
  }
  .content {
    padding: 30px 0;
  }
  .footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
  }
  .button {
    display: inline-block;
    background: #22c55e;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 8px;
    margin: 20px 0;
  }
`;

// Email templates to seed
const templates = [
  {
    template_name: 'order_confirmation',
    category: 'orders',
    description: 'Order Confirmation Email',
    subject_template: 'Order Confirmation - Long Life #{{orderNumber}}',
    data_schema: {
      orderNumber: 'string',
      customerName: 'string',
      customerEmail: 'string',
      items: 'array', // Array of {name, quantity, price}
      subtotal: 'number', // Amount in cents
      total: 'number', // Amount in cents
      currency: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .order-number {
        background: #f3f4f6;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      .items-table th {
        background: #f9fafb;
        padding: 12px;
        text-align: left;
        border-bottom: 2px solid #e5e7eb;
      }
      .items-table td {
        padding: 12px;
        border-bottom: 1px solid #e5e7eb;
      }
      .totals {
        text-align: right;
        margin: 20px 0;
      }
      .totals-row {
        display: flex;
        justify-content: flex-end;
        padding: 8px 0;
      }
      .totals-label {
        margin-right: 20px;
        color: #6b7280;
      }
      .totals-value {
        font-weight: 600;
        min-width: 100px;
      }
      .total-row {
        font-size: 18px;
        font-weight: bold;
        border-top: 2px solid #e5e7eb;
        padding-top: 12px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">🥤 Long Life</div>
      <p>Cold-Pressed Wellness Delivered</p>
    </div>

    <div class="content">
      <h1>Thank You for Your Order!</h1>
      <p>Hi {{customerName}},</p>
      <p>
        We're excited to confirm your order. Your fresh cold-pressed juice is being prepared
        with care and will be on its way to you soon.
      </p>

      <div class="order-number">
        <strong>Order Number:</strong> {{orderNumber}}
      </div>

      <h2>Order Summary</h2>
      {{itemsTable}}

      <div class="totals">
        <div class="totals-row">
          <span class="totals-label">Subtotal:</span>
          <span class="totals-value">{{subtotal}}</span>
        </div>
        <div class="totals-row total-row">
          <span class="totals-label">Total:</span>
          <span class="totals-value">{{total}}</span>
        </div>
      </div>

      <p><strong>What's Next?</strong></p>
      <ul>
        <li>We'll send you a shipping confirmation with tracking information</li>
        <li>Your order typically arrives within 3-5 business days</li>
        <li>Keep your juice refrigerated upon arrival</li>
      </ul>

      <div style="text-align: center;">
        <a href="https://drinklonglife.com/account" class="button">
          View Order Status
        </a>
      </div>
    </div>

    <div class="footer">
      <p>Questions? Contact us at support@drinklonglife.com</p>
      <p>© ${new Date().getFullYear()} Long Life. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a> |
        <a href="{{preferencesUrl}}">Email Preferences</a>
      </p>
    </div>
  </body>
</html>
    `.trim(),
  },

  {
    template_name: 'subscription_confirmation',
    category: 'subscriptions',
    description: 'Subscription Confirmation Email',
    subject_template: 'Welcome to Your Subscription - Long Life',
    data_schema: {
      customerName: 'string',
      customerEmail: 'string',
      planName: 'string',
      planPrice: 'number', // Amount in cents
      billingInterval: 'string', // 'month' or 'year'
      nextBillingDate: 'string',
      currency: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .plan-card {
        background: #f3f4f6;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      .benefits {
        background: #ecfdf5;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #22c55e;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">🥤 Long Life</div>
      <p>Cold-Pressed Wellness Delivered</p>
    </div>

    <div class="content">
      <h1>Welcome to Your Subscription!</h1>
      <p>Hi {{customerName}},</p>
      <p>
        Thank you for subscribing to Long Life! You've just taken an important step
        toward consistent wellness and vitality.
      </p>

      <div class="plan-card">
        <h2>{{planName}}</h2>
        <p><strong>{{planPrice}}</strong> per {{billingInterval}}</p>
        <p><strong>Next Billing Date:</strong> {{nextBillingDate}}</p>
      </div>

      <div class="benefits">
        <h3>Your Subscription Benefits:</h3>
        <ul>
          <li>✅ Free delivery every {{billingInterval}}</li>
          <li>✅ Save 15% vs one-time purchases</li>
          <li>✅ Cancel or pause anytime</li>
          <li>✅ Flexibility to adjust your plan</li>
        </ul>
      </div>

      <p><strong>What Happens Next?</strong></p>
      <ul>
        <li>Your first delivery will ship within 2-3 business days</li>
        <li>You'll receive a tracking number once it ships</li>
        <li>Future deliveries will arrive automatically each {{billingInterval}}</li>
        <li>Manage your subscription anytime from your account</li>
      </ul>

      <div style="text-align: center;">
        <a href="https://drinklonglife.com/account" class="button">
          Manage Subscription
        </a>
      </div>
    </div>

    <div class="footer">
      <p>Questions? Contact us at support@drinklonglife.com</p>
      <p>© ${new Date().getFullYear()} Long Life. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a> |
        <a href="{{preferencesUrl}}">Email Preferences</a>
      </p>
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
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        text-align: center;
        padding: 30px 0;
        background: linear-gradient(135deg, #FFC837 0%, #85C65D 100%);
        border-radius: 10px;
        margin-bottom: 30px;
      }
      .header h1 {
        color: white;
        margin: 0;
        font-size: 32px;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        padding: 12px 30px;
        background: #E63946;
        color: white;
        text-decoration: none;
        border-radius: 25px;
        font-weight: 600;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        color: #666;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Welcome to Long Life! 🌱</h1>
    </div>

    <div class="content">
      <h2>Thanks for joining our wellness community!</h2>
      <p>Hey there,</p>
      <p>
        We're thrilled to have you on board. You're now part of a community dedicated to
        living longer, healthier lives through cold-pressed, regenerative nutrition.
      </p>
      <p><strong>What to expect:</strong></p>
      <ul>
        <li>Weekly blend drops and exclusive offers</li>
        <li>Health tips and wellness insights</li>
        <li>Farm stories and ingredient spotlights</li>
        <li>Early access to new products</li>
      </ul>
      <p>
        <a href="https://drinklonglife.com/blends" class="button">
          Explore Our Blends
        </a>
      </p>
    </div>

    <div class="footer">
      <p>You're receiving this because you signed up at drinklonglife.com</p>
      <p>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a> |
        <a href="https://drinklonglife.com">Visit our website</a>
      </p>
      <p>Long Life · Cold-Pressed Wellness</p>
    </div>
  </body>
</html>
    `.trim(),
  },

  {
    template_name: 'contact_form_notification',
    category: 'internal',
    description: 'Contact Form Submission Notification (Internal)',
    subject_template: 'New Contact Form Submission from {{name}}',
    data_schema: {
      name: 'string',
      email: 'string',
      message: 'string',
      timestamp: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        padding: 20px;
        background: #f9f9f9;
        border-left: 4px solid #E63946;
        margin-bottom: 20px;
      }
      .field {
        margin: 15px 0;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 5px;
      }
      .field label {
        display: block;
        font-weight: 600;
        color: #666;
        margin-bottom: 5px;
        font-size: 12px;
        text-transform: uppercase;
      }
      .field-value {
        color: #333;
        font-size: 14px;
      }
      .message-box {
        background: white;
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 5px;
        white-space: pre-wrap;
        font-family: inherit;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h2 style="margin: 0;">New Contact Form Submission</h2>
    </div>

    <div class="field">
      <label>From</label>
      <div class="field-value">{{name}}</div>
    </div>

    <div class="field">
      <label>Email</label>
      <div class="field-value">
        <a href="mailto:{{email}}">{{email}}</a>
      </div>
    </div>

    <div class="field">
      <label>Submitted</label>
      <div class="field-value">{{timestamp}}</div>
    </div>

    <div class="field">
      <label>Message</label>
      <div class="message-box">{{message}}</div>
    </div>
  </body>
</html>
    `.trim(),
  },
];

async function seedTemplates() {
  console.log('🌱 Seeding email templates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of templates) {
    try {
      // Insert as published version
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
        console.log(`✅ ${template.template_name} (${template.category})`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ ${template.template_name}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Seeding complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors:  ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 All email templates seeded successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some templates failed to seed. Check errors above.');
    process.exit(1);
  }
}

seedTemplates();
