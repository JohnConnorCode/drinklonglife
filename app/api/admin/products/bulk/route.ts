import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';
import { logger } from '@/lib/logger';

// PATCH - Bulk update products
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids, updates } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 100) {
      return NextResponse.json({
        error: 'Cannot update more than 100 products at once'
      }, { status: 400 });
    }

    // Allowed fields for bulk update
    const allowedFields = ['is_active', 'is_featured', 'published_at'];
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

    // Update products
    const { data, error } = await supabase
      .from('products')
      .update(sanitizedUpdates)
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk update products error:', error);
      return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
    }

    logger.info(`Bulk updated ${data?.length || 0} products`, {
      productIds: ids,
      updates: Object.keys(sanitizedUpdates),
    });

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk update products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Bulk delete products
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApi();
    const supabase = createServiceRoleClient();

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
    }

    // Safety: limit bulk operations
    if (ids.length > 50) {
      return NextResponse.json({
        error: 'Cannot delete more than 50 products at once'
      }, { status: 400 });
    }

    // Get products before deletion for logging
    const { data: productsToDelete } = await supabase
      .from('products')
      .select('id, name')
      .in('id', ids);

    // Delete related data first (cascade)
    // 1. Delete product variants
    const { error: variantsError } = await supabase
      .from('product_variants')
      .delete()
      .in('product_id', ids);

    if (variantsError) {
      logger.error('Error deleting product variants:', variantsError);
    }

    // 2. Delete product ingredients
    const { error: ingredientsError } = await supabase
      .from('product_ingredients')
      .delete()
      .in('product_id', ids);

    if (ingredientsError) {
      logger.error('Error deleting product ingredients:', ingredientsError);
    }

    // 3. Finally delete the products
    const { data, error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)
      .select('id');

    if (error) {
      logger.error('Bulk delete products error:', error);
      return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 });
    }

    logger.info(`Bulk deleted ${data?.length || 0} products`, {
      products: productsToDelete?.map(p => ({ id: p.id, name: p.name })),
    });

    return NextResponse.json({
      success: true,
      deleted: data?.length || 0,
    });
  } catch (error) {
    logger.error('Bulk delete products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
