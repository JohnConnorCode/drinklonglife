#!/usr/bin/env node
/**
 * Update existing email templates with new designs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const LOGO_URL = 'https://drinklonglife.com/long-life-logo.png';
const SITE_URL = 'https://drinklonglife.com';

const emailWrapper = (content, preheader = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Long Life</title>
  <style>
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media screen and (max-width: 600px) {
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-full-width { width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0ecea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0ecea;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);" class="mobile-full-width">
          <tr>
            <td align="center" style="background-color: #0f5348; padding: 32px 40px;">
              <img src="${LOGO_URL}" alt="Long Life" width="160" style="display: block; width: 160px; max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;" class="mobile-padding">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f7f6; padding: 32px 40px; border-top: 1px solid #e5e5e5;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${SITE_URL}" style="color: #0f5348; text-decoration: none; font-weight: 600; font-size: 16px;">Long Life</a>
                    <span style="color: #999; margin: 0 12px;">|</span>
                    <a href="${SITE_URL}/blends" style="color: #666; text-decoration: none; font-size: 14px;">Shop</a>
                    <span style="color: #999; margin: 0 12px;">|</span>
                    <a href="${SITE_URL}/about" style="color: #666; text-decoration: none; font-size: 14px;">About</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #999; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0;">Cold-Pressed Wellness</p>
                    <p style="margin: 8px 0 0 0;">&copy; 2025 Long Life. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const templates = {
  order_confirmation: {
    subject: 'Your Long Life Order #{{orderNumber}} is Confirmed!',
    preheader: 'Thank you for your order! Your fresh juices are being prepared.',
    html: emailWrapper(`
      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Order Confirmed!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 24px 0;">Order #{{orderNumber}}</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Thank you for your order! We're preparing your fresh, cold-pressed juices with care. You'll receive a shipping confirmation once your order is on its way.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
      <h2 style="color: #0f5348; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Order Summary</h2>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px;">
        <tr>
          <td style="color: #0f5348; font-size: 18px; font-weight: 700; padding: 16px 0 0 0; border-top: 2px solid #0f5348;">Total</td>
          <td align="right" style="color: #0f5348; font-size: 18px; font-weight: 700; padding: 16px 0 0 0; border-top: 2px solid #0f5348;">$\{{total}}</td>
        </tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="background-color: #0f5348; border-radius: 8px;">
            <a href="${SITE_URL}/account/orders" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">View Order</a>
          </td>
        </tr>
      </table>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
        Questions? Reply to this email or contact <a href="mailto:hello@drinklonglife.com" style="color: #0f5348;">hello@drinklonglife.com</a>
      </p>
    `, 'Thank you for your order!')
  },

  subscription_confirmation: {
    subject: 'Welcome to Your {{planName}} Subscription!',
    preheader: 'Your subscription is active. Fresh juices on their way!',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #d7f25c; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">🎉</div>
      </div>
      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">Subscription Active!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Welcome to the Long Life family</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Your <strong>{{planName}}</strong> subscription is now active! Fresh, cold-pressed wellness delivered to your door.
      </p>
      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #0f5348; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Subscription Details</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="color: #666; font-size: 14px; padding: 8px 0;">Plan</td><td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{planName}}</td></tr>
          <tr><td style="color: #666; font-size: 14px; padding: 8px 0;">Next Billing</td><td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{nextBillingDate}}</td></tr>
        </table>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="background-color: #0f5348; border-radius: 8px;">
            <a href="${SITE_URL}/account/subscription" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">Manage Subscription</a>
          </td>
        </tr>
      </table>
    `, 'Your subscription is active!')
  },

  welcome: {
    subject: 'Welcome to Long Life, {{customerName}}!',
    preheader: 'Your journey to wellness starts here.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #8cbfa4; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">🌱</div>
      </div>
      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">Welcome to Long Life!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Your wellness journey starts now</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Welcome to the Long Life community! We're thrilled to have you join us on your journey to better health through cold-pressed nutrition.
      </p>
      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #0f5348; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">What's Next?</h3>
        <p style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong style="color: #0f5348;">1. Explore Our Blends</strong><br><span style="color: #666; font-size: 14px;">Discover Yellow Bomb, Green Bomb, and more</span></p>
        <p style="padding: 8px 0; border-bottom: 1px solid #e5e5e5;"><strong style="color: #0f5348;">2. Find Your Routine</strong><br><span style="color: #666; font-size: 14px;">One-time or subscribe for regular wellness</span></p>
        <p style="padding: 8px 0;"><strong style="color: #0f5348;">3. Join the Community</strong><br><span style="color: #666; font-size: 14px;">Follow us for tips and wellness inspiration</span></p>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="background-color: #0f5348; border-radius: 8px;">
            <a href="${SITE_URL}/blends" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">Shop Now</a>
          </td>
        </tr>
      </table>
      <p style="color: #666; font-size: 14px; text-align: center;">Cheers to your health! 🥬</p>
    `, 'Your journey to wellness starts here.')
  },

  newsletter_welcome: {
    subject: "You're In! Welcome to the Long Life Newsletter 🌱",
    preheader: 'Get exclusive wellness tips, recipes, and offers.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #d7f25c; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">📧</div>
      </div>
      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">You're on the List!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Welcome to our wellness community</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Thanks for subscribing to the Long Life newsletter! You'll be the first to know about:
      </p>
      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="padding: 8px 0; margin: 0;">✨ <strong>Exclusive offers</strong> and early access</p>
        <p style="padding: 8px 0; margin: 0;">🥗 <strong>Wellness tips</strong> and healthy recipes</p>
        <p style="padding: 8px 0; margin: 0;">📚 <strong>Latest articles</strong> from our journal</p>
        <p style="padding: 8px 0; margin: 0;">🎁 <strong>Subscriber-only</strong> discounts</p>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="background-color: #0f5348; border-radius: 8px;">
            <a href="${SITE_URL}/blends" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">Explore Our Blends</a>
          </td>
        </tr>
      </table>
    `, 'Get exclusive wellness tips and offers.')
  },

  contact_form_notification: {
    subject: 'New Contact Form: {{subject}} from {{name}}',
    preheader: 'New contact form submission received.',
    html: emailWrapper(`
      <h1 style="color: #0f5348; font-size: 24px; font-weight: 700; margin: 0 0 24px 0;">New Contact Form Submission</h1>
      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="color: #666; font-size: 14px; padding: 8px 0; width: 100px;">From:</td><td style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{name}}</td></tr>
          <tr><td style="color: #666; font-size: 14px; padding: 8px 0;">Email:</td><td style="color: #333; font-size: 14px; padding: 8px 0;"><a href="mailto:{{email}}" style="color: #0f5348;">{{email}}</a></td></tr>
          <tr><td style="color: #666; font-size: 14px; padding: 8px 0;">Subject:</td><td style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{subject}}</td></tr>
        </table>
      </div>
      <h3 style="color: #0f5348; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Message:</h3>
      <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px;">
        <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{{message}}</p>
      </div>
    `, 'New contact form submission.')
  }
};

async function updateTemplate(name, data) {
  // First get the existing template ID
  const getResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/email_template_versions?template_name=eq.${name}&version_type=eq.published&select=id`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      }
    }
  );

  const existing = await getResponse.json();
  if (!existing || existing.length === 0) {
    console.log(`   ⚠️  Template not found: ${name}`);
    return false;
  }

  const id = existing[0].id;

  // Update the template
  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/email_template_versions?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        subject_template: data.subject,
        html_template: data.html,
        preheader: data.preheader,
        updated_at: new Date().toISOString()
      })
    }
  );

  return updateResponse.ok;
}

async function main() {
  console.log('🎨 Updating existing email templates...\n');

  for (const [name, data] of Object.entries(templates)) {
    console.log(`📧 Updating: ${name}`);
    const success = await updateTemplate(name, data);
    if (success) {
      console.log(`   ✅ Updated successfully`);
    } else {
      console.log(`   ❌ Failed to update`);
    }
  }

  console.log('\n✨ Done!');
}

main().catch(console.error);
