import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncProductToStripe } from '@/lib/stripe/product-sync';

/**
 * POST /api/admin/products/[id]/sync-stripe
 * Sync a product to Stripe (create or update Stripe product and prices)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Sync product to Stripe
    const result = await syncProductToStripe(params.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to sync product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productId: result.productId,
      priceIds: result.priceIds,
      message: 'Product synced to Stripe successfully',
    });
  } catch (error: any) {
    console.error('Error syncing product to Stripe:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync product' },
      { status: 500 }
    );
  }
}
