/**
 * Admin Order Management Helper Functions
 *
 * Functions for fetching, filtering, and managing orders in the admin panel
 */

import { createServiceRoleClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe/config';
import { logger } from '@/lib/logger';

// Order status type based on database schema
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed' | 'failed' | 'refunded';
export type PaymentStatus = 'unpaid' | 'paid' | 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partial_refund';

export interface Order {
  id: string;
  user_id: string | null;
  stripe_session_id: string;
  customer_email: string | null;
  amount_total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  failedOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
}

/**
 * Get all orders with optional filtering
 */
export async function getOrders(filters: OrderFilters = {}): Promise<Order[]> {
  const supabase = createServiceRoleClient();

  const {
    status,
    paymentStatus,
    searchQuery,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = filters;

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (paymentStatus) {
    query = query.eq('payment_status', paymentStatus);
  }

  if (searchQuery) {
    query = query.or(
      `customer_email.ilike.%${searchQuery}%,stripe_session_id.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`
    );
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching orders:', error);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data as Order[];
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = createServiceRoleClient();

  const { data, error} = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    logger.error('Error fetching order:', error);
    return null;
  }

  return data as Order;
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<OrderStats> {
  const supabase = createServiceRoleClient();

  // Get all orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('amount_total, status, payment_status');

  if (error) {
    logger.error('Error fetching order stats:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      refundedOrders: 0,
      averageOrderValue: 0,
    };
  }

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.amount_total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    failedOrders: orders.filter(o => o.status === 'failed').length,
    refundedOrders: orders.filter(o => o.status === 'refunded').length,
    averageOrderValue: orders.length > 0
      ? orders.reduce((sum, order) => sum + order.amount_total, 0) / orders.length
      : 0,
  };

  return stats;
}

/**
 * Get Stripe session details for an order
 */
export async function getStripeSession(sessionId: string) {
  const stripe = await getStripeClient();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });
    return session;
  } catch (error) {
    logger.error('Error fetching Stripe session:', error);
    return null;
  }
}

/**
 * Process a refund for an order
 */
export async function processRefund(orderId: string, amount?: number): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createServiceRoleClient();

  // Get order
  const order = await getOrderById(orderId);
  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  // Validate partial refund amount against order total
  if (amount !== undefined && amount > order.amount_total) {
    return {
      success: false,
      error: `Refund amount (${amount}) exceeds order total (${order.amount_total})`,
    };
  }

  // Get Stripe session
  const session = await getStripeSession(order.stripe_session_id);
  if (!session || !session.payment_intent) {
    return { success: false, error: 'Payment intent not found' };
  }

  // Initialize Stripe
  const stripe = await getStripeClient();

  try {
    // Create refund
    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id;

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // undefined = full refund
    });

    if (refund.status === 'succeeded') {
      // Update order status in database
      await supabase
        .from('orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return { success: true };
    } else {
      return { success: false, error: 'Refund failed' };
    }
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Error processing refund:', err);
    return { success: false, error: err.message || 'Refund failed' };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Error updating order status:', err);
    return { success: false, error: err.message || 'Failed to update order status' };
  }
}
