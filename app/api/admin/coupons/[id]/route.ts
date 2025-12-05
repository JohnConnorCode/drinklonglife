import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe/config';
import { isCurrentUserAdmin } from '@/lib/admin';
import { logger } from '@/lib/logger';

/**
 * DELETE /api/admin/coupons/[id]
 * Deactivate a Stripe promotion code (can't delete, only deactivate)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const stripe = await getStripeClient();

    // Promotion codes can only be deactivated, not deleted
    const promotionCode = await stripe.promotionCodes.update(id, {
      active: false,
    });

    logger.info(`Deactivated Stripe promotion code: ${promotionCode.code}`);

    return NextResponse.json({
      success: true,
      message: `Code "${promotionCode.code}" has been deactivated`,
    });
  } catch (error: any) {
    logger.error('Error deactivating promotion code:', error);

    if (error.code === 'resource_missing') {
      return NextResponse.json(
        { error: 'Promotion code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to deactivate promotion code' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/coupons/[id]
 * Toggle promotion code active status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { active } = await request.json();

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'active must be a boolean' },
        { status: 400 }
      );
    }

    const stripe = await getStripeClient();

    const promotionCode = await stripe.promotionCodes.update(id, { active });

    logger.info(`Updated promotion code ${promotionCode.code}: active=${active}`);

    return NextResponse.json({
      success: true,
      promotionCode: {
        id: promotionCode.id,
        code: promotionCode.code,
        active: promotionCode.active,
      },
    });
  } catch (error: any) {
    logger.error('Error updating promotion code:', error);

    if (error.code === 'resource_missing') {
      return NextResponse.json(
        { error: 'Promotion code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update promotion code' },
      { status: 500 }
    );
  }
}
