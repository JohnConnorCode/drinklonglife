import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/admin';

// PATCH /api/admin/referrals/[id] - Issue reward for a referral
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi();
    const { id } = await params;
    const body = await request.json();
    const { reward_type, reward_value, notes } = body;

    const supabase = createServiceRoleClient();

    // Get the referral first to verify it exists and is eligible
    const { data: referral, error: fetchError } = await supabase
      .from('referrals')
      .select('*, referrer:profiles!referrer_id(email, full_name)')
      .eq('id', id)
      .single();

    if (fetchError || !referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    if (referral.reward_issued) {
      return NextResponse.json(
        { error: 'Reward already issued for this referral' },
        { status: 400 }
      );
    }

    if (!referral.completed_purchase) {
      return NextResponse.json(
        { error: 'Cannot issue reward - referred user has not completed a purchase' },
        { status: 400 }
      );
    }

    // Update the referral with reward info
    const { data: updated, error: updateError } = await supabase
      .from('referrals')
      .update({
        reward_issued: true,
        reward_type: reward_type || 'manual',
        reward_value: reward_value || null,
        reward_issued_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error issuing reward:', updateError);
      return NextResponse.json(
        { error: 'Failed to issue reward' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      referral: updated,
      message: `Reward issued for referral to ${referral.referrer?.email || 'unknown'}`,
    });
  } catch (error) {
    console.error('Error in referral PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
