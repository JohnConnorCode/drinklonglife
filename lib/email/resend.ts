import { Resend } from 'resend';

// Initialize Resend client
// Note: To use in production, add RESEND_API_KEY to environment variables
// Get your API key from https://resend.com/api-keys
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Check if Resend is configured
export const isEmailConfigured = () => {
  return !!process.env.RESEND_API_KEY;
};

// Default sender email (configure in Resend dashboard)
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Long Life <orders@drinklonglife.com>';
