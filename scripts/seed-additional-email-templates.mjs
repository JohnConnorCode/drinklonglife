#!/usr/bin/env node

/**
 * Seed Additional Email Templates
 *
 * Adds more email templates beyond the basic 4:
 * - shipping_notification
 * - password_reset
 * - refund_confirmation
 * - subscription_canceled
 * - review_request
 * - welcome_new_customer
 *
 * Usage:
 *   node scripts/seed-additional-email-templates.mjs
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

// Standardized styles for all templates
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
  .info-box {
    background: #f3f4f6;
    padding: 15px;
    border-radius: 8px;
    margin: 20px 0;
  }
`;

// Additional email templates
const templates = [
  {
    template_name: 'shipping_notification',
    category: 'orders',
    description: 'Shipping Notification - Order Shipped',
    subject_template: 'Your Long Life order has shipped! 📦',
    data_schema: {
      orderNumber: 'string',
      customerName: 'string',
      trackingNumber: 'string',
      trackingUrl: 'string',
      carrier: 'string',
      estimatedDelivery: 'string',
      items: 'array',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .tracking-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }
      .tracking-number {
        font-size: 24px;
        font-weight: bold;
        color: #166534;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <h1>Your order is on the way!</h1>
      <p>Hi {{customerName}},</p>
      <p>Great news! Your Long Life order #{{orderNumber}} has shipped and is headed your way.</p>

      <div class="tracking-box">
        <p style="margin: 0; color: #6b7280;">Carrier: <strong>{{carrier}}</strong></p>
        <p class="tracking-number">{{trackingNumber}}</p>
        <p style="margin: 0; color: #6b7280;">Estimated Delivery: {{estimatedDelivery}}</p>
        <a href="{{trackingUrl}}" class="button">Track Your Package</a>
      </div>

      <p>We'll send you another email when your package is delivered.</p>

      <p>Cheers,<br>The Long Life Team</p>
    </div>
    <div class="footer">
      <p>Long Life - Fresh cold-pressed juice delivered to your door</p>
      <p><a href="https://drinklonglife.com">drinklonglife.com</a></p>
    </div>
  </body>
</html>
`,
  },
  // NOTE: password_reset is handled by Supabase Auth automatically
  {
    template_name: 'refund_confirmation',
    category: 'orders',
    description: 'Refund Confirmation',
    subject_template: 'Refund Processed - Long Life Order #{{orderNumber}}',
    data_schema: {
      orderNumber: 'string',
      customerName: 'string',
      refundAmount: 'number',
      currency: 'string',
      reason: 'string',
      refundDate: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .refund-box {
        background: #f3f4f6;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }
      .refund-amount {
        font-size: 32px;
        font-weight: bold;
        color: #22c55e;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <h1>Refund Processed</h1>
      <p>Hi {{customerName}},</p>
      <p>We've processed a refund for your order #{{orderNumber}}.</p>

      <div class="refund-box">
        <p style="margin: 0; color: #6b7280;">Refund Amount</p>
        <p class="refund-amount">\${{refundAmount}}</p>
        <p style="margin: 0; color: #6b7280;">Processed on {{refundDate}}</p>
      </div>

      <p><strong>Reason:</strong> {{reason}}</p>

      <p>Please allow 5-10 business days for the refund to appear on your original payment method.</p>

      <p>If you have any questions, please don't hesitate to reach out to us.</p>

      <p>Thank you for your understanding,<br>The Long Life Team</p>
    </div>
    <div class="footer">
      <p>Long Life - Fresh cold-pressed juice delivered to your door</p>
      <p><a href="https://drinklonglife.com">drinklonglife.com</a></p>
    </div>
  </body>
</html>
`,
  },
  {
    template_name: 'subscription_canceled',
    category: 'subscriptions',
    description: 'Subscription Canceled Confirmation',
    subject_template: 'Your Long Life subscription has been canceled',
    data_schema: {
      customerName: 'string',
      planName: 'string',
      cancelDate: 'string',
      accessUntil: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .cancel-box {
        background: #fef2f2;
        border: 2px solid #ef4444;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <h1>Subscription Canceled</h1>
      <p>Hi {{customerName}},</p>
      <p>We're sorry to see you go. Your Long Life subscription has been canceled.</p>

      <div class="cancel-box">
        <p><strong>Plan:</strong> {{planName}}</p>
        <p><strong>Canceled on:</strong> {{cancelDate}}</p>
        <p><strong>Access until:</strong> {{accessUntil}}</p>
      </div>

      <p>You'll continue to have access to your subscription benefits until {{accessUntil}}.</p>

      <h2>We'd love your feedback</h2>
      <p>If you have a moment, we'd really appreciate hearing why you decided to cancel. Your feedback helps us improve.</p>

      <h2>Changed your mind?</h2>
      <p>You can reactivate your subscription anytime from your account dashboard.</p>

      <div style="text-align: center;">
        <a href="https://drinklonglife.com/account" class="button">Manage Account</a>
      </div>

      <p>Thank you for being a Long Life customer,<br>The Long Life Team</p>
    </div>
    <div class="footer">
      <p>Long Life - Fresh cold-pressed juice delivered to your door</p>
      <p><a href="https://drinklonglife.com">drinklonglife.com</a></p>
    </div>
  </body>
</html>
`,
  },
  {
    template_name: 'review_request',
    category: 'marketing',
    description: 'Product Review Request',
    subject_template: 'How was your Long Life order? ⭐',
    data_schema: {
      customerName: 'string',
      orderNumber: 'string',
      productName: 'string',
      reviewUrl: 'string',
      daysSinceOrder: 'number',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .stars {
        font-size: 48px;
        text-align: center;
        margin: 20px 0;
      }
      .review-box {
        background: #ecfdf5;
        padding: 25px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <h1>How did we do?</h1>
      <p>Hi {{customerName}},</p>
      <p>You received your Long Life order #{{orderNumber}} {{daysSinceOrder}} days ago. We'd love to hear what you think!</p>

      <div class="review-box">
        <div class="stars">⭐⭐⭐⭐⭐</div>
        <p style="font-size: 18px; margin: 0 0 15px 0;"><strong>How was your {{productName}}?</strong></p>
        <a href="{{reviewUrl}}" class="button">Leave a Review</a>
      </div>

      <p>Your feedback helps other customers discover the benefits of cold-pressed juice, and helps us continue improving.</p>

      <p>It only takes 30 seconds, and we truly appreciate it!</p>

      <p>Cheers,<br>The Long Life Team</p>
    </div>
    <div class="footer">
      <p>Long Life - Fresh cold-pressed juice delivered to your door</p>
      <p><a href="https://drinklonglife.com">drinklonglife.com</a></p>
    </div>
  </body>
</html>
`,
  },
  {
    template_name: 'welcome_new_customer',
    category: 'account',
    description: 'Welcome Email - First Purchase',
    subject_template: 'Welcome to Long Life! 🌿',
    data_schema: {
      customerName: 'string',
      referralCode: 'string',
      referralUrl: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .welcome-banner {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 30px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }
      .referral-box {
        background: #f3f4f6;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }
      .referral-code {
        font-size: 24px;
        font-weight: bold;
        color: #22c55e;
        background: white;
        padding: 10px 20px;
        border-radius: 8px;
        display: inline-block;
        margin: 10px 0;
      }
      .benefit {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .benefit:last-child {
        border-bottom: none;
      }
      .benefit-icon {
        font-size: 24px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <div class="welcome-banner">
        <h1 style="margin: 0; color: white;">Welcome to the Family! 🎉</h1>
      </div>

      <p>Hi {{customerName}},</p>
      <p>Thank you for your first order! We're thrilled to have you as part of the Long Life community.</p>

      <h2>What to expect</h2>
      <div class="benefit">
        <span class="benefit-icon">🧊</span>
        <div>
          <strong>Cold-pressed freshness</strong><br>
          <span style="color: #6b7280;">Our juices are made fresh and delivered cold to preserve nutrients</span>
        </div>
      </div>
      <div class="benefit">
        <span class="benefit-icon">🌱</span>
        <div>
          <strong>100% Organic</strong><br>
          <span style="color: #6b7280;">Every ingredient is certified organic with no preservatives</span>
        </div>
      </div>
      <div class="benefit">
        <span class="benefit-icon">💚</span>
        <div>
          <strong>Health benefits</strong><br>
          <span style="color: #6b7280;">Each blend is designed to support your wellness goals</span>
        </div>
      </div>

      <div class="referral-box">
        <h3 style="margin-top: 0;">Share the love, earn rewards!</h3>
        <p>Give your friends 20% off their first order, and you'll get 20% off your next order when they purchase.</p>
        <p class="referral-code">{{referralCode}}</p>
        <a href="{{referralUrl}}" class="button">Share Your Link</a>
      </div>

      <p>If you have any questions about your order or our juices, we're always here to help!</p>

      <p>To your health,<br>The Long Life Team</p>
    </div>
    <div class="footer">
      <p>Long Life - Fresh cold-pressed juice delivered to your door</p>
      <p><a href="https://drinklonglife.com">drinklonglife.com</a></p>
    </div>
  </body>
</html>
`,
  },
  {
    template_name: 'payment_failed',
    category: 'subscriptions',
    description: 'Payment Failed - Subscription Payment Issue',
    subject_template: 'Action Required: Payment Failed for Your Subscription',
    data_schema: {
      customerName: 'string',
      planName: 'string',
      amount: 'number',
      currency: 'string',
      retryDate: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .warning-box {
        background: #fef2f2;
        border: 2px solid #ef4444;
        padding: 25px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: center;
      }
      .amount {
        font-size: 28px;
        font-weight: bold;
        color: #dc2626;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <h1>Payment Failed</h1>
      <p>Hi {{customerName}},</p>
      <p>We were unable to process your payment for your Long Life subscription.</p>

      <div class="warning-box">
        <p style="margin: 0; color: #6b7280;">Amount Due</p>
        <p class="amount">\${{amount}}</p>
        <p style="margin: 0; color: #6b7280;">For: {{planName}}</p>
      </div>

      <p><strong>What happens next?</strong></p>
      <p>We'll automatically retry your payment on <strong>{{retryDate}}</strong>. To avoid any interruption to your subscription, please update your payment method before then.</p>

      <div style="text-align: center;">
        <a href="https://drinklonglife.com/account/billing" class="button">Update Payment Method</a>
      </div>

      <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>

      <p>Thank you,<br>The Long Life Team</p>
    </div>
    <div class="footer">
      <p>Long Life - Fresh cold-pressed juice delivered to your door</p>
      <p><a href="https://drinklonglife.com">drinklonglife.com</a></p>
    </div>
  </body>
</html>
`,
  },
];

async function seedTemplates() {
  console.log('\n📧 Seeding additional email templates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of templates) {
    try {
      // Insert as published version
      const { error } = await supabase
        .from('email_template_versions')
        .upsert(
          {
            ...template,
            version_type: 'published',
            published_at: new Date().toISOString(),
          },
          {
            onConflict: 'template_name,version_type',
          }
        );

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

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed`);
  console.log('\n✨ Done!\n');
}

seedTemplates();
