import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { productSchema, variantSchema } from '@/lib/validations/product';
import { z } from 'zod';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  _request: NextRequest,
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

    // Fetch product with related data
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        ingredients:product_ingredients(
          id,
          display_order,
          ingredient:ingredients(*)
        ),
        variants:product_variants(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ product: data });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products/[id] - Update product
export async function PATCH(
  _request: NextRequest,
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

    // Parse and validate request body
    const body = await _request.json();

    // Validate product data
    if (body.product) {
      const productValidation = productSchema.partial().safeParse(body.product);
      if (!productValidation.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: productValidation.error.errors,
          },
          { status: 400 }
        );
      }

      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          ...productValidation.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (productError) throw productError;
    }

    // Update variants if provided
    if (body.variants !== undefined) {
      // Delete existing variants
      await supabase.from('product_variants').delete().eq('product_id', params.id);

      // Insert new variants if any
      if (body.variants && body.variants.length > 0) {
        const variantsValidation = z.array(variantSchema).safeParse(body.variants);
        if (!variantsValidation.success) {
          return NextResponse.json(
            {
              error: 'Variant validation failed',
              details: variantsValidation.error.errors,
            },
            { status: 400 }
          );
        }

        const variantsToInsert = variantsValidation.data.map(v => ({
          ...v,
          product_id: params.id,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantsError) throw variantsError;
      }
    }

    // Update ingredients if provided
    if (body.ingredients !== undefined) {
      // Delete existing relationships
      await supabase.from('product_ingredients').delete().eq('product_id', params.id);

      // Insert new relationships
      if (body.ingredients && body.ingredients.length > 0) {
        const ingredientLinks = body.ingredients.map((ingredientId: string, index: number) => ({
          product_id: params.id,
          ingredient_id: ingredientId,
          display_order: index + 1,
        }));

        const { error: ingredientsError } = await supabase
          .from('product_ingredients')
          .insert(ingredientLinks);

        if (ingredientsError) throw ingredientsError;
      }
    }

    // Fetch updated product
    const { data: updatedProduct } = await supabase
      .from('products')
      .select(`
        *,
        ingredients:product_ingredients(
          id,
          display_order,
          ingredient:ingredients(*)
        ),
        variants:product_variants(*)
      `)
      .eq('id', params.id)
      .single();

    return NextResponse.json({ product: updatedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  _request: NextRequest,
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

    // Soft delete by setting is_active to false and unpublishing
    const { error } = await supabase
      .from('products')
      .update({
        is_active: false,
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
