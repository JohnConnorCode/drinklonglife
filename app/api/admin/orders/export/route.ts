import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getOrders, OrderStatus, PaymentStatus } from '@/lib/admin/orders';
import { formatDateForCSV } from '@/lib/utils/formatDate';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const payment = searchParams.get('payment') as PaymentStatus | null;
    const search = searchParams.get('search');

    // Fetch orders with filters (no limit for export)
    const orders = await getOrders({
      status: status || undefined,
      paymentStatus: payment || undefined,
      searchQuery: search || undefined,
      limit: 10000, // High limit for export
    });

    // Convert to CSV format
    const csvRows: string[] = [];

    // Headers
    csvRows.push(
      [
        'Order ID',
        'Customer Email',
        'Amount (USD)',
        'Order Status',
        'Payment Status',
        'Stripe Session ID',
        'User ID',
        'Created At',
        'Updated At',
      ].join(',')
    );

    // Data rows
    for (const order of orders) {
      const row = [
        order.id,
        order.customer_email || 'N/A',
        (order.amount_total / 100).toFixed(2),
        order.status,
        order.payment_status,
        order.stripe_session_id,
        order.user_id || 'Guest',
        formatDateForCSV(order.created_at),
        formatDateForCSV(order.updated_at),
      ];

      // Escape commas and quotes in CSV
      const escapedRow = row.map((field) => {
        const fieldStr = String(field);
        if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
          return `"${fieldStr.replace(/"/g, '""')}"`;
        }
        return fieldStr;
      });

      csvRows.push(escapedRow.join(','));
    }

    const csvContent = csvRows.join('\n');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `orders-export-${date}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Export failed' },
      { status: 500 }
    );
  }
}
