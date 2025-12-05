import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';
import { logger } from '@/lib/logger';

// PATCH - Bulk update discounts
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids, updates } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No discount IDs provided' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 100) {
      return NextResponse.json({
        error: 'Cannot update more than 100 discounts at once'
      }, { status: 400 });
    }

    // Allowed fields for bulk update
    const allowedFields = ['is_active'];
    const sanitizedUpdates: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Add updated_at timestamp
    sanitizedUpdates.updated_at = new Date().toISOString();

    // Update discounts
    const { data, error } = await supabase
      .from('discounts')
      .update(sanitizedUpdates)
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk update discounts error:', error);
      return NextResponse.json({ error: 'Failed to update discounts' }, { status: 500 });
    }

    logger.info(`Bulk updated ${data?.length || 0} discounts`, {
      discountIds: ids,
      updates: Object.keys(sanitizedUpdates),
    });

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk update discounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Bulk delete discounts
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No discount IDs provided' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 100) {
      return NextResponse.json({
        error: 'Cannot delete more than 100 discounts at once'
      }, { status: 400 });
    }

    // Get discounts before deletion for logging
    const { data: discountsToDelete } = await supabase
      .from('discounts')
      .select('id, code')
      .in('id', ids);

    // Delete the discounts
    const { data, error } = await supabase
      .from('discounts')
      .delete()
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk delete discounts error:', error);
      return NextResponse.json({ error: 'Failed to delete discounts' }, { status: 500 });
    }

    logger.info(`Bulk deleted ${data?.length || 0} discounts`, {
      discounts: discountsToDelete?.map(d => ({ id: d.id, code: d.code })),
    });

    return NextResponse.json({
      success: true,
      deleted: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk delete discounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
