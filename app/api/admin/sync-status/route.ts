import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface SyncIssue {
  type: 'missing_in_stripe' | 'missing_in_supabase' | 'price_mismatch' | 'inactive_mismatch';
  productId?: string;
  productName?: string;
  variantId?: string;
  variantLabel?: string;
  stripePriceId?: string;
  details: string;
  severity: 'error' | 'warning';
}

interface SyncStatus {
  healthy: boolean;
  issues: SyncIssue[];
  stats: {
    supabaseProducts: number;
    supabaseVariants: number;
    stripeProducts: number;
    stripePrices: number;
    syncedVariants: number;
    unsyncedVariants: number;
  };
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const issues: SyncIssue[] = [];

    // 1. Fetch all products and variants from Supabase
    const { data: supabaseProducts, error: supabaseError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        is_active,
        variants:product_variants(
          id,
          label,
          stripe_price_id,
          price_usd,
          is_active,
          billing_type
        )
      `)
      .eq('is_active', true);

    if (supabaseError) {
      throw supabaseError;
    }

    // 2. Fetch all products and prices from Stripe
    const stripeProducts = await stripe.products.list({ limit: 100, active: true });
    const stripePrices = await stripe.prices.list({ limit: 100, active: true });

    // Create maps for quick lookup
    const stripePriceMap = new Map(
      stripePrices.data.map(price => [price.id, price])
    );
    const stripeProductMap = new Map(
      stripeProducts.data.map(product => [product.id, product])
    );

    // 3. Check each Supabase variant has a valid Stripe price
    let totalVariants = 0;
    let syncedVariants = 0;
    let unsyncedVariants = 0;

    for (const product of (supabaseProducts || [])) {
      const variants = product.variants || [];

      for (const variant of variants) {
        totalVariants++;

        if (!variant.stripe_price_id) {
          unsyncedVariants++;
          issues.push({
            type: 'missing_in_stripe',
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            details: `Variant "${variant.label}" has no Stripe price ID`,
            severity: 'error',
          });
          continue;
        }

        const stripePrice = stripePriceMap.get(variant.stripe_price_id);

        if (!stripePrice) {
          unsyncedVariants++;
          issues.push({
            type: 'missing_in_stripe',
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            stripePriceId: variant.stripe_price_id,
            details: `Stripe price "${variant.stripe_price_id}" not found in Stripe`,
            severity: 'error',
          });
          continue;
        }

        syncedVariants++;

        // Check price matches
        const supabasePrice = variant.price_usd || 0;
        const stripePrice_cents = stripePrice.unit_amount || 0;
        const stripePrice_dollars = stripePrice_cents / 100;

        if (Math.abs(supabasePrice - stripePrice_dollars) > 0.01) {
          issues.push({
            type: 'price_mismatch',
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            stripePriceId: variant.stripe_price_id,
            details: `Price mismatch: Supabase=$${supabasePrice}, Stripe=$${stripePrice_dollars}`,
            severity: 'warning',
          });
        }

        // Check active status matches
        if (variant.is_active && !stripePrice.active) {
          issues.push({
            type: 'inactive_mismatch',
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            stripePriceId: variant.stripe_price_id,
            details: `Variant active in Supabase but Stripe price is inactive`,
            severity: 'warning',
          });
        }
      }
    }

    // 4. Check for Stripe prices without Supabase variants (orphaned prices)
    const supabasePriceIds = new Set(
      (supabaseProducts || [])
        .flatMap(p => p.variants || [])
        .map(v => v.stripe_price_id)
        .filter(Boolean)
    );

    for (const stripePrice of stripePrices.data) {
      if (!supabasePriceIds.has(stripePrice.id)) {
        const stripeProduct = typeof stripePrice.product === 'string'
          ? stripeProductMap.get(stripePrice.product)
          : stripePrice.product;

        issues.push({
          type: 'missing_in_supabase',
          stripePriceId: stripePrice.id,
          productName: stripeProduct?.name || 'Unknown Product',
          details: `Stripe price exists but not found in Supabase: ${stripePrice.id}`,
          severity: 'warning',
        });
      }
    }

    // 5. Build response
    const status: SyncStatus = {
      healthy: issues.filter(i => i.severity === 'error').length === 0,
      issues: issues.sort((a, b) => {
        // Sort errors first, then warnings
        if (a.severity === 'error' && b.severity === 'warning') return -1;
        if (a.severity === 'warning' && b.severity === 'error') return 1;
        return 0;
      }),
      stats: {
        supabaseProducts: supabaseProducts?.length || 0,
        supabaseVariants: totalVariants,
        stripeProducts: stripeProducts.data.length,
        stripePrices: stripePrices.data.length,
        syncedVariants,
        unsyncedVariants,
      },
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Sync status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
