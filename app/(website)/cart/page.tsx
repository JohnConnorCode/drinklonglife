'use client';

import { useState } from 'react';
import { useCartStore, formatPrice } from '@/lib/store/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { CouponInput } from '@/components/cart/CouponInput';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';

export default function CartPage() {
  const { items, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  const handleCheckout = async () => {
    console.log('🛒 handleCheckout called');
    setCheckoutError(null);
    setIsProcessing(true);

    try {
      // Validate all items have valid price IDs
      const invalidItems = items.filter(item =>
        !item.priceId || !item.priceId.startsWith('price_') || item.priceId.length < 20
      );

      if (invalidItems.length > 0) {
        console.error('Invalid items in cart:', invalidItems);
        clearCart();
        throw new Error('Your cart contains invalid items. Cart has been cleared. Please add items again.');
      }

      // Prepare checkout items
      const checkoutItems = items.map(item => ({
        priceId: item.priceId,
        quantity: item.quantity,
      }));
      console.log('📦 Checkout items:', checkoutItems);

      // Get coupon code if applied
      const { coupon } = useCartStore.getState();
      const couponCode = coupon?.valid ? coupon.code : undefined;
      console.log('🎫 Coupon code:', couponCode);

      // Call checkout API
      console.log('📡 Calling /api/checkout...');
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          couponCode,
        }),
      });

      console.log('📬 Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || 'Failed to create checkout session';
        console.error('❌ Checkout error response:', errorData);
        throw new Error(errorMessage);
      }

      const { url } = await response.json();
      console.log('🔗 Received checkout URL:', url);

      // Redirect to Stripe Checkout
      if (url) {
        console.log('🚀 Redirecting to:', url);
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some delicious juice blends to get started!
            </p>
            <Link
              href="/blends"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent-primary text-white rounded-full font-semibold hover:opacity-90 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Browse Blends
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blends"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-accent-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Input */}
              <div className="mb-6">
                <CouponInput />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Error Message */}
              {checkoutError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 mb-1">
                        Checkout Error
                      </h3>
                      <p className="text-sm text-red-700">{checkoutError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-accent-primary text-white py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              {/* Clear Cart */}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="w-full text-gray-600 hover:text-red-600 py-2 text-sm transition-colors"
              >
                Clear Cart
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Free shipping on orders over $50
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Secure checkout
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    30-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
