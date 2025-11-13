import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';
import { getStripeClient } from '@/lib/stripe/config';
import { client } from '@/lib/sanity.client';

interface CheckoutRequestBody {
  priceId: string;
  mode: 'payment' | 'subscription';
  successPath?: string;
  cancelPath?: string;
  successUrl?: string;
  cancelUrl?: string;
  discountCode?: string; // Optional discount/coupon code
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body: CheckoutRequestBody = await req.json();

    const {
      priceId,
      mode,
      successPath,
      cancelPath,
      successUrl: providedSuccessUrl,
      cancelUrl: providedCancelUrl,
      discountCode,
    } = body;

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

    if (product.tier_key) {
      metadata.tier_key = product.tier_key;
    }

    if (product.variant.size_key) {
      metadata.size_key = product.variant.size_key;
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
    const finalSuccessUrl = providedSuccessUrl || `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = providedCancelUrl || `${origin}${cancelPath}`;

    // Get dynamic Stripe client based on current mode (test/production)
    const stripeClient = await getStripeClient();

    // Validate discount code if provided
    let validatedDiscountCode: string | undefined;
    if (discountCode) {
      try {
        // Check if it's a user discount from referrals
        if (user) {
          const { data: userDiscount } = await supabase
            .from('user_discounts')
            .select('discount_code, stripe_coupon_id, active, expires_at')
            .eq('user_id', user.id)
            .eq('discount_code', discountCode.toUpperCase())
            .eq('active', true)
            .single();

          if (userDiscount) {
            // Check if not expired
            if (!userDiscount.expires_at || new Date(userDiscount.expires_at) > new Date()) {
              validatedDiscountCode = userDiscount.stripe_coupon_id || discountCode.toUpperCase();
            }
          }
        }

        // If not found as user discount, validate with Stripe directly
        if (!validatedDiscountCode) {
          const promoCodes = await stripeClient.promotionCodes.list({
            code: discountCode.toUpperCase(),
            active: true,
            limit: 1,
          });

          if (promoCodes.data.length > 0 && promoCodes.data[0].coupon) {
            validatedDiscountCode = promoCodes.data[0].coupon.id;
          }
        }
      } catch (error) {
        console.error('Discount code validation error:', error);
        // Continue without discount if validation fails
      }
    }

    // Create Stripe Checkout Session with dynamic Stripe client
    const checkoutSession = await createCheckoutSession(
      {
        priceId,
        mode,
        successUrl: finalSuccessUrl,
        cancelUrl: finalCancelUrl,
        customerId,
        customerEmail,
        metadata,
        discountCode: validatedDiscountCode,
      },
      stripeClient
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
