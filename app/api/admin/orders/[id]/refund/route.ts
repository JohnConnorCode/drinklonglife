import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { processRefund } from '@/lib/admin/orders';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    await requireAdmin();

    const orderId = params.id;

    // Parse request body
    const body = await request.json();
    const { amount } = body; // amount in cents, undefined for full refund

    // Validate partial refund amount if provided
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid refund amount' },
          { status: 400 }
        );
      }
    }

    // Process refund
    const result = await processRefund(orderId, amount);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Refund failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: amount
        ? 'Partial refund processed successfully'
        : 'Full refund processed successfully',
    });
  } catch (error: any) {
    console.error('Refund API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
