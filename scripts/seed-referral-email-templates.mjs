#!/usr/bin/env node

/**
 * Seed Referral Email Templates
 *
 * Adds email templates for the ambassador/referral program:
 * - referral_reward_earned (for referrers when their referral makes a purchase)
 * - referral_signup_notification (for referrers when someone uses their code)
 *
 * Usage:
 *   node scripts/seed-referral-email-templates.mjs
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
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Standardized styles
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
  .reward-box {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    padding: 30px;
    border-radius: 16px;
    margin: 20px 0;
    text-align: center;
  }
  .reward-amount {
    font-size: 48px;
    font-weight: bold;
    margin: 10px 0;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin: 20px 0;
  }
  .stat-box {
    background: #f3f4f6;
    padding: 15px;
    border-radius: 12px;
    text-align: center;
  }
  .stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #22c55e;
  }
`;

const templates = [
  {
    template_name: 'referral_reward_earned',
    category: 'referrals',
    description: 'Notification when ambassador earns a reward from a referral',
    subject_template: 'You earned a reward! Your referral just made a purchase',
    data_schema: {
      referrerName: 'string',
      refereeName: 'string',
      rewardPercentage: 'number',
      discountCode: 'string',
      totalReferrals: 'number',
      totalEarned: 'number',
      dashboardUrl: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}</style>
  </head>
  <body>
    <div class="header">
      <div class="logo">Long Life</div>
    </div>
    <div class="content">
      <h1>You've earned a reward!</h1>
      <p>Hi {{referrerName}},</p>
      <p>Great news! <strong>{{refereeName}}</strong> just made their first purchase using your referral link.</p>

      <div class="reward-box">
        <p style="margin: 0; opacity: 0.9;">Your Reward</p>
        <p class="reward-amount">{{rewardPercentage}}% OFF</p>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your next order</p>
      </div>

      <p>Your discount has been automatically applied to your account and is ready to use on your next purchase!</p>

      <div class="stats-grid">
        <div class="stat-box">
          <p class="stat-number">{{totalReferrals}}</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Total Referrals</p>
        </div>
        <div class="stat-box">
          <p class="stat-number">{{totalEarned}}</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Rewards Earned</p>
        </div>
      </div>

      <p>Keep sharing the love! The more friends you refer, the more rewards you earn.</p>

      <div style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">View Your Dashboard</a>
      </div>

      <p>Thank you for being an amazing ambassador!</p>
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
    template_name: 'referral_signup_notification',
    category: 'referrals',
    description: 'Notification when someone signs up using your referral code',
    subject_template: 'Someone just signed up with your referral link!',
    data_schema: {
      referrerName: 'string',
      refereeName: 'string',
      referralCode: 'string',
      totalSignups: 'number',
      dashboardUrl: 'string',
    },
    html_template: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${standardStyles}
      .signup-box {
        background: #ecfdf5;
        border: 2px solid #22c55e;
        padding: 25px;
        border-radius: 16px;
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
      <h1>Your referral is growing!</h1>
      <p>Hi {{referrerName}},</p>
      <p>Exciting news! Someone just signed up using your referral code.</p>

      <div class="signup-box">
        <p style="font-size: 18px; margin: 0 0 10px 0;"><strong>{{refereeName}}</strong></p>
        <p style="margin: 0; color: #16a34a;">Just joined Long Life using your link!</p>
      </div>

      <p><strong>What happens next?</strong></p>
      <p>When {{refereeName}} makes their first purchase, you'll both receive a reward:</p>
      <ul>
        <li><strong>You:</strong> 15% off your next order</li>
        <li><strong>{{refereeName}}:</strong> 10% off their first order</li>
      </ul>

      <p>You now have <strong>{{totalSignups}}</strong> people who've signed up with your code!</p>

      <div style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">View Your Dashboard</a>
      </div>

      <p>Keep spreading the word!</p>
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
];

async function seedTemplates() {
  console.log('\n📧 Seeding referral email templates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const template of templates) {
    try {
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
        console.error(`   ${template.template_name}:`, error.message);
        errorCount++;
      } else {
        console.log(`   ${template.template_name}`);
        successCount++;
      }
    } catch (err) {
      console.error(`   ${template.template_name}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n Results: ${successCount} succeeded, ${errorCount} failed`);
  console.log('\n Done!\n');
}

seedTemplates();
