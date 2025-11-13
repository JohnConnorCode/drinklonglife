import Stripe from 'stripe';

/**
 * Stripe Product Variant (Size option)
 */
export interface ProductVariant {
  sizeKey: string;
  label: string;
  stripePriceId: string;
  isDefault?: boolean;
  uiOrder: number;
}

/**
 * Stripe Product from Sanity CMS
 */
export interface StripeProduct {
  _id: string;
  _type: 'stripeProduct';
  title: string;
  slug: {
    current: string;
  };
  description?: any; // Portable Text
  badge?: string;
  featured: boolean;
  isActive: boolean;
  stripeProductId: string;
  tierKey?: string;
  variants: ProductVariant[];
  uiOrder: number;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
    alt?: string;
  };
  ctaLabel?: string;
  notes?: string;
}

/**
 * Enriched product variant with Stripe price data
 */
export interface EnrichedProductVariant extends ProductVariant {
  price: Stripe.Price;
  formattedPrice: string;
  billingInterval?: string;
}

/**
 * Enriched product with all variant price data
 */
export interface EnrichedStripeProduct extends Omit<StripeProduct, 'variants'> {
  variants: EnrichedProductVariant[];
}

/**
 * Subscription Page Settings from Sanity
 */
export interface SubscriptionPageSettings {
  _id: string;
  _type: 'subscriptionPageSettings';
  title?: string;
  subtitle?: string;
  showBillingToggle?: boolean;
  monthlyLabel?: string;
  yearlyLabel?: string;
  yearlyDiscountBadge?: string;
  faq?: Array<{
    _ref: string;
    _type: 'reference';
  }>;
  ctaSection?: {
    enabled: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

/**
 * Checkout request payload
 */
export interface CheckoutRequest {
  priceId: string;
  mode: 'payment' | 'subscription';
  successPath?: string;
  cancelPath?: string;
}

/**
 * Billing portal request payload
 */
export interface BillingPortalRequest {
  returnUrl?: string;
}
