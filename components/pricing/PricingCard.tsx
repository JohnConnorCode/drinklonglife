'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/lib/image';
import { CheckoutButton } from './CheckoutButton';
import type { EnrichedStripeProduct } from '@/types/stripe';

interface PricingCardProps {
  product: EnrichedStripeProduct;
}

export function PricingCard({ product }: PricingCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    product.variants.findIndex(v => v.isDefault) || 0
  );

  const selectedVariant = product.variants[selectedVariantIndex];
  const isSubscription = selectedVariant.price.type === 'recurring';

  return (
    <div
      className={`
        relative bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2
        ${product.featured
          ? 'border-4 border-accent-primary shadow-2xl scale-105'
          : 'border-2 border-gray-200 shadow-lg hover:border-accent-primary hover:shadow-2xl'
        }
      `}
    >
      {product.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-accent-primary text-white text-sm font-bold rounded-full shadow-lg">
          {product.badge}
        </div>
      )}

      {/* Product Image */}
      {product.image && (
        <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden">
          <Image
            src={urlFor(product.image).width(400).height(400).url()}
            alt={product.image.alt || product.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Product Title */}
      <h3 className="font-heading text-3xl font-bold mb-3 text-gray-900">
        {product.title}
      </h3>

      {/* Product Description */}
      {product.description && (
        <div className="text-lg text-gray-600 mb-6 leading-relaxed">
          {/* Render portable text or simple text */}
          {typeof product.description === 'string'
            ? product.description
            : 'Premium quality product'}
        </div>
      )}

      {/* Size Selector */}
      {product.variants.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Size:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {product.variants
              .sort((a, b) => a.uiOrder - b.uiOrder)
              .map((variant, index) => (
                <button
                  key={variant.stripePriceId}
                  onClick={() => setSelectedVariantIndex(index)}
                  className={`
                    px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${selectedVariantIndex === index
                      ? 'bg-accent-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {variant.label}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="mb-8 p-6 bg-gradient-to-br from-accent-yellow/10 to-accent-green/10 rounded-xl border-2 border-accent-yellow/20">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-medium text-gray-700">
            {selectedVariant.label}
          </span>
          <div className="text-right">
            <span className="font-bold text-accent-primary text-3xl">
              {selectedVariant.formattedPrice}
            </span>
            {selectedVariant.billingInterval && (
              <span className="text-sm text-gray-600 ml-1">
                /{selectedVariant.billingInterval}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <CheckoutButton
        priceId={selectedVariant.stripePriceId}
        mode={isSubscription ? 'subscription' : 'payment'}
        label={product.ctaLabel || (isSubscription ? 'Subscribe Now' : 'Buy Now')}
        className={`
          w-full px-8 py-4 rounded-full font-semibold text-lg
          transition-all duration-300 shadow-lg hover:shadow-xl
          ${product.featured
            ? 'bg-accent-primary text-white hover:opacity-90'
            : 'bg-gray-900 text-white hover:bg-accent-primary'
          }
        `}
      />

      {/* Additional Info */}
      {isSubscription && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Cancel anytime. No commitments.
        </p>
      )}
    </div>
  );
}
