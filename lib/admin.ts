import { createServerClient } from '@/lib/supabase/server';

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if a specific user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createServerClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    return profile?.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in server components and API routes
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    throw new Error('Admin access required');
  }
}

/**
 * Get admin stats for dashboard
 */
export async function getAdminStats() {
  try {
    const supabase = createServerClient();

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Users with Stripe customer ID
    const { count: usersWithStripe } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('stripe_customer_id', 'is', null);

    // Users with active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('subscription_status', ['active', 'trialing']);

    // Partnership tier breakdown
    const { data: tierData } = await supabase
      .from('profiles')
      .select('partnership_tier')
      .not('partnership_tier', 'is', null);

    const tierCounts = tierData?.reduce((acc, row) => {
      const tier = row.partnership_tier || 'none';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalUsers: totalUsers || 0,
      usersWithStripe: usersWithStripe || 0,
      activeSubscriptions: activeSubscriptions || 0,
      tierCounts,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      usersWithStripe: 0,
      activeSubscriptions: 0,
      tierCounts: {},
    };
  }
}
