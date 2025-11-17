import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';

export async function POST(
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
    const { isAdmin: newAdminStatus } = data;

    if (newAdminStatus === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: isAdmin' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update user admin status
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ is_admin: newAdminStatus })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin status:', error);
      return NextResponse.json(
        { error: 'Failed to update admin status: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users/[id]/toggle-admin:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
