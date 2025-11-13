import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/**
 * GET /api/admin/referrals/stats
 * Get referral system statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin access
    await requireAdmin();

    const supabase = createServiceRoleClient();

    // Get total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    // Get completed referrals
    const { count: completedReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('completed_purchase', true);

    // Get referrals with rewards issued
    const { count: rewardsIssued } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('reward_issued', true);

    // Get total active discount codes
    const { count: activeDiscounts } = await supabase
      .from('user_discounts')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Get top referrers
    const { data: topReferrers } = await supabase
      .rpc('get_referral_leaderboard_with_users', { limit_count: 10 });

    // Calculate conversion rate
    const conversionRate = totalReferrals && totalReferrals > 0
      ? Math.round((completedReferrals || 0) / totalReferrals * 100)
      : 0;

    return NextResponse.json({
      stats: {
        totalReferrals: totalReferrals || 0,
        completedReferrals: completedReferrals || 0,
        rewardsIssued: rewardsIssued || 0,
        activeDiscounts: activeDiscounts || 0,
        conversionRate,
      },
      topReferrers: topReferrers || [],
    });
  } catch (error: any) {
    console.error('Get referral stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get referral stats' },
      { status: 500 }
    );
  }
}
