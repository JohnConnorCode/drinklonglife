import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { resend, isEmailConfigured, DEFAULT_FROM_EMAIL } from './resend';
import {
  OrderConfirmationEmail,
  SubscriptionConfirmationEmail,
} from './templates';

interface SendOrderConfirmationParams {
  to: string;
  orderNumber: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
}

export async function sendOrderConfirmationEmail(params: SendOrderConfirmationParams) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const html = await render(
      OrderConfirmationEmail({
        orderNumber: params.orderNumber,
        customerEmail: params.to,
        customerName: params.customerName,
        items: params.items,
        subtotal: params.subtotal,
        total: params.total,
        currency: params.currency,
      })
    );

    const { data, error } = await resend!.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: params.to,
      subject: `Order Confirmation #${params.orderNumber} - Long Life`,
      html,
    });

    if (error) {
      logger.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Error sending order confirmation email:', error);
    return { success: false, error };
  }
}

interface SendSubscriptionConfirmationParams {
  to: string;
  customerName?: string;
  planName: string;
  planPrice: number;
  billingInterval: string;
  nextBillingDate: string;
  currency: string;
}

export async function sendSubscriptionConfirmationEmail(params: SendSubscriptionConfirmationParams) {
  if (!isEmailConfigured()) {
    return { success: false, error: 'Email not configured' };
  }

  try {
    const html = await render(
      SubscriptionConfirmationEmail({
        customerEmail: params.to,
        customerName: params.customerName,
        planName: params.planName,
        planPrice: params.planPrice,
        billingInterval: params.billingInterval,
        nextBillingDate: params.nextBillingDate,
        currency: params.currency,
      })
    );

    const { data, error } = await resend!.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: params.to,
      subject: `Welcome to Your ${params.planName} Subscription - Long Life`,
      html,
    });

    if (error) {
      logger.error('Failed to send subscription confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Error sending subscription confirmation email:', error);
    return { success: false, error };
  }
}
