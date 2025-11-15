import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, createCartCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { getStripeClient } from '@/lib/stripe/config';

interface CartItemRequest {
  priceId: string;
  quantity: number;
}

interface CheckoutRequestBody {
  // Legacy single-item checkout
  priceId?: string;
  mode?: 'payment' | 'subscription';

  // Cart-based checkout
  items?: CartItemRequest[];
  couponCode?: string;

  // URLs
  successPath?: string;
  cancelPath?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(req: NextRequest) {
  console.log('🛒 CHECKOUT API CALLED');
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log('🔐 User authenticated:', !!user, user?.email);

    const body: CheckoutRequestBody = await req.json();
    console.log('📦 Checkout request body:', JSON.stringify(body, null, 2));

    const {
      priceId,
      mode,
      items,
      couponCode,
      successPath,
      cancelPath,
      successUrl: providedSuccessUrl,
      cancelUrl: providedCancelUrl,
    } = body;

    // Build full URLs
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const finalSuccessUrl = providedSuccessUrl || `${origin}${successPath || '/checkout/success'}?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = providedCancelUrl || `${origin}${cancelPath || '/cart'}`;

    // Get dynamic Stripe client based on current mode (test/production)
    const stripeClient = getStripeClient();

    // Handle authenticated vs guest checkout
    let customerId: string | undefined;

    if (user) {
      // Get user profile from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email, name')
        .eq('id', user.id)
        .single();

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id;
      } else if (profile?.email || user.email) {
        const email = profile?.email || user.email!;
        const customer = await getOrCreateCustomer({
          email,
          name: profile?.name || user.user_metadata?.name || undefined,
          metadata: { userId: user.id },
          stripe: stripeClient,
        });

        // Save customer ID to database
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', user.id);

        customerId = customer.id;
      }
    }

    // Prepare metadata
    const metadata: Record<string, string> = {};
    if (user) {
      metadata.userId = user.id;
    }

    // CART-BASED CHECKOUT (multiple items)
    if (items && items.length > 0) {
      // Determine checkout mode based on items
      // For now, assume all items are the same type (all subscriptions or all one-time)
      // In a real scenario, you'd need to handle mixed carts or restrict cart to single type
      const checkoutMode: 'payment' | 'subscription' = 'payment'; // Default to payment for cart

      const lineItems = items.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
      }));

      const checkoutSession = await createCartCheckoutSession(
        {
          lineItems,
          mode: checkoutMode,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          customerId,
          metadata,
          couponCode,
        },
        stripeClient
      );

      console.log('✅ Checkout session created:', checkoutSession.id);
      console.log('🔗 Redirect URL:', checkoutSession.url);
      return NextResponse.json({ url: checkoutSession.url });
    }

    // LEGACY SINGLE-ITEM CHECKOUT
    if (priceId && mode) {
      const checkoutSession = await createCheckoutSession(
        {
          priceId,
          mode,
          successUrl: finalSuccessUrl,
          cancelUrl: finalCancelUrl,
          customerId,
          metadata,
        },
        stripeClient
      );

      return NextResponse.json({ url: checkoutSession.url });
    }

    // Invalid request
    return NextResponse.json(
      { error: 'Invalid checkout request. Must provide either items[] or priceId+mode' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
