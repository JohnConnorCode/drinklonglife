import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/export/orders
 * Export all orders to CSV
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to CSV
    const headers = [
      'Order ID',
      'Stripe Session ID',
      'Customer Email',
      'Amount Total',
      'Amount Subtotal',
      'Currency',
      'Status',
      'Payment Status',
      'Created At',
    ].join(',');

    const rows = (orders || []).map((order) => {
      return [
        order.id,
        order.stripe_session_id,
        order.customer_email || '',
        (order.amount_total / 100).toFixed(2),
        (order.amount_subtotal / 100).toFixed(2),
        order.currency,
        order.status,
        order.payment_status,
        order.created_at,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [headers, ...rows].join('\n');

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export orders' },
      { status: 500 }
    );
  }
}
