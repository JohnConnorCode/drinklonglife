import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email/send-template';
import { createServiceRoleClient } from '@/lib/supabase/server';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Handle contact form submissions
 * Sends notification email to admin and stores in database
 */
export async function POST(req: NextRequest) {
  try {
    const body: ContactFormData = await req.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'All required fields must be filled out' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Store contact submission in database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone || null,
        subject: body.subject,
        message: body.message,
        status: 'new',
      })
      .select()
      .single();

    if (dbError) {
      // If table doesn't exist, just log and continue with email
      logger.warn('Could not save contact submission to database:', dbError.message);
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@drinklonglife.com';

    await sendEmail({
      to: adminEmail,
      template: 'contact_form_notification',
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || 'Not provided',
        subject: body.subject,
        message: body.message,
        submittedAt: new Date().toLocaleString(),
        submissionId: submission?.id || 'N/A',
      },
    });

    logger.info(`Contact form submission from ${body.email} - Subject: ${body.subject}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
    });

  } catch (error) {
    logger.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
