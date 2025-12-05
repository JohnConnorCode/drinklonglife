import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';

// PATCH /api/admin/referrals/bulk - Bulk issue rewards
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApi();
    const body = await request.json();
    const { ids, reward_type, reward_value } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No referral IDs provided' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get eligible referrals (completed purchase, not already rewarded)
    const { data: eligible, error: fetchError } = await supabase
      .from('referrals')
      .select('id')
      .in('id', ids)
      .eq('completed_purchase', true)
      .eq('reward_issued', false);

    if (fetchError) {
      console.error('Error fetching eligible referrals:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }

    if (!eligible || eligible.length === 0) {
      return NextResponse.json(
        { error: 'No eligible referrals found (must have completed purchase and no reward issued yet)' },
        { status: 400 }
      );
    }

    const eligibleIds = eligible.map(r => r.id);

    // Update all eligible referrals
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        reward_issued: true,
        reward_type: reward_type || 'manual',
        reward_value: reward_value || null,
        reward_issued_at: new Date().toISOString(),
      })
      .in('id', eligibleIds);

    if (updateError) {
      console.error('Error bulk issuing rewards:', updateError);
      return NextResponse.json(
        { error: 'Failed to issue rewards' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: eligibleIds.length,
      skipped: ids.length - eligibleIds.length,
      message: `Issued rewards for ${eligibleIds.length} referral(s)`,
    });
  } catch (error) {
    console.error('Error in referrals bulk PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
