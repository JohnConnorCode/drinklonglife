/**
 * Product Queries for Supabase
 * Replaces Sanity GROQ queries with Supabase queries
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { createClient as createBrowserClient } from '@supabase/supabase-js';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: any | null;
  story: any | null;
  detailed_function: any | null;
  how_to_use: any | null;
  function_list: string[] | null;
  best_for: string[] | null;
  label_color: 'yellow' | 'red' | 'green' | 'blue' | null;
  image_url: string | null;
  image_alt: string | null;
  stripe_product_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ProductWithIngredients extends Product {
  ingredients: Array<{
    id: string;
    display_order: number;
    ingredient: Ingredient;
  }>;
  variants: ProductVariant[];
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'fruit' | 'root' | 'green' | 'herb' | 'other' | null;
  seasonality: string | null;
  function: any | null;
  sourcing_story: any | null;
  nutritional_profile: string | null;
  notes: string | null;
  image_url: string | null;
  image_alt: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_key: string;
  label: string;
  stripe_price_id: string;
  is_default: boolean;
  display_order: number;
  is_active: boolean;
  price_usd: number | null;
  sku: string | null;
  billing_type?: string;
  recurring_interval?: string;
  recurring_interval_count?: number;
}

// =====================================================
// QUERY FUNCTIONS
// =====================================================

/**
 * Get all published products (blends)
 * Replaces: blendsQuery from Sanity
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      tagline,
      image_url,
      image_alt,
      label_color,
      function_list,
      is_featured,
      display_order
    `
    )
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .order('display_order', { ascending: true });

  if (error) {
    logger.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

/**
 * Product with minimum price calculated from variants
 */
export interface ProductWithMinPrice extends Product {
  min_price: number | null;
}

/**
 * Get all products with their minimum variant price
 * Used for pricing pages where we need to show "From $X"
 */
export async function getAllProductsWithMinPrice(): Promise<ProductWithMinPrice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      tagline,
      image_url,
      image_alt,
      label_color,
      function_list,
      is_featured,
      display_order,
      product_variants(price_usd)
    `
    )
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .order('display_order', { ascending: true });

  if (error) {
    logger.error('Error fetching products with prices:', error);
    return [];
  }

  // Calculate minimum price for each product
  return (data || []).map((product: any) => {
    const variants = product.product_variants || [];
    const prices = variants
      .map((v: { price_usd: number | null }) => v.price_usd)
      .filter((p: number | null): p is number => p !== null && p > 0);

    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    // Remove variants from the returned object, just keep min_price
    const { product_variants, ...productData } = product;
    return {
      ...productData,
      min_price: minPrice,
    } as ProductWithMinPrice;
  });
}

/**
 * Get all products for static generation (no cookies, uses anon key)
 * Used in generateStaticParams where cookies() is not available
 */
export async function getAllProductsForStaticGen(): Promise<Product[]> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      tagline,
      image_url,
      image_alt,
      label_color,
      function_list,
      is_featured,
      display_order
    `
    )
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .order('display_order', { ascending: true});

  if (error) {
    logger.error('Error fetching products for static gen:', error);
    return [];
  }

  return data as Product[];
}

/**
 * Get product by slug with full details including ingredients and variants
 * Replaces: blendQuery from Sanity
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductWithIngredients | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      ingredients:product_ingredients(
        id,
        display_order,
        ingredient:ingredients(
          id,
          name,
          type,
          seasonality,
          function,
          sourcing_story,
          nutritional_profile,
          image_url,
          image_alt
        )
      ),
      variants:product_variants(
        id,
        product_id,
        size_key,
        label,
        stripe_price_id,
        is_default,
        display_order,
        is_active,
        price_usd,
        sku,
        billing_type,
        recurring_interval,
        recurring_interval_count
      )
    `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .single();

  if (error) {
    logger.error('Error fetching product:', error);
    return null;
  }

  // Sort ingredients and variants by display_order and filter active variants
  if (data) {
    data.ingredients = data.ingredients?.sort(
      (a: any, b: any) => a.display_order - b.display_order
    ) || [];
    data.variants = data.variants
      ?.filter((v: any) => v.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order) || [];
  }

  return data as ProductWithIngredients;
}

/**
 * Get active Stripe products for pricing page
 * Used by: /pricing page
 */
export async function getActiveStripeProducts(): Promise<ProductWithIngredients[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      tagline,
      description,
      image_url,
      image_alt,
      stripe_product_id,
      is_featured,
      display_order,
      variants:product_variants(
        id,
        size_key,
        label,
        stripe_price_id,
        is_default,
        display_order,
        is_active,
        price_usd,
        billing_type,
        recurring_interval,
        recurring_interval_count
      )
    `
    )
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .not('stripe_product_id', 'is', null)
    .order('display_order', { ascending: true });

  if (error) {
    logger.error('Error fetching Stripe products:', error);
    return [];
  }

  // Filter products that have active variants
  const productsWithVariants = (data || []).filter(
    (product: any) => product.variants && product.variants.length > 0
  );

  // Sort variants by display_order
  productsWithVariants.forEach((product: any) => {
    product.variants = product.variants
      ?.filter((v: any) => v.is_active)
      .sort((a: any, b: any) => a.display_order - b.display_order) || [];
  });

  return productsWithVariants as ProductWithIngredients[];
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      tagline,
      image_url,
      image_alt,
      label_color,
      function_list,
      display_order
    `
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .not('published_at', 'is', null)
    .order('display_order', { ascending: true })
    .limit(6);

  if (error) {
    logger.error('Error fetching featured products:', error);
    return [];
  }

  return data as Product[];
}

/**
 * Get all ingredients
 * Replaces: ingredientQuery from Sanity
 */
export async function getAllIngredients(): Promise<Ingredient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    logger.error('Error fetching ingredients:', error);
    return [];
  }

  return data as Ingredient[];
}

/**
 * Search products by name or function
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      tagline,
      image_url,
      label_color,
      function_list
    `
    )
    .eq('is_active', true)
    .not('published_at', 'is', null)
    .or(`name.ilike.%${query}%,tagline.ilike.%${query}%`)
    .order('display_order', { ascending: true });

  if (error) {
    logger.error('Error searching products:', error);
    return [];
  }

  return data as Product[];
}

// =====================================================
// ADMIN QUERIES (Requires authentication)
// =====================================================

/**
 * Get all products including drafts (admin only)
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    logger.error('Error fetching products (admin):', error);
    return [];
  }

  return data as Product[];
}

/**
 * Get product by ID (admin only)
 */
export async function getProductById(id: string): Promise<ProductWithIngredients | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      ingredients:product_ingredients(
        id,
        display_order,
        ingredient:ingredients(*)
      ),
      variants:product_variants(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching product by ID:', error);
    return null;
  }

  // Sort by display_order
  if (data) {
    data.ingredients = data.ingredients?.sort(
      (a: any, b: any) => a.display_order - b.display_order
    ) || [];
    data.variants = data.variants?.sort(
      (a: any, b: any) => a.display_order - b.display_order
    ) || [];
  }

  return data as ProductWithIngredients;
}
