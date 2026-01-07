#!/usr/bin/env node
/**
 * Update all email templates with professional, responsive designs
 * Brand colors: Primary #0f5348, Yellow #d7f25c, Green #8cbfa4, Cream #f0ecea
 */

// Load from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const LOGO_URL = 'https://drinklonglife.com/long-life-logo.png';
const SITE_URL = 'https://drinklonglife.com';

// Base email wrapper with responsive design
const emailWrapper = (content, preheader = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Long Life</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* iOS blue links */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-full-width { width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f0ecea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}

  <!-- Main wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0ecea;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);" class="mobile-full-width">

          <!-- Header with logo -->
          <tr>
            <td align="center" style="background-color: #0f5348; padding: 32px 40px;">
              <img src="${LOGO_URL}" alt="Long Life" width="160" style="display: block; width: 160px; max-width: 100%;">
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;" class="mobile-padding">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f7f6; padding: 32px 40px; border-top: 1px solid #e5e5e5;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${SITE_URL}" style="color: #0f5348; text-decoration: none; font-weight: 600; font-size: 16px;">Long Life</a>
                    <span style="color: #999; margin: 0 12px;">|</span>
                    <a href="${SITE_URL}/blends" style="color: #666; text-decoration: none; font-size: 14px;">Shop</a>
                    <span style="color: #999; margin: 0 12px;">|</span>
                    <a href="${SITE_URL}/journal" style="color: #666; text-decoration: none; font-size: 14px;">Journal</a>
                    <span style="color: #999; margin: 0 12px;">|</span>
                    <a href="${SITE_URL}/about" style="color: #666; text-decoration: none; font-size: 14px;">About</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: #999; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0;">Cold-Pressed Wellness</p>
                    <p style="margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Long Life. All rights reserved.</p>
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

// Button component
const button = (text, url, primary = true) => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td align="center" style="background-color: ${primary ? '#0f5348' : '#f0ecea'}; border-radius: 8px;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; color: ${primary ? '#ffffff' : '#0f5348'}; text-decoration: none; font-weight: 600; font-size: 16px;">${text}</a>
    </td>
  </tr>
</table>`;

// Divider
const divider = `<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">`;

