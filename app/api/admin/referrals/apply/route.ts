import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminUser } from '@/lib/auth/admin';

/**
 * POST /api/admin/referrals/apply
 * Manually apply a referral discount to a user
 */
export async function POST(req: NextRequest) {
  try {
    // Check admin access
    await requireAdminUser();

    const { userId, discountCode, source, expiresInDays = 30 } = await req.json();

    if (!userId || !discountCode) {
      return NextResponse.json(
        { error: 'userId and discountCode are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Add discount to user_discounts table
    const { data: discount, error: discountError } = await supabase
      .from('user_discounts')
      .insert({
        user_id: userId,
        discount_code: discountCode.toUpperCase(),
        source: source || 'admin_manual',
        active: true,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (discountError) {
      // Check if it's a duplicate
      if (discountError.code === '23505') {
        return NextResponse.json(
          { error: 'User already has this discount code' },
          { status: 409 }
        );
      }
      throw discountError;
    }

    return NextResponse.json({
      success: true,
      discount,
      message: `Discount ${discountCode} applied to ${profile.email}`,
    });
  } catch (error: any) {
    console.error('Apply referral error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply discount' },
      { status: 500 }
    );
  }
}
