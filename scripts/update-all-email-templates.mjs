#!/usr/bin/env node
/**
 * Update ALL email templates with premium design
 * - Full logo (icon + Long + Life text)
 * - Engaging copy
 * - Ambassador program promotion
 * - Better footer with social links
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const LOGO_URL = 'https://drinklonglife.com/long-life-logo.png';
const SITE_URL = 'https://drinklonglife.com';

// Brand colors
const COLORS = {
  primary: '#0f5348',      // Dark teal
  primaryLight: '#1a7a6a', // Lighter teal for hover
  yellow: '#d7f25c',       // Lime yellow accent
  green: '#8cbfa4',        // Soft green
  cream: '#f0ecea',        // Warm cream background
  dark: '#1a1a1a',         // Near black
  gray: '#666666',
  lightGray: '#999999',
};

// Ambassador CTA block
const ambassadorCTA = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 12px 0;">
  <tr>
    <td style="background: linear-gradient(135deg, ${COLORS.dark} 0%, #2d2d2d 100%); border-radius: 12px; padding: 24px; text-align: center;">
      <p style="color: ${COLORS.yellow}; font-size: 11px; font-weight: 700; letter-spacing: 2px; margin: 0 0 10px 0; text-transform: uppercase;">JOIN THE MOVEMENT</p>
      <h3 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">Become a Long Life Ambassador</h3>
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">Share wellness. Earn rewards. Help others discover cold-pressed nutrition.</p>
      <a href="${SITE_URL}/referral" style="display: inline-block; background-color: ${COLORS.yellow}; color: ${COLORS.dark}; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px;">Learn More →</a>
    </td>
  </tr>
</table>`;

// Premium email wrapper
const emailWrapper = (content, preheader = '') => `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Long Life</title>
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${COLORS.cream}; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    .button:hover { opacity: 0.9; }
    @media screen and (max-width: 600px) {
      .mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }
      .mobile-full-width { width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.cream}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ''}

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.cream};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;" class="mobile-full-width">

          <!-- HEADER with Full Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${SITE_URL}" style="text-decoration: none;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <img src="${LOGO_URL}" alt="Long Life" width="56" style="display: block; width: 56px; height: auto;">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 8px;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: ${COLORS.dark};">Long</span><span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: ${COLORS.primary};">Life</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <!-- MAIN CONTENT CARD -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
                <tr>
                  <td style="padding: 32px;" class="mobile-padding">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 28px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <!-- Social Links -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="https://instagram.com/drinklonglife" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/32/174/174855.png" alt="Instagram" width="24" height="24" style="opacity: 0.6;">
                    </a>
                    <a href="https://facebook.com/drinklonglife" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/32/174/174848.png" alt="Facebook" width="24" height="24" style="opacity: 0.6;">
                    </a>
                    <a href="https://tiktok.com/@drinklonglife" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                      <img src="https://cdn-icons-png.flaticon.com/32/3046/3046121.png" alt="TikTok" width="24" height="24" style="opacity: 0.6;">
                    </a>
                  </td>
                </tr>

                <!-- Quick Links -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="${SITE_URL}/blends" style="color: ${COLORS.gray}; text-decoration: none; font-size: 13px; margin: 0 12px;">Shop</a>
                    <a href="${SITE_URL}/about" style="color: ${COLORS.gray}; text-decoration: none; font-size: 13px; margin: 0 12px;">About</a>
                    <a href="${SITE_URL}/journal" style="color: ${COLORS.gray}; text-decoration: none; font-size: 13px; margin: 0 12px;">Journal</a>
                    <a href="${SITE_URL}/referral" style="color: ${COLORS.primary}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Ambassadors</a>
                  </td>
                </tr>

                <!-- Brand -->
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <span style="font-size: 18px; font-weight: 700; color: ${COLORS.dark};">Long</span><span style="font-size: 18px; font-weight: 700; color: ${COLORS.primary};">Life</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="color: ${COLORS.lightGray}; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0;">Cold-Pressed Wellness, Delivered Fresh</p>
                    <p style="margin: 8px 0 0 0;">© 2025 Long Life Juicery. Made with 🥬 in Indiana.</p>
                  </td>
                </tr>

                <!-- Unsubscribe -->
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <a href="${SITE_URL}/account/preferences" style="color: ${COLORS.lightGray}; font-size: 11px; text-decoration: underline;">Manage email preferences</a>
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

// Primary button
const button = (text, url) => `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
  <tr>
    <td align="center">
      <a href="${url}" class="button" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px;">${text}</a>
    </td>
  </tr>
</table>`;

// Secondary button
const secondaryButton = (text, url) => `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="display: inline-block; background-color: transparent; color: ${COLORS.primary}; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 14px; border: 2px solid ${COLORS.primary};">${text}</a>
    </td>
  </tr>
</table>`;

// Highlight box
const highlightBox = (content, bgColor = '#f8f7f6') => `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
  <tr>
    <td style="background-color: ${bgColor}; border-radius: 12px; padding: 20px;">
      ${content}
    </td>
  </tr>
</table>`;

// All templates
const templates = [
  // 1. ORDER CONFIRMATION
  {
    name: 'order_confirmation',
    subject: "We're on it! Your Long Life order is confirmed 🧃",
    preheader: 'Fresh, cold-pressed goodness coming your way.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="display: inline-block; background-color: ${COLORS.yellow}; color: ${COLORS.dark}; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 50px; letter-spacing: 1px; text-transform: uppercase;">ORDER CONFIRMED</span>
      </div>

      <h1 style="color: ${COLORS.dark}; font-size: 32px; font-weight: 700; margin: 0 0 8px 0; text-align: center; line-height: 1.2;">Thanks for your order, {{customerName}}!</h1>
      <p style="color: ${COLORS.gray}; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Order #{{orderNumber}}</p>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Your fresh, cold-pressed juices are being prepared with care. We source only the finest organic ingredients and press them fresh for maximum nutrition.
      </p>

      ${highlightBox(`
        <p style="color: ${COLORS.gray}; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 16px 0;">ORDER SUMMARY</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: ${COLORS.dark}; font-size: 18px; font-weight: 700; padding: 16px 0; border-top: 2px solid ${COLORS.primary};">Total</td>
            <td align="right" style="color: ${COLORS.primary}; font-size: 18px; font-weight: 700; padding: 16px 0; border-top: 2px solid ${COLORS.primary};">{{total}}</td>
          </tr>
        </table>
      `)}

      ${button('Track Your Order', SITE_URL + '/account/orders')}

      <p style="color: ${COLORS.gray}; font-size: 14px; line-height: 1.6; text-align: center; margin: 0 0 16px 0;">
        <strong>Pro tip:</strong> Refrigerate your juices as soon as they arrive for maximum freshness and nutrition!
      </p>

      ${ambassadorCTA}

      <p style="color: ${COLORS.lightGray}; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
        Questions? Just reply to this email — we're here to help!
      </p>
    `, 'Fresh, cold-pressed goodness coming your way.')
  },

  // 2. SUBSCRIPTION CONFIRMATION
  {
    name: 'subscription_confirmation',
    subject: "You're in! Welcome to the Long Life family 🌱",
    preheader: 'Your subscription is active. Wellness delivered, on repeat.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: ${COLORS.yellow}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">🎉</div>
      </div>

      <h1 style="color: ${COLORS.dark}; font-size: 32px; font-weight: 700; margin: 0 0 8px 0; text-align: center; line-height: 1.2;">Welcome to the family, {{customerName}}!</h1>
      <p style="color: ${COLORS.primary}; font-size: 18px; font-weight: 600; margin: 0 0 32px 0; text-align: center;">Your {{planName}} subscription is now active</p>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        You've just made one of the best decisions for your health. Fresh, cold-pressed nutrition will now arrive at your door like clockwork — no thinking required.
      </p>

      ${highlightBox(`
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0;">Your Plan</td>
            <td align="right" style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; padding: 8px 0;">{{planName}}</td>
          </tr>
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0;">Next Delivery</td>
            <td align="right" style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; padding: 8px 0;">{{nextBillingDate}}</td>
          </tr>
        </table>
      `)}

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 24px 0;">
        <strong>What happens next?</strong> We'll prepare your first batch of cold-pressed goodness and ship it your way. You'll get a tracking email when it's on the move.
      </p>

      ${button('Manage Subscription', SITE_URL + '/account/subscription')}

      ${ambassadorCTA}
    `, 'Wellness delivered, on repeat.')
  },

  // 3. WELCOME (New Signup)
  {
    name: 'welcome',
    subject: "Welcome to Long Life — let's get you glowing 🌿",
    preheader: 'Your wellness journey starts now.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: ${COLORS.green}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">🌱</div>
      </div>

      <h1 style="color: ${COLORS.dark}; font-size: 32px; font-weight: 700; margin: 0 0 16px 0; text-align: center; line-height: 1.2;">Welcome, {{customerName}}!</h1>
      <p style="color: ${COLORS.gray}; font-size: 18px; margin: 0 0 32px 0; text-align: center;">You just joined a movement.</p>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Long Life isn't just juice — it's a commitment to feeling your absolute best. Our cold-pressed blends are packed with raw, organic nutrition that your body craves.
      </p>

      ${highlightBox(`
        <p style="color: ${COLORS.primary}; font-size: 14px; font-weight: 700; margin: 0 0 16px 0;">🚀 GET STARTED</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
              <strong style="color: ${COLORS.dark};">1. Find Your Blend</strong>
              <p style="color: ${COLORS.gray}; font-size: 14px; margin: 4px 0 0 0;">Yellow Bomb for energy. Green Bomb for cleanse. Red Bomb for recovery.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
              <strong style="color: ${COLORS.dark};">2. Choose Your Style</strong>
              <p style="color: ${COLORS.gray}; font-size: 14px; margin: 4px 0 0 0;">One-time order or subscribe to save 15% and never run out.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <strong style="color: ${COLORS.dark};">3. Feel the Difference</strong>
              <p style="color: ${COLORS.gray}; font-size: 14px; margin: 4px 0 0 0;">Most customers notice more energy within the first week.</p>
            </td>
          </tr>
        </table>
      `)}

      ${button('Shop Our Blends', SITE_URL + '/blends')}

      ${ambassadorCTA}
    `, 'Your wellness journey starts now.')
  },

  // 4. NEWSLETTER WELCOME
  {
    name: 'newsletter_welcome',
    subject: "You're on the list! 🌿",
    preheader: 'Get exclusive wellness tips, recipes, and subscriber-only offers.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: ${COLORS.yellow}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">✉️</div>
      </div>

      <h1 style="color: ${COLORS.dark}; font-size: 32px; font-weight: 700; margin: 0 0 16px 0; text-align: center; line-height: 1.2;">You're officially in!</h1>
      <p style="color: ${COLORS.gray}; font-size: 18px; margin: 0 0 32px 0; text-align: center;">Welcome to the Long Life community.</p>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Get ready for your inbox to be a whole lot healthier. Here's what you can expect from us:
      </p>

      ${highlightBox(`
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td style="padding: 10px 0; font-size: 15px; color: ${COLORS.dark};">✨ <strong>Early access</strong> to new products and flavors</td></tr>
          <tr><td style="padding: 10px 0; font-size: 15px; color: ${COLORS.dark};">🎁 <strong>Subscriber-only discounts</strong> (we're talking good ones)</td></tr>
          <tr><td style="padding: 10px 0; font-size: 15px; color: ${COLORS.dark};">🥗 <strong>Wellness tips</strong> and easy healthy recipes</td></tr>
          <tr><td style="padding: 10px 0; font-size: 15px; color: ${COLORS.dark};">📚 <strong>The latest</strong> from our journal</td></tr>
        </table>
      `)}

      ${button('Start Shopping', SITE_URL + '/blends')}

      ${ambassadorCTA}

      <p style="color: ${COLORS.lightGray}; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
        We'll never spam you. Unsubscribe anytime.
      </p>
    `, 'Exclusive wellness tips, recipes, and subscriber-only offers.')
  },

  // 5. CONTACT FORM NOTIFICATION (Internal)
  {
    name: 'contact_form_notification',
    subject: '📬 New message from {{name}}: {{subject}}',
    preheader: 'New contact form submission.',
    html: emailWrapper(`
      <h1 style="color: ${COLORS.dark}; font-size: 24px; font-weight: 700; margin: 0 0 24px 0;">New Contact Form Message</h1>

      ${highlightBox(`
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0; width: 80px; vertical-align: top;">From:</td>
            <td style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; padding: 8px 0;">{{name}}</td>
          </tr>
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0; vertical-align: top;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:{{email}}" style="color: ${COLORS.primary}; font-size: 14px;">{{email}}</a></td>
          </tr>
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0; vertical-align: top;">Subject:</td>
            <td style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; padding: 8px 0;">{{subject}}</td>
          </tr>
        </table>
      `)}

      <h3 style="color: ${COLORS.dark}; font-size: 16px; font-weight: 600; margin: 24px 0 12px 0;">Message:</h3>
      <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px;">
        <p style="color: ${COLORS.dark}; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">{{message}}</p>
      </div>

      ${button('Reply to ' + '{{name}}', 'mailto:{{email}}?subject=Re: {{subject}}')}
    `, 'New contact form submission.')
  },

  // 6. SHIPPING CONFIRMATION
  {
    name: 'shipping_confirmation',
    subject: "It's on the way! Your Long Life order shipped 📦",
    preheader: 'Track your package and prepare your fridge!',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: ${COLORS.green}; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">📦</div>
      </div>

      <h1 style="color: ${COLORS.dark}; font-size: 32px; font-weight: 700; margin: 0 0 8px 0; text-align: center; line-height: 1.2;">Your order is on its way!</h1>
      <p style="color: ${COLORS.gray}; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Order #{{orderNumber}}</p>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Hey {{customerName}}, great news! Your fresh juices have left our facility and are heading your way. Time to clear some fridge space!
      </p>

      ${highlightBox(`
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0;">Carrier</td>
            <td align="right" style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; padding: 8px 0;">{{carrier}}</td>
          </tr>
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0;">Tracking #</td>
            <td align="right" style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; padding: 8px 0;">{{trackingNumber}}</td>
          </tr>
          <tr>
            <td style="color: ${COLORS.gray}; font-size: 14px; padding: 8px 0;">Est. Arrival</td>
            <td align="right" style="color: ${COLORS.primary}; font-size: 14px; font-weight: 700; padding: 8px 0;">{{estimatedDelivery}}</td>
          </tr>
        </table>
      `)}

      ${button('Track Package', '{{trackingUrl}}')}

      <div style="background-color: ${COLORS.yellow}; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: ${COLORS.dark}; font-size: 14px; font-weight: 600; margin: 0;">🧊 Pro tip: Refrigerate immediately upon arrival for maximum freshness!</p>
      </div>

      ${ambassadorCTA}
    `, 'Track your package and prepare your fridge!')
  },

  // 7. SUBSCRIPTION CANCELED
  {
    name: 'subscription_canceled',
    subject: "We'll miss you — your subscription has been canceled",
    preheader: "You'll still have access until your current period ends.",
    html: emailWrapper(`
      <h1 style="color: ${COLORS.dark}; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">We're sad to see you go</h1>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Hey {{customerName}}, your <strong>{{planName}}</strong> subscription has been canceled. You'll continue to have access until <strong>{{endDate}}</strong>.
      </p>

      ${highlightBox(`
        <p style="color: ${COLORS.dark}; font-size: 15px; line-height: 1.6; margin: 0;">
          <strong>Changed your mind?</strong> We'd love to have you back. Resubscribe anytime and get back on the path to feeling amazing.
        </p>
      `)}

      ${button('Come Back Anytime', SITE_URL + '/blends')}

      <p style="color: ${COLORS.gray}; font-size: 14px; line-height: 1.6; text-align: center; margin: 24px 0 0 0;">
        We'd really appreciate your feedback. What could we have done better?<br>
        <a href="mailto:hello@drinklonglife.com?subject=Feedback" style="color: ${COLORS.primary}; font-weight: 600;">Share your thoughts →</a>
      </p>
    `, "You'll still have access until your period ends.")
  },

  // 8. PAYMENT FAILED
  {
    name: 'payment_failed',
    subject: '⚠️ Action needed: Your payment didn\'t go through',
    preheader: 'Update your payment method to continue your subscription.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #fee2e2; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">⚠️</div>
      </div>

      <h1 style="color: #dc2626; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">Payment unsuccessful</h1>
      <p style="color: ${COLORS.gray}; font-size: 16px; margin: 0 0 32px 0; text-align: center;">Don't worry — this is an easy fix.</p>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Hey {{customerName}}, we tried to process your payment of <strong>{{amount}}</strong> for your {{planName}} subscription, but it didn't go through.
      </p>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;">
          <strong>What happens next?</strong><br>
          We'll automatically retry on <strong>{{retryDate}}</strong>. To avoid any interruption to your wellness routine, please update your payment method before then.
        </p>
      </div>

      ${button('Update Payment Method', SITE_URL + '/account/billing')}

      <p style="color: ${COLORS.lightGray}; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
        Need help? Just reply to this email.
      </p>
    `, 'Update your payment method to continue.')
  },

  // 9. PASSWORD RESET
  {
    name: 'password_reset',
    subject: 'Reset your Long Life password',
    preheader: 'Click the link to create a new password.',
    html: emailWrapper(`
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: #f0ecea; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; font-size: 40px;">🔐</div>
      </div>

      <h1 style="color: ${COLORS.dark}; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">Reset your password</h1>

      <p style="color: ${COLORS.dark}; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
        Hey {{customerName}}, we received a request to reset your password. Click the button below to create a new one:
      </p>

      ${button('Reset Password', '{{resetLink}}')}

      <p style="color: ${COLORS.gray}; font-size: 14px; line-height: 1.6; text-align: center; margin: 24px 0;">
        This link expires in 24 hours for security.
      </p>

      <div style="background-color: #fef3cd; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #856404; font-size: 14px; margin: 0;">
          <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't change unless you click the button above.
        </p>
      </div>
    `, 'Click the link to create a new password.')
  }
];

async function updateTemplate(name, data) {
  // Get existing template
  const getResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/email_template_versions?template_name=eq.${name}&version_type=eq.published&select=id`,
    { headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
  );

  const existing = await getResponse.json();

  if (existing && existing.length > 0) {
    // Update existing
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/email_template_versions?id=eq.${existing[0].id}`,
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
    return updateResponse.ok ? 'updated' : 'failed';
  } else {
    // Create new
    const createResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/email_template_versions`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: name,
          version_type: 'published',
          subject_template: data.subject,
          html_template: data.html,
          preheader: data.preheader,
        })
      }
    );
    return createResponse.ok ? 'created' : 'failed';
  }
}

async function main() {
  console.log('🎨 Updating ALL email templates with premium design...\n');
  console.log('Features:');
  console.log('  ✓ Full logo (icon + Long + Life text)');
  console.log('  ✓ Engaging, friendly copy');
  console.log('  ✓ Ambassador program promotion');
  console.log('  ✓ Social links footer');
  console.log('  ✓ Mobile responsive\n');

  for (const template of templates) {
    console.log(`📧 ${template.name}...`);
    const result = await updateTemplate(template.name, template);
    console.log(`   ${result === 'failed' ? '❌ Failed' : '✅ ' + result.charAt(0).toUpperCase() + result.slice(1)}`);
  }

  console.log('\n✨ All templates updated!');
  console.log(`\n📊 Summary: ${templates.length} templates processed`);
}

main().catch(console.error);
