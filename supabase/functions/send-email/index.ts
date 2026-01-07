import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, any>;
  userId?: string;
  testMode?: boolean;
}

interface Template {
  id: string;
  template_name: string;
  subject_template: string;
  html_template: string;
  text_template?: string;
  data_schema: Record<string, any>;
}

// Standard email partials - DRY approach for consistent styling
// Optimized for email client compatibility (Outlook, Gmail, Apple Mail)
const STANDARD_STYLES = `
  /* Reset and base styles */
  body, table, td, p, a, li, blockquote {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    width: 100% !important;
  }
  table {
    border-collapse: collapse;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  img {
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
    -ms-interpolation-mode: bicubic;
  }
  .email-wrapper {
    width: 100%;
    background-color: #f5f5f5;
    padding: 20px 0;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .header {
    text-align: center;
    padding: 30px 20px;
    background-color: #22c55e; /* Fallback for email clients that don't support gradients */
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
  }
  .logo {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #ffffff;
  }
  .tagline {
    font-size: 14px;
    opacity: 0.9;
    color: #ffffff;
  }
  .content {
    padding: 30px;
  }
  h1 {
    color: #1f2937;
    margin-top: 0;
    font-size: 24px;
    line-height: 1.3;
  }
  h2, h3 {
    color: #1f2937;
    margin-top: 0;
  }
  p {
    margin: 0 0 16px 0;
  }
  a {
    color: #22c55e;
    text-decoration: none;
  }
  .button {
    display: inline-block;
    background-color: #22c55e;
    color: #ffffff !important;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  }
  .button:hover {
    background-color: #16a34a;
  }
  .footer {
    text-align: center;
    padding: 20px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 13px;
  }
  .footer a {
    color: #22c55e;
    text-decoration: none;
  }
  .info-box {
    background-color: #f3f4f6;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
  .highlight-box {
    background-color: #ecfdf5;
    border-left: 4px solid #22c55e;
    padding: 20px;
    border-radius: 0 8px 8px 0;
    margin: 20px 0;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .items-table th, .items-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }
  .items-table th {
    background-color: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
  /* Mobile responsiveness */
  @media only screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
      border-radius: 0;
    }
    .content {
      padding: 20px !important;
    }
    .button {
      display: block !important;
      width: 100% !important;
    }
  }
`;

const STANDARD_HEADER = `
<div class="header">
  <div class="logo">Long Life</div>
  <div class="tagline">Cold-Pressed Wellness</div>
</div>
`;

const STANDARD_FOOTER = `
<div class="footer">
  <!-- Ambassador CTA - appears in all customer emails -->
  <div style="background-color: #ecfdf5; padding: 16px 20px; margin: 0 -20px 20px -20px; border-top: 2px solid #22c55e;">
    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #166534;">Love Long Life? Become an Ambassador!</p>
    <p style="margin: 0 0 12px 0; font-size: 13px; color: #15803d;">Earn rewards when you share the wellness with friends.</p>
    <a href="https://drinklonglife.com/ambassador" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 8px 20px; text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 600;">Join the Movement</a>
  </div>

  <p style="margin: 0 0 8px 0;">Questions? Contact us at <a href="mailto:support@drinklonglife.com" style="color: #22c55e;">support@drinklonglife.com</a></p>

  <!-- CAN-SPAM Compliance: Physical Address Required -->
  <p style="margin: 8px 0; font-size: 12px; color: #9ca3af;">
    Long Life, Inc.<br>
    Los Angeles, CA
  </p>

  <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
    <a href="{{unsubscribeUrl}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> ·
    <a href="{{preferencesUrl}}" style="color: #6b7280; text-decoration: underline;">Email Preferences</a>
  </p>
</div>
`;

/**
 * Substitute {{variables}} in template with actual data
 */
function substituteVariables(template: string, data: Record<string, any>): string {
  let result = template;

  // First, inject standard partials (DRY - defined once, used everywhere)
  result = result.replace(/{{standardStyles}}/g, STANDARD_STYLES);
  result = result.replace(/{{standardHeader}}/g, STANDARD_HEADER);
  result = result.replace(/{{standardFooter}}/g, STANDARD_FOOTER);

  // Handle special {{itemsTable}} variable for order confirmations
  if (template.includes('{{itemsTable}}') && data.items && Array.isArray(data.items)) {
    const itemsHtml = `
<table class="items-table">
  <thead>
    <tr>
      <th>Item</th>
      <th>Quantity</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    ${data.items.map((item: any) => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.price, data.currency || 'usd')}</td>
    </tr>
    `).join('')}
  </tbody>
