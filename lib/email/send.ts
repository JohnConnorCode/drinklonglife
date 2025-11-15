import { renderToStaticMarkup } from 'react-dom/server';
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
    console.warn('Email not configured. Skipping order confirmation email.');
    console.log('Order confirmation would have been sent to:', params.to);
    return { success: false, error: 'Email not configured' };
  }

  try {
    const html = renderToStaticMarkup(
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
      console.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    console.log('Order confirmation email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
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
    console.warn('Email not configured. Skipping subscription confirmation email.');
    console.log('Subscription confirmation would have been sent to:', params.to);
    return { success: false, error: 'Email not configured' };
  }

  try {
    const html = renderToStaticMarkup(
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
      console.error('Failed to send subscription confirmation email:', error);
      return { success: false, error };
    }

    console.log('Subscription confirmation email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error);
    return { success: false, error };
  }
}
