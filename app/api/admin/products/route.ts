import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { productSchema, variantSchema } from '@/lib/validations/product';
import { z } from 'zod';

// GET /api/admin/products - List all products
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

    // Fetch products with variant counts
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(count)
      `)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ products: data });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
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
    const body = await request.json();

    // Validate product data
    const productValidation = productSchema.safeParse(body.product);
    if (!productValidation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: productValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const productData = productValidation.data;

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) throw productError;

    // Insert variants if provided
    if (body.variants && body.variants.length > 0) {
      // Validate variants
      const variantsValidation = z.array(variantSchema).safeParse(body.variants);
      if (!variantsValidation.success) {
        // Rollback product creation
        await supabase.from('products').delete().eq('id', product.id);
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
        product_id: product.id,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);

      if (variantsError) {
        // Rollback product creation
        await supabase.from('products').delete().eq('id', product.id);
        throw variantsError;
      }
    }

    // Link ingredients if provided
    if (body.ingredients && body.ingredients.length > 0) {
      const ingredientLinks = body.ingredients.map((ingredientId: string, index: number) => ({
        product_id: product.id,
        ingredient_id: ingredientId,
        display_order: index + 1,
      }));

      const { error: ingredientsError } = await supabase
        .from('product_ingredients')
        .insert(ingredientLinks);

      if (ingredientsError) {
        // Rollback product creation
        await supabase.from('products').delete().eq('id', product.id);
        throw ingredientsError;
      }
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