// Templates
const templates = [
  // 1. Order Confirmation
  {
    template_name: 'order_confirmation',
    description: 'Order Confirmation Email',
    category: 'orders',
    subject_template: 'Your Long Life Order #{{orderNumber}} is Confirmed!',
    preheader: 'Thank you for your order! Your fresh juices are being prepared.',
    data_schema: {
      orderNumber: 'string',
      customerName: 'string',
      customerEmail: 'string',
      items: 'array',
      subtotal: 'number',
      discountCode: 'string',
      discountAmount: 'number',
      total: 'number',
      currency: 'string'
    },
    html_template: emailWrapper(`
      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Order Confirmed!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 24px 0;">Order #{{orderNumber}}</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Thank you for your order! We're preparing your fresh, cold-pressed juices with care. You'll receive a shipping confirmation once your order is on its way.
      </p>

      ${divider}

      <h2 style="color: #0f5348; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Order Summary</h2>

      <p style="color: #666; font-size: 14px; margin: 0 0 16px 0;">{{#each items}}<span style="display: block; padding: 8px 0; border-bottom: 1px solid #f0ecea;">{{name}} x {{quantity}}</span>{{/each}}</p>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px;">
        <tr>
          <td style="color: #666; font-size: 14px; padding: 8px 0;">Subtotal</td>
          <td align="right" style="color: #333; font-size: 14px; padding: 8px 0;">\${{subtotal}}</td>
        </tr>
        {{#if discountCode}}
        <tr>
          <td style="color: #0f5348; font-size: 14px; padding: 8px 0;">Discount ({{discountCode}})</td>
          <td align="right" style="color: #0f5348; font-size: 14px; padding: 8px 0;">-\${{discountAmount}}</td>
        </tr>
        {{/if}}
        <tr>
          <td style="color: #0f5348; font-size: 18px; font-weight: 700; padding: 16px 0 0 0; border-top: 2px solid #0f5348;">Total</td>
          <td align="right" style="color: #0f5348; font-size: 18px; font-weight: 700; padding: 16px 0 0 0; border-top: 2px solid #0f5348;">\${{total}}</td>
        </tr>
      </table>

      ${button('View Order', SITE_URL + '/account/orders')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
        Questions about your order? Reply to this email or contact us at <a href="mailto:hello@drinklonglife.com" style="color: #0f5348;">hello@drinklonglife.com</a>
      </p>
    `, 'Thank you for your order! Your fresh juices are being prepared.')
  },

  // 2. Subscription Confirmation
  {
    template_name: 'subscription_confirmation',
    description: 'Subscription Welcome Email',
    category: 'subscriptions',
    subject_template: 'Welcome to Your {{planName}} Subscription!',
    preheader: 'Your subscription is active. Fresh juices on their way!',
    data_schema: {
      customerName: 'string',
      customerEmail: 'string',
      planName: 'string',
      planPrice: 'number',
      billingInterval: 'string',
      nextBillingDate: 'string',
      currency: 'string'
    },
    html_template: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #d7f25c; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">🎉</div>
      </div>

      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">Subscription Active!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Welcome to the Long Life family</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Your <strong>{{planName}}</strong> subscription is now active! Fresh, cold-pressed wellness will be delivered to your door on a regular schedule.
      </p>

      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #0f5348; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Subscription Details</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Plan</td>
            <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{planName}}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Price</td>
            <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">\${{planPrice}}/{{billingInterval}}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Next Billing</td>
            <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{nextBillingDate}}</td>
          </tr>
        </table>
      </div>

      ${button('Manage Subscription', SITE_URL + '/account/subscription')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        You can pause, modify, or cancel your subscription anytime from your account.
      </p>
    `, 'Your subscription is active. Fresh juices coming your way!')
  },

  // 3. Welcome Email (New Signup)
  {
    template_name: 'welcome',
    description: 'Welcome Email for New Users',
    category: 'notifications',
    subject_template: 'Welcome to Long Life, {{customerName}}!',
    preheader: 'Your journey to wellness starts here.',
    data_schema: {
      customerName: 'string'
    },
    html_template: emailWrapper(`
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
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
              <span style="color: #0f5348; font-weight: 600;">1. Explore Our Blends</span>
              <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Discover Yellow Bomb, Green Bomb, and more</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
              <span style="color: #0f5348; font-weight: 600;">2. Find Your Routine</span>
              <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">One-time or subscribe for regular wellness</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <span style="color: #0f5348; font-weight: 600;">3. Join the Community</span>
              <p style="color: #666; font-size: 14px; margin: 4px 0 0 0;">Follow us for tips, recipes, and wellness inspiration</p>
            </td>
          </tr>
        </table>
      </div>

      ${button('Shop Now', SITE_URL + '/blends')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        Cheers to your health! 🥬
      </p>
    `, 'Your journey to wellness starts here.')
  },

  // 4. Newsletter Welcome
  {
    template_name: 'newsletter_welcome',
    description: 'Newsletter Subscription Welcome',
    category: 'marketing',
    subject_template: "You're In! Welcome to the Long Life Newsletter 🌱",
    preheader: 'Get exclusive wellness tips, recipes, and offers.',
    data_schema: {
      email: 'string'
    },
    html_template: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #d7f25c; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">📧</div>
      </div>

      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">You're on the List!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Welcome to our wellness community</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Thanks for subscribing to the Long Life newsletter! You'll be the first to know about:
      </p>

      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 8px 0;">✨ <strong>Exclusive offers</strong> and early access to new products</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">🥗 <strong>Wellness tips</strong> and healthy recipes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">📚 <strong>Latest articles</strong> from our journal</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">🎁 <strong>Subscriber-only</strong> discounts</td>
          </tr>
        </table>
      </div>

      ${button('Explore Our Blends', SITE_URL + '/blends')}

      <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        You can unsubscribe anytime by clicking the link at the bottom of our emails.
      </p>
    `, 'Get exclusive wellness tips, recipes, and offers.')
  },

  // 5. Contact Form Notification (Internal)
  {
    template_name: 'contact_form_notification',
    description: 'Contact Form Submission (Internal)',
    category: 'internal',
    subject_template: 'New Contact Form: {{subject}} from {{name}}',
    preheader: 'New contact form submission received.',
    data_schema: {
      name: 'string',
      email: 'string',
      subject: 'string',
      message: 'string'
    },
    html_template: emailWrapper(`
      <h1 style="color: #0f5348; font-size: 24px; font-weight: 700; margin: 0 0 24px 0;">New Contact Form Submission</h1>

      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0; width: 100px;">From:</td>
            <td style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{name}}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Email:</td>
            <td style="color: #333; font-size: 14px; padding: 8px 0;"><a href="mailto:{{email}}" style="color: #0f5348;">{{email}}</a></td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Subject:</td>
            <td style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{subject}}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #0f5348; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Message:</h3>
      <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px;">
        <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{{message}}</p>
      </div>

      ${button('Reply to ' + '{{name}}', 'mailto:{{email}}?subject=Re: {{subject}}')}
    `, 'New contact form submission received.')
  },

  // 6. Password Reset
  {
    template_name: 'password_reset',
    description: 'Password Reset Request',
    category: 'notifications',
    subject_template: 'Reset Your Long Life Password',
    preheader: 'Click the link to reset your password.',
    data_schema: {
      resetLink: 'string',
      customerName: 'string'
    },
    html_template: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #f0ecea; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">🔐</div>
      </div>

      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">Reset Your Password</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">We received a password reset request</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        We received a request to reset your password. Click the button below to create a new password:
      </p>

      ${button('Reset Password', '{{resetLink}}')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0;">
        This link will expire in 24 hours for security reasons.
      </p>

      <div style="background-color: #fef3cd; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #856404; font-size: 14px; margin: 0;">
          <strong>Didn't request this?</strong><br>
          If you didn't request a password reset, you can safely ignore this email. Your password won't change.
        </p>
      </div>
    `, 'Click the link to reset your password.')
  },

  // 7. Shipping Confirmation
  {
    template_name: 'shipping_confirmation',
    description: 'Order Shipped Notification',
    category: 'orders',
    subject_template: 'Your Long Life Order is On Its Way! 📦',
    preheader: 'Your order has shipped! Track your package.',
    data_schema: {
      orderNumber: 'string',
      customerName: 'string',
      trackingNumber: 'string',
      trackingUrl: 'string',
      carrier: 'string',
      estimatedDelivery: 'string'
    },
    html_template: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #8cbfa4; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">📦</div>
      </div>

      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">Your Order Has Shipped!</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Order #{{orderNumber}}</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Great news! Your Long Life order is on its way to you. Fresh, cold-pressed goodness coming soon!
      </p>

      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #0f5348; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Shipping Details</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Carrier</td>
            <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{carrier}}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Tracking #</td>
            <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{trackingNumber}}</td>
          </tr>
          <tr>
            <td style="color: #666; font-size: 14px; padding: 8px 0;">Est. Delivery</td>
            <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0;">{{estimatedDelivery}}</td>
          </tr>
        </table>
      </div>

      ${button('Track Package', '{{trackingUrl}}')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
        For the freshest experience, refrigerate your juices upon arrival!
      </p>
    `, 'Your order has shipped! Track your package.')
  },

  // 8. Subscription Canceled
  {
    template_name: 'subscription_canceled',
    description: 'Subscription Cancellation Confirmation',
    category: 'subscriptions',
    subject_template: 'Your Long Life Subscription Has Been Canceled',
    preheader: 'We are sorry to see you go.',
    data_schema: {
      customerName: 'string',
      planName: 'string',
      endDate: 'string'
    },
    html_template: emailWrapper(`
      <h1 style="color: #0f5348; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">Subscription Canceled</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0;">We're sorry to see you go</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        Your <strong>{{planName}}</strong> subscription has been canceled. You'll continue to have access until <strong>{{endDate}}</strong>.
      </p>

      <div style="background-color: #f8f7f6; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
          <strong>Changed your mind?</strong><br>
          You can resubscribe anytime from your account. We'd love to have you back!
        </p>
      </div>

      ${button('Resubscribe', SITE_URL + '/blends')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
        We'd love to hear your feedback. What could we have done better?<br>
        <a href="mailto:hello@drinklonglife.com" style="color: #0f5348;">hello@drinklonglife.com</a>
      </p>
    `, 'We are sorry to see you go.')
  },

  // 9. Payment Failed
  {
    template_name: 'payment_failed',
    description: 'Payment Failed Notification',
    category: 'subscriptions',
    subject_template: 'Action Required: Payment Failed for Your Subscription',
    preheader: 'Please update your payment method to continue your subscription.',
    data_schema: {
      customerName: 'string',
      planName: 'string',
      amount: 'number',
      currency: 'string',
      retryDate: 'string'
    },
    html_template: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #fee2e2; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 32px;">⚠️</div>
      </div>

      <h1 style="color: #dc2626; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">Payment Failed</h1>
      <p style="color: #666; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Action required to continue your subscription</p>

      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi {{customerName}},<br><br>
        We weren't able to process your payment of <strong>\${{amount}}</strong> for your <strong>{{planName}}</strong> subscription.
      </p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;">
          <strong>What happens next?</strong><br>
          We'll automatically retry on <strong>{{retryDate}}</strong>. To avoid any interruption, please update your payment method before then.
        </p>
      </div>

      ${button('Update Payment Method', SITE_URL + '/account/billing')}

      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
        Need help? Contact us at <a href="mailto:hello@drinklonglife.com" style="color: #0f5348;">hello@drinklonglife.com</a>
      </p>
    `, 'Please update your payment method to continue your subscription.')
  }
];

async function updateTemplates() {
  console.log('🎨 Updating email templates with professional designs...\n');

  for (const template of templates) {
    console.log(`📧 Updating: ${template.template_name}`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/email_template_versions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        template_name: template.template_name,
        version_type: 'published',
        subject_template: template.subject_template,
        html_template: template.html_template,
        preheader: template.preheader,
        category: template.category,
        description: template.description,
        data_schema: template.data_schema
      })
    });

    if (response.ok) {
      console.log(`   ✅ ${template.description}`);
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed: ${error}`);
    }
  }

  console.log('\n✨ Email templates updated successfully!');
  console.log(`\n📋 Summary: ${templates.length} templates updated`);
  console.log('\nTemplates:');
  templates.forEach(t => console.log(`   - ${t.template_name}: ${t.description}`));
}

updateTemplates().catch(console.error);
