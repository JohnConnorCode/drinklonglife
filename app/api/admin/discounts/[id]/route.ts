import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { active } = data;

    if (active === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: active' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update discount
    const { data: discount, error } = await supabase
      .from('user_discounts')
      .update({ active })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating discount:', error);
      return NextResponse.json(
        { error: 'Failed to update discount: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, discount });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/discounts/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Delete discount
    const { error } = await supabase
      .from('user_discounts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting discount:', error);
      return NextResponse.json(
        { error: 'Failed to delete discount: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/discounts/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
