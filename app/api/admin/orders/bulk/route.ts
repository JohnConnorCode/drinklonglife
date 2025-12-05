import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';
import { logger } from '@/lib/logger';

// PATCH - Bulk update orders
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'No status provided' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 100) {
      return NextResponse.json({
        error: 'Cannot update more than 100 orders at once'
      }, { status: 400 });
    }

    // Get orders before update for logging
    const { data: ordersToUpdate } = await supabase
      .from('orders')
      .select('id, status, customer_email')
      .in('id', ids);

    // Update orders
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk update orders error:', error);
      return NextResponse.json({ error: 'Failed to update orders' }, { status: 500 });
    }

    // If marking as shipped, send shipping confirmation emails
    if (status === 'shipped') {
      const emailPromises = (ordersToUpdate || [])
        .filter(o => o.customer_email && o.status !== 'shipped')
        .map(async (order) => {
          try {
            // Send shipping email via edge function
            const emailRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: order.customer_email,
                template: 'shipping_confirmation',
                data: {
                  orderNumber: order.id.slice(0, 8).toUpperCase(),
                  customerName: 'Valued Customer',
                },
              }),
            });

            if (!emailRes.ok) {
              logger.warn(`Failed to send shipping email for order ${order.id}`);
            }
          } catch (err) {
            logger.warn(`Error sending shipping email for order ${order.id}:`, err);
          }
        });

      // Don't await - let emails send in background
      Promise.all(emailPromises);
    }

    logger.info(`Bulk updated ${data?.length || 0} orders to status: ${status}`, {
      orderIds: ids,
    });

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk update orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
