import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { productsToCSV } from '@/lib/admin/csv-export';

/**
 * GET /api/admin/export/products
 * Export all products to CSV
 */
export async function GET(_request: NextRequest) {
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

    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Convert to CSV
    const csv = productsToCSV(products || []);

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export products' },
      { status: 500 }
    );
  }
}
