/**
 * Stripe Product Sync Utilities
 * Sync Supabase products to Stripe
 */

import { stripe } from './index';
import { createClient } from '@/lib/supabase/server';
import type { Product, ProductVariant } from '@/lib/supabase/queries/products';

export interface SyncResult {
  success: boolean;
  productId?: string;
  priceIds?: string[];
  error?: string;
}

/**
 * Create or update a Stripe product from Supabase product
 */
export async function syncProductToStripe(productId: string): Promise<SyncResult> {
  try {
    const supabase = createClient();

    // Fetch product with variants
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*)
      `)
      .eq('id', productId)
      .single();

    if (error || !product) {
      return { success: false, error: 'Product not found' };
    }

    // Create or update Stripe product
    let stripeProduct;

    if (product.stripe_product_id) {
      // Update existing product
      stripeProduct = await stripe.products.update(product.stripe_product_id, {
        name: product.name,
        description: product.tagline || undefined,
        images: product.image_url ? [product.image_url] : undefined,
        active: product.is_active && !!product.published_at,
        metadata: {
          supabase_id: product.id,
          slug: product.slug,
        },
      });
    } else {
      // Create new product
      stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.tagline || undefined,
        images: product.image_url ? [product.image_url] : undefined,
        active: product.is_active && !!product.published_at,
        metadata: {
          supabase_id: product.id,
          slug: product.slug,
        },
      });

      // Update Supabase with Stripe product ID
      await supabase
        .from('products')
        .update({ stripe_product_id: stripeProduct.id })
        .eq('id', productId);
    }

    // Sync variants (prices)
    const priceIds: string[] = [];

    if (product.variants && Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        const priceId = await syncVariantToStripe(stripeProduct.id, variant);
        if (priceId) {
          priceIds.push(priceId);

          // Update variant with Stripe price ID if needed
          if (variant.stripe_price_id !== priceId) {
            await supabase
              .from('product_variants')
              .update({ stripe_price_id: priceId })
              .eq('id', variant.id);
          }
        }
      }
    }

    return {
      success: true,
      productId: stripeProduct.id,
      priceIds,
    };
  } catch (error: any) {
    console.error('Error syncing product to Stripe:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync product',
    };
  }
}

/**
 * Create or update a Stripe price from product variant
 */
async function syncVariantToStripe(
  stripeProductId: string,
  variant: any
): Promise<string | null> {
  try {
    // If variant already has a Stripe price ID, verify it exists
    if (variant.stripe_price_id) {
      try {
        await stripe.prices.retrieve(variant.stripe_price_id);
        return variant.stripe_price_id; // Price exists, no need to create
      } catch (error) {
        console.log(`Price ${variant.stripe_price_id} not found, creating new one`);
      }
    }

    // Calculate price in cents (price_usd is in dollars)
    const unitAmount = variant.price_usd
      ? Math.round(variant.price_usd * 100)
      : null;

    if (!unitAmount) {
      console.warn(`Variant ${variant.id} has no price, skipping`);
      return null;
    }

    // Create new price
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: unitAmount,
      currency: 'usd',
      nickname: variant.label,
      active: variant.is_active,
      metadata: {
        supabase_variant_id: variant.id,
        size_key: variant.size_key,
      },
    });

    return price.id;
  } catch (error: any) {
    console.error('Error syncing variant to Stripe:', error);
    return null;
  }
}

/**
 * Archive (deactivate) a Stripe product
 */
export async function archiveStripeProduct(stripeProductId: string): Promise<boolean> {
  try {
    await stripe.products.update(stripeProductId, {
      active: false,
    });
    return true;
  } catch (error) {
    console.error('Error archiving Stripe product:', error);
    return false;
  }
}

/**
 * Fetch Stripe product details
 */
export async function getStripeProduct(stripeProductId: string) {
  try {
    const product = await stripe.products.retrieve(stripeProductId);
    const prices = await stripe.prices.list({
      product: stripeProductId,
      limit: 100,
    });

    return {
      product,
      prices: prices.data,
    };
  } catch (error) {
    console.error('Error fetching Stripe product:', error);
    return null;
  }
}

/**
 * Get Stripe prices for multiple price IDs
 */
export async function getStripePrices(priceIds: string[]) {
  const prices = new Map<string, any>();

  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      prices.set(priceId, price);
    } catch (error) {
      console.error(`Error fetching price ${priceId}:`, error);
    }
  }

  return prices;
}
