import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await req.json();

    // Validate status
    const validStatuses = ['new', 'contacted', 'qualified', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update inquiry status
    const { data, error } = await supabase
      .from('wholesale_inquiries')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inquiry status:', error);
      return NextResponse.json(
        { error: 'Failed to update inquiry status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in status update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
