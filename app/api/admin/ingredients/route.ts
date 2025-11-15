import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ingredientSchema } from '@/lib/validations/ingredient';

// GET /api/admin/ingredients - List all ingredients
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

    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    let query = supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ ingredients: data });
  } catch (error: any) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ingredients - Create a new ingredient
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

    // Validate ingredient data
    const validation = ingredientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const ingredientData = validation.data;

    // Insert ingredient
    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .insert({
        ...ingredientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (ingredientError) throw ingredientError;

    return NextResponse.json({ ingredient }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ingredient' },
      { status: 500 }
    );
  }
}
