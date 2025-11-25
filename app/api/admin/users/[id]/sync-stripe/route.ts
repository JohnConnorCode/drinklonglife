import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';
import { getCustomerSubscriptions } from '@/lib/stripe';

// Force dynamic rendering to prevent build-time Stripe client initialization
export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const supabase = createServerClient();

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', params.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'User does not have a Stripe customer ID' },
        { status: 400 }
      );
    }

    // Fetch subscriptions from Stripe
    const subscriptions = await getCustomerSubscriptions(profile.stripe_customer_id);

    // Find active subscription
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    );

    // Determine subscription status and plan
    let subscriptionStatus = 'none';
    let currentPlan = null;

    if (activeSubscription) {
      subscriptionStatus = activeSubscription.status;

      // Extract plan info from metadata if available
      const metadata = activeSubscription.metadata || {};
      const tierKey = metadata.tier_key;
      const sizeKey = metadata.size_key;

      if (tierKey) {
        currentPlan = sizeKey ? `${tierKey} - ${sizeKey}` : tierKey;
      }
    } else if (subscriptions.length > 0) {
      // Has subscriptions but none active - check for past_due, canceled, etc.
      const latestSub = subscriptions[0];
      subscriptionStatus = latestSub.status;
    }

    // Update profile with synced data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscriptionStatus,
        current_plan: currentPlan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      logger.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced from Stripe',
      data: {
        subscriptionStatus,
        currentPlan,
        subscriptionsCount: subscriptions.length,
      },
    });
  } catch (error) {
    logger.error('Sync Stripe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
