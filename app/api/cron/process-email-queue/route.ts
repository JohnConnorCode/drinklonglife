import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail, sendSubscriptionConfirmationEmail } from '@/lib/email/send';
import { logger } from '@/lib/logger';

/**
 * Email Queue Processor - Runs via Vercel Cron every 5 minutes
 * Processes unsent emails from the email_queue table
 *
 * Security: Vercel Cron automatically adds Authorization header with CRON_SECRET
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export async function GET(req: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (in production)
    if (process.env.NODE_ENV === 'production') {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createServiceRoleClient();

    // Fetch unsent emails that haven't exceeded retry limit
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('sent', false)
      .lt('retry_count', 3) // max_retries is 3
      .order('created_at', { ascending: true })
      .limit(50); // Process 50 at a time

    if (fetchError) {
      logger.error('Error fetching email queue:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch email queue' }, { status: 500 });
    }

    if (!emails || emails.length === 0) {
      return NextResponse.json({
        message: 'No emails to process',
        processed: 0
      });
    }

    logger.info(`Processing ${emails.length} queued emails`);

    let successCount = 0;
    let failureCount = 0;

    // Process each email
    for (const email of emails) {
      try {
        let result: { success: boolean; error?: any };

        switch (email.email_type) {
          case 'order_confirmation':
            result = await sendOrderConfirmationEmail({
              to: email.to_email,
              orderNumber: email.template_data.orderNumber,
              customerName: email.template_data.customerName,
              items: email.template_data.items,
              subtotal: email.template_data.subtotal,
              total: email.template_data.total,
              currency: email.template_data.currency,
            });
            break;

          case 'subscription_confirmation':
            result = await sendSubscriptionConfirmationEmail({
              to: email.to_email,
              customerName: email.template_data.customerName,
              planName: email.template_data.planName,
              planPrice: email.template_data.planPrice,
              billingInterval: email.template_data.billingInterval,
              nextBillingDate: email.template_data.nextBillingDate,
              currency: email.template_data.currency,
            });
            break;

          default:
            logger.warn(`Unknown email type: ${email.email_type}`);
            result = { success: false, error: `Unknown email type: ${email.email_type}` };
        }

        if (result.success) {
          // Mark email as sent
          await supabase
            .from('email_queue')
            .update({
              sent: true,
              sent_at: new Date().toISOString(),
              error_message: null,
            })
            .eq('id', email.id);

          successCount++;
          logger.info(`✅ Sent ${email.email_type} to ${email.to_email}`);
        } else {
          // Increment retry count and log error
          const newRetryCount = email.retry_count + 1;
          await supabase
            .from('email_queue')
            .update({
              retry_count: newRetryCount,
              error_message: result.error ? JSON.stringify(result.error) : 'Unknown error',
            })
            .eq('id', email.id);

          failureCount++;
          logger.error(`❌ Failed to send ${email.email_type} to ${email.to_email} (retry ${newRetryCount}/3):`, result.error);
        }
      } catch (error) {
        // Handle unexpected errors
        const newRetryCount = email.retry_count + 1;
        await supabase
          .from('email_queue')
          .update({
            retry_count: newRetryCount,
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', email.id);

        failureCount++;
        logger.error(`❌ Exception sending ${email.email_type} to ${email.to_email}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Email queue processed',
      processed: emails.length,
      successful: successCount,
      failed: failureCount,
    });

  } catch (error) {
    logger.error('Email queue processor error:', error);
    return NextResponse.json(
      {
        error: 'Email queue processor failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
