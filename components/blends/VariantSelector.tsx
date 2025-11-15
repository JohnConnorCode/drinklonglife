'use client';

import { useState } from 'react';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface Variant {
  id: string;
  size_key: string;
  label: string;
  stripe_price_id: string;
  is_default: boolean;
  is_active: boolean;
  price_usd: number | null;
  billing_type?: string;
  recurring_interval?: string;
  recurring_interval_count?: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  priceMap: Map<string, number>;
  productName: string;
  productImage?: string;
  blendSlug: string;
}

export function VariantSelector({
  variants,
  priceMap,
  productName,
  productImage,
  blendSlug,
}: VariantSelectorProps) {
  // Separate variants by billing type
  const oneTimeVariants = variants.filter(v => v.is_active && (!v.billing_type || v.billing_type === 'one_time'));
  const subscriptionVariants = variants.filter(v => v.is_active && v.billing_type === 'recurring');

  const [billingType, setBillingType] = useState<'one_time' | 'subscription'>(
    subscriptionVariants.length > 0 ? 'one_time' : 'one_time'
  );

  const activeVariants = billingType === 'one_time' ? oneTimeVariants : subscriptionVariants;

  // Only show toggle if we have both types
  const showToggle = oneTimeVariants.length > 0 && subscriptionVariants.length > 0;

  return (
    <div className="space-y-6">
      {/* Billing Type Toggle */}
      {showToggle && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setBillingType('one_time')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                billingType === 'one_time'
                  ? 'bg-white text-accent-primary shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              One-Time Purchase
            </button>
            <button
              onClick={() => setBillingType('subscription')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                billingType === 'subscription'
                  ? 'bg-white text-accent-primary shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Subscription
            </button>
          </div>
        </div>
      )}

      {/* Variant Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {activeVariants.map((variant) => {
          const isPopular = variant.is_default;
          const isSubscription = variant.billing_type === 'recurring';

          return (
            <div
              key={variant.id}
              className={`relative group bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 ${
                isPopular
                  ? 'border-4 border-accent-primary shadow-2xl scale-105'
                  : 'border-2 border-gray-200 shadow-lg hover:border-accent-primary hover:shadow-2xl'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-primary text-white rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-heading text-2xl font-bold mb-1 text-gray-900">
                  {variant.label.replace(' (Monthly)', '')}
                </h3>
                {isSubscription && (
                  <p className="text-sm text-gray-500 font-medium">Delivered Monthly</p>
                )}
              </div>

              {variant.price_usd && (
                <div className="my-6">
                  <span className="text-5xl font-bold text-accent-primary">
                    ${variant.price_usd}
                  </span>
                  {isSubscription && (
                    <span className="text-gray-500 text-lg">/month</span>
                  )}
                </div>
              )}

              {isSubscription && (
                <div className="mb-4 text-sm text-gray-600">
                  <p>✓ Free delivery every month</p>
                  <p>✓ Cancel anytime</p>
                  <p>✓ Save 15% vs one-time</p>
                </div>
              )}

              {variant.stripe_price_id && variant.price_usd && (
                <AddToCartButton
                  priceId={variant.stripe_price_id}
                  productName={`${productName} - ${variant.label}`}
                  productType={isSubscription ? 'subscription' : 'one-time'}
                  amount={variant.price_usd * 100}
                  image={productImage}
                  blendSlug={blendSlug}
                  sizeKey={variant.size_key}
                  variantLabel={variant.label}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-10">
        <p className="text-sm text-gray-500">
          {billingType === 'subscription'
            ? 'Subscriptions can be paused or cancelled anytime • No commitment required'
            : 'Free delivery over $40 • Pickup available at all locations'
          }
        </p>
      </div>
    </div>
  );
}
