'use client';

import { useState, useEffect } from 'react';
import { useCartStore, formatPrice } from '@/lib/store/cartStore';
import { CartItem } from '@/components/cart/CartItem';
import { CouponInput } from '@/components/cart/CouponInput';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { logger } from '@/lib/logger';
import { getCheckoutErrorInfo, type CheckoutErrorInfo } from '@/lib/checkout-errors';

export default function CartPage() {
  const { items, getSubtotal, getDiscountAmount, getTotal, clearCart, removeItem } = useCartStore();
  const [checkoutError, setCheckoutError] = useState<CheckoutErrorInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();

  // Clear checkout errors on mount and when cart changes
  useEffect(() => {
    setCheckoutError(null);
  }, [items]);

  // Auto-clear checkout errors after 10 seconds
  useEffect(() => {
    if (checkoutError) {
      const timer = setTimeout(() => {
        setCheckoutError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [checkoutError]);

  const handleCheckout = async () => {
    logger.debug('handleCheckout called');
    setCheckoutError(null);
    setIsProcessing(true);

    try {
      // Validate all items have valid price IDs
      const invalidItems = items.filter(item =>
        !item.priceId || !item.priceId.startsWith('price_') || item.priceId.length < 20
      );

      if (invalidItems.length > 0) {
        logger.warn('Found invalid items in cart, removing them:', invalidItems.map(i => i.id));

        // Remove only invalid items, not the entire cart
        invalidItems.forEach(item => removeItem(item.id));

        // If ALL items were invalid, show error
        if (invalidItems.length === items.length) {
          throw new Error('All items in your cart were invalid and have been removed. Please add items again.');
        }

        // Show warning but allow checkout to continue with valid items
        setCheckoutError({
          title: 'Items removed',
          message: `${invalidItems.length} invalid item(s) were removed from your cart.`,
          suggestion: 'Proceeding with checkout...',
          canRetry: false,
        });

        // Continue with checkout after short delay to show message
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCheckoutError(null);
      }

      // Prepare checkout items
      const checkoutItems = items.map(item => ({
        priceId: item.priceId,
        quantity: item.quantity,
      }));
      logger.debug('Checkout items:', checkoutItems);

      // Validate cart items are still available (inventory check)
      logger.debug('Validating cart items...');
      const validateResponse = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkoutItems }),
      });

      if (!validateResponse.ok) {
        const validateError = await validateResponse.json();
        throw new Error(validateError.error || 'Some items in your cart are no longer available');
      }

      // Get discount code if applied (database-only, no Stripe dependency)
      const { discount } = useCartStore.getState();
      const discountCode = discount?.valid ? discount.code : undefined;
      logger.debug('Discount:', { discountCode });

      // Call checkout API
      logger.debug('Calling /api/checkout...');
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          discountCode,
        }),
      });

      logger.debug('Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details || errorData.error || 'Failed to create checkout session';
        logger.error('Checkout error response:', errorData);
        throw new Error(errorMessage);
      }

      const { url } = await response.json();
      logger.debug('Received checkout URL:', url);

      // Redirect to Stripe Checkout
      if (url) {
        logger.debug('Redirecting to:', url);
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      logger.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errorInfo = getCheckoutErrorInfo(errorMessage);

      // If error suggests clearing cart and it's a product issue, offer to clear
      if (errorInfo.shouldClearCart) {
        setShowClearConfirm(true);
      }

      setCheckoutError(errorInfo);
      setIsProcessing(false);
      setRetryCount(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setCheckoutError(null);
    handleCheckout();
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
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
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
                        {checkoutError.title}
                      </h3>
                      <p className="text-sm text-red-700 mb-2">{checkoutError.message}</p>
                      <p className="text-sm text-red-600 italic">{checkoutError.suggestion}</p>

                      {/* Action buttons */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {checkoutError.canRetry && retryCount < 3 && (
                          <button
                            onClick={handleRetry}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try Again
                          </button>
                        )}
                        {checkoutError.contactSupport && (
                          <a
                            href="mailto:hello@drinklonglife.com?subject=Checkout%20Issue"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            Contact Support
                          </a>
                        )}
                      </div>

                      {retryCount >= 3 && (
                        <p className="mt-3 text-xs text-red-500">
                          Still having issues? Email us at{' '}
                          <a href="mailto:hello@drinklonglife.com" className="underline">
                            hello@drinklonglife.com
                          </a>{' '}
                          and we&apos;ll help you complete your order.
                        </p>
                      )}
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
                onClick={() => setShowClearConfirm(true)}
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

        {/* Clear Cart Confirmation Modal */}
        <ConfirmModal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={clearCart}
          title="Clear Cart?"
          message="Are you sure you want to remove all items from your cart? This action cannot be undone."
          confirmText="Clear Cart"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
