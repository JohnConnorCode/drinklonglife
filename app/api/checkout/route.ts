import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { client } from '@/lib/sanity.client';

interface CheckoutRequestBody {
  priceId: string;
  mode: 'payment' | 'subscription';
  successPath?: string;
  cancelPath?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body: CheckoutRequestBody = await req.json();

    const { priceId, mode, successPath = '/checkout/success', cancelPath = '/checkout/cancel' } = body;

    // Validate request
    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId' },
        { status: 400 }
      );
    }

    if (!mode || !['payment', 'subscription'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "payment" or "subscription"' },
        { status: 400 }
      );
    }

    // Validate that priceId exists in Sanity
    const product = await client.fetch(
      `*[_type == "stripeProduct" && isActive == true && references($priceId)][0]{
        _id,
        title,
        stripeProductId,
        tierKey,
        "variant": variants[stripePriceId == $priceId][0]{
          sizeKey,
          label,
          stripePriceId
        }
      }`,
      { priceId }
    );

    if (!product || !product.variant) {
      return NextResponse.json(
        { error: 'Invalid price ID or product not active' },
        { status: 404 }
      );
    }

    // Prepare metadata
    const metadata: Record<string, string> = {
      productId: product.stripeProductId,
      sanityProductId: product._id,
    };

    if (product.tierKey) {
      metadata.tierKey = product.tierKey;
    }

    if (product.variant.sizeKey) {
      metadata.sizeKey = product.variant.sizeKey;
    }

    // Handle authenticated vs guest checkout
    let customerId: string | undefined;
    let customerEmail: string | undefined;

    if (user) {
      metadata.userId = user.id;

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
        });

        // Save customer ID to database
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', user.id);

        customerId = customer.id;
      }
    } else {
      // Guest checkout - collect email in Stripe Checkout
      customerEmail = undefined;
    }

    // Build full URLs
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const successUrl = `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}${cancelPath}`;

    // Create Stripe Checkout Session
    const checkoutSession = await createCheckoutSession({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
      metadata,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
