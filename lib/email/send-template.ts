/**
 * Send Email via Database-Driven Templates
 *
 * This is the standardized function for sending emails throughout the application.
 * It calls the Supabase Edge Function which handles template loading, variable
 * substitution, user preferences, and delivery via Resend.
 *
 * Usage:
 *   await sendEmail({
 *     to: 'user@example.com',
 *     template: 'order_confirmation',
 *     data: {
 *       orderNumber: '12345',
 *       customerName: 'John Doe',
 *       items: [...],
 *       subtotal: 5000,
 *       total: 5500,
 *       currency: 'usd',
 *     },
 *     userId: 'user-uuid',
 *   });
 */

export interface SendEmailOptions {
  /** Recipient email address */
  to: string;

  /** Template name (e.g., 'order_confirmation', 'subscription_confirmation') */
  template: string;

  /** Data to substitute in template variables */
  data: Record<string, any>;

  /** Optional user ID (for tracking and preferences) */
  userId?: string;

  /** Test mode: prefixes subject with [TEST] and bypasses user preferences */
  testMode?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  notificationId?: string;
  error?: string;
  reason?: string;
}

/**
 * Send an email using a database-driven template
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, template, data, userId, testMode } = options;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    // Call the Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        to,
        template,
        data,
        userId,
        testMode,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Email sending failed:', result);
      return {
        success: false,
        error: result.error || 'Unknown error',
      };
    }

    return {
      success: true,
      id: result.id,
      notificationId: result.notificationId,
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a test email (bypasses user preferences, adds [TEST] prefix)
 */
export async function sendTestEmail(
  to: string,
  template: string,
  data: Record<string, any>
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    template,
    data,
    testMode: true,
  });
}
