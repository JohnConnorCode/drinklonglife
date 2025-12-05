import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';
import { logger } from '@/lib/logger';

// PATCH - Bulk update newsletter subscribers
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids, updates } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No subscriber IDs provided' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 500) {
      return NextResponse.json({
        error: 'Cannot update more than 500 subscribers at once'
      }, { status: 400 });
    }

    // Allowed fields for bulk update
    const allowedFields = ['subscribed'];
    const sanitizedUpdates: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Add timestamp based on subscription status change
    if ('subscribed' in sanitizedUpdates) {
      if (sanitizedUpdates.subscribed) {
        sanitizedUpdates.subscribed_at = new Date().toISOString();
        sanitizedUpdates.unsubscribed_at = null;
      } else {
        sanitizedUpdates.unsubscribed_at = new Date().toISOString();
      }
    }

    // Update subscribers
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update(sanitizedUpdates)
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk update newsletter subscribers error:', error);
      return NextResponse.json({ error: 'Failed to update subscribers' }, { status: 500 });
    }

    logger.info(`Bulk updated ${data?.length || 0} newsletter subscribers`, {
      subscriberIds: ids,
      updates: Object.keys(sanitizedUpdates),
    });

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk update newsletter subscribers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Bulk delete newsletter subscribers
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No subscriber IDs provided' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 500) {
      return NextResponse.json({
        error: 'Cannot delete more than 500 subscribers at once'
      }, { status: 400 });
    }

    // Get subscribers before deletion for logging
    const { data: subscribersToDelete } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .in('id', ids);

    // Delete the subscribers
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk delete newsletter subscribers error:', error);
      return NextResponse.json({ error: 'Failed to delete subscribers' }, { status: 500 });
    }

    logger.info(`Bulk deleted ${data?.length || 0} newsletter subscribers`, {
      count: subscribersToDelete?.length,
    });

    return NextResponse.json({
      success: true,
      deleted: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk delete newsletter subscribers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
