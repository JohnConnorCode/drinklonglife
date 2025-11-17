import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // Check admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { userEmail, discountCode, stripeCouponId, expiresAt, active } = data;

    // Validate required fields
    if (!userEmail || !discountCode || !stripeCouponId) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, discountCode, stripeCouponId' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: `User not found with email: ${userEmail}` },
        { status: 404 }
      );
    }

    // Create discount
    const { data: discount, error: discountError } = await supabase
      .from('user_discounts')
      .insert({
        user_id: profile.id,
        discount_code: discountCode,
        stripe_coupon_id: stripeCouponId,
        source: 'admin_created',
        active: active !== false, // default to true
        expires_at: expiresAt || null,
      })
      .select()
      .single();

    if (discountError) {
      console.error('Error creating discount:', discountError);
      return NextResponse.json(
        { error: 'Failed to create discount: ' + discountError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, discount });
  } catch (error: any) {
    console.error('Error in POST /api/admin/discounts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
