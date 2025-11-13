import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createTierUpgradeCheckout } from '@/lib/checkout-helpers';
import { trackServerEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { newTier } = await req.json();

    // Validate tier
    const validTiers = ['affiliate', 'partner', 'vip'];
    if (!validTiers.includes(newTier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get user's current tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('partnership_tier')
      .eq('id', user.id)
      .single();

    const currentTier = profile?.partnership_tier || 'none';

    // Track tier upgrade attempt
    await trackServerEvent('tier_upgrade_viewed', {
      userId: user.id,
      currentTier,
      targetTier: newTier,
    });

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/account?upgraded=${newTier}`;
    const cancelUrl = `${baseUrl}/upgrade`;

    const session = await createTierUpgradeCheckout(
      user.id,
      newTier,
      successUrl,
      cancelUrl
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Tier upgrade checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
