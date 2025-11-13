import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createUpsellCheckout } from '@/lib/checkout-helpers';
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

    const { priceId, upsellId, originalSessionId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    // Track upsell click
    await trackServerEvent('upsell_clicked', {
      userId: user.id,
      upsellId: upsellId || 'unknown',
      priceId,
    });

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/thank-you?upsell=true`;
    const cancelUrl = `${baseUrl}/thank-you`;

    const session = await createUpsellCheckout(
      user.id,
      priceId,
      {
        sessionId: originalSessionId,
      },
      successUrl,
      cancelUrl
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Upsell checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
