import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { updateOrderStatus, OrderStatus } from '@/lib/admin/orders';

const validStatuses: OrderStatus[] = ['pending', 'processing', 'completed', 'failed', 'refunded'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const orderId = params.id;

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Update order status
    const result = await updateOrderStatus(orderId, status as OrderStatus);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Status update failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      status,
    });
  } catch (error: any) {
    console.error('Status update API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