</table>
    `.trim();

    result = result.replace('{{itemsTable}}', itemsHtml);
  }

  // Replace all {{variableName}} with actual values
  for (const [key, value] of Object.entries(data)) {
    const pattern = new RegExp(`{{${key}}}`, 'g');

    // Format special types
    let formattedValue = value;
    if (key === 'subtotal' || key === 'total' || key === 'planPrice') {
      formattedValue = formatCurrency(value as number, data.currency || 'usd');
    } else if (typeof value === 'string') {
      formattedValue = escapeHtml(value);
    } else if (value === null || value === undefined) {
      formattedValue = '';
    } else if (typeof value === 'object') {
      // Skip complex objects (like items array)
      continue;
    }

    result = result.replace(pattern, String(formattedValue));
  }

  // Replace unsubscribe/preferences URLs (these should be generated by the system)
  result = result.replace(/{{unsubscribeUrl}}/g, `https://drinklonglife.com/unsubscribe?token={{unsubscribe_token}}`);
  result = result.replace(/{{preferencesUrl}}/g, `https://drinklonglife.com/account/email-preferences`);

  return result;
}

/**
 * Format currency amount (cents to dollar display)
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Check user email preferences
 */
async function checkEmailPreferences(
  supabase: any,
  userId: string | undefined,
  templateName: string
): Promise<{ allowed: boolean; token?: string }> {
  if (!userId) {
    return { allowed: true }; // No user ID, allow (e.g., guest checkout)
  }

  const { data: prefs, error } = await supabase
    .from('email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !prefs) {
    // No preferences found, allow by default
    return { allowed: true };
  }

  // Check global email setting
  if (!prefs.all_emails_enabled) {
    return { allowed: false };
  }

  // Check category-specific settings
  const categoryMap: Record<string, string> = {
    order_confirmation: 'order_confirmations',
    subscription_confirmation: 'subscription_notifications',
    newsletter_welcome: 'newsletter',
    contact_form_notification: 'transactional_emails',
  };

  const prefKey = categoryMap[templateName];
  if (prefKey && prefs[prefKey] === false) {
    return { allowed: false };
  }

  return { allowed: true, token: prefs.unsubscribe_token };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Long Life <hello@drinklonglife.com>';

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { to, template: templateName, data, userId, testMode }: EmailRequest = await req.json();

    if (!to || !templateName || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, template, data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Load published template from database
    const { data: template, error: templateError } = await supabase
      .from('email_template_versions')
      .select('*')
      .eq('template_name', templateName)
      .eq('version_type', 'published')
      .single() as { data: Template | null; error: any };

    if (templateError || !template) {
      console.error('Template not found:', templateName, templateError);
      return new Response(
        JSON.stringify({ error: `Template '${templateName}' not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check user email preferences (skip if test mode)
    if (!testMode) {
      const { allowed } = await checkEmailPreferences(supabase, userId, templateName);
      if (!allowed) {
        console.log(`Email not sent to ${to}: User has disabled ${templateName} emails`);
        return new Response(
          JSON.stringify({ success: false, reason: 'User email preferences' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. Substitute variables in subject and HTML
    let subject = substituteVariables(template.subject_template, data);
    let htmlContent = substituteVariables(template.html_template, data);

    // Add [TEST] prefix in test mode
    if (testMode) {
      subject = `[TEST] ${subject}`;
    }

    // 4. Create audit record in email_notifications
    const { data: notification, error: notificationError } = await supabase
      .from('email_notifications')
      .insert({
        user_id: userId || null,
        email: to,
        template_name: templateName,
        subject,
        html_content: htmlContent,
        template_data: data,
        status: 'pending',
        is_test: testMode || false,
      })
      .select()
      .single();

    if (notificationError) {
      console.error('Failed to create notification record:', notificationError);
      throw new Error('Failed to create audit record');
    }

    // 5. Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject,
        html: htmlContent,
        headers: {
          'X-Notification-ID': notification.id,
        },
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);

      // Update notification with error
      await supabase
        .from('email_notifications')
        .update({
          status: 'failed',
          error_message: JSON.stringify(resendData),
        })
        .eq('id', notification.id);

      throw new Error(`Failed to send email: ${JSON.stringify(resendData)}`);
    }

    // 6. Update notification as sent
    await supabase
      .from('email_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { resend_id: resendData.id },
      })
      .eq('id', notification.id);

    console.log(`✅ Email sent: ${templateName} to ${to} (Resend ID: ${resendData.id})`);

    return new Response(
      JSON.stringify({
        success: true,
        id: resendData.id,
        notificationId: notification.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send email error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
