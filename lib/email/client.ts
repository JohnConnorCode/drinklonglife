import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Long Life <hello@drinklonglife.com>',
  supportEmail: 'support@drinklonglife.com',
  noReply: 'noreply@drinklonglife.com',
} as const;
