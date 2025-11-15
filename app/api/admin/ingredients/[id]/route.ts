import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ingredientSchema } from '@/lib/validations/ingredient';

// GET /api/admin/ingredients/[id] - Get single ingredient
export async function GET(
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

    // Fetch ingredient
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ ingredient: data });
  } catch (error: any) {
    console.error('Error fetching ingredient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ingredient' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/ingredients/[id] - Update ingredient
export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json();

    // Validate ingredient data
    const validation = ingredientSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Update ingredient
    const { data: updatedIngredient, error: updateError } = await supabase
      .from('ingredients')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
      }
      throw updateError;
    }

    return NextResponse.json({ ingredient: updatedIngredient });
  } catch (error: any) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ingredient' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ingredients/[id] - Delete ingredient
export async function DELETE(
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

    // Check if ingredient is used in any products
    const { data: usedInProducts, error: checkError } = await supabase
      .from('product_ingredients')
      .select('product_id')
      .eq('ingredient_id', params.id)
      .limit(1);

    if (checkError) throw checkError;

    if (usedInProducts && usedInProducts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete ingredient that is used in products' },
        { status: 400 }
      );
    }

    // Delete ingredient
    const { error: deleteError } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ingredient not found' }, { status: 404 });
      }
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete ingredient' },
      { status: 500 }
    );
  }
}
