import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminUser } from '@/lib/auth/admin';

/**
 * GET /api/admin/settings
 * Get all system settings
 */
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ settings: settings || [] });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Update a system setting
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check admin access
    await requireAdminUser();

    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'Setting key is required' },
        { status: 400 }
      );
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Setting value is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Update the setting
    const { data: setting, error } = await supabase
      .from('system_settings')
      .update({ value })
      .eq('key', key)
      .select()
      .single();

    if (error) throw error;

    // Revalidate cache (if using Next.js cache)
    // revalidatePath('/admin/settings');

    return NextResponse.json({
      message: 'Setting updated successfully',
      setting,
    });
  } catch (error: any) {
    console.error('Update setting error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update setting' },
      { status: 500 }
    );
  }
}
