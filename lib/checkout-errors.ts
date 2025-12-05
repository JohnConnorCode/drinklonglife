/**
 * CHECKOUT ERROR HANDLING
 *
 * Maps technical errors to user-friendly messages with helpful suggestions.
 * This ensures customers never see confusing technical jargon.
 */

export interface CheckoutErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
  shouldClearCart?: boolean;
  contactSupport?: boolean;
}

/**
 * Maps error messages/codes to user-friendly error info
 */
export function getCheckoutErrorInfo(error: string): CheckoutErrorInfo {
  const errorLower = error.toLowerCase();

  // Rate limiting
  if (errorLower.includes('too many') || errorLower.includes('rate limit')) {
    return {
      title: 'Please slow down',
      message: 'You\'ve made too many checkout attempts. This is for your security.',
      suggestion: 'Wait a moment, then try again.',
      canRetry: true,
    };
  }

  // Idempotency / duplicate request
  if (errorLower.includes('idempotent') || errorLower.includes('duplicate')) {
    return {
      title: 'Request already processed',
      message: 'Your checkout request is being processed or was already completed.',
      suggestion: 'Check your email for an order confirmation. If you didn\'t complete checkout, wait a moment and try again.',
      canRetry: true,
    };
  }

  // Product not found / invalid
  if (errorLower.includes('variant not found') || errorLower.includes('product not found')) {
    return {
      title: 'Product unavailable',
      message: 'One or more items in your cart are no longer available.',
      suggestion: 'Remove the unavailable items and try again, or browse our other products.',
      canRetry: false,
      shouldClearCart: true,
    };
  }

  // Product not active
  if (errorLower.includes('not available') || errorLower.includes('not active')) {
    return {
      title: 'Product unavailable',
      message: 'This product is temporarily unavailable.',
      suggestion: 'Please remove it from your cart and try a different product.',
      canRetry: false,
    };
  }

  // Out of stock
  if (errorLower.includes('out of stock') || errorLower.includes('insufficient stock')) {
    return {
      title: 'Out of stock',
      message: 'Some items in your cart are out of stock.',
      suggestion: 'Reduce the quantity or remove the out-of-stock items.',
      canRetry: false,
    };
  }

  // Invalid quantity
  if (errorLower.includes('invalid quantity')) {
    return {
      title: 'Invalid quantity',
      message: 'The quantity you selected is not valid.',
      suggestion: 'Please select a quantity between 1 and 999.',
      canRetry: false,
    };
  }

  // Mixed cart (subscriptions + one-time)
  if (errorLower.includes('mix') && (errorLower.includes('subscription') || errorLower.includes('one-time'))) {
    return {
      title: 'Can\'t mix order types',
      message: 'Subscriptions and one-time purchases must be checked out separately.',
      suggestion: 'Please checkout your subscriptions first, then come back for one-time purchases (or vice versa).',
      canRetry: false,
    };
  }

  // Subscription quantity
  if (errorLower.includes('subscription') && errorLower.includes('quantity')) {
    return {
      title: 'Subscription limit',
      message: 'Subscription items can only have a quantity of 1.',
      suggestion: 'Set the subscription quantity to 1, or choose a one-time purchase instead.',
      canRetry: false,
    };
  }

  // Invalid price / price error
  if (errorLower.includes('invalid price') || errorLower.includes('price') && errorLower.includes('error')) {
    return {
      title: 'Pricing error',
      message: 'There was an issue with the pricing for one of your items.',
      suggestion: 'Please remove the item and add it again. If the problem persists, contact us.',
      canRetry: false,
      contactSupport: true,
    };
  }

  // Discount / coupon errors
  if (errorLower.includes('discount') || errorLower.includes('coupon')) {
    if (errorLower.includes('expired')) {
      return {
        title: 'Discount expired',
        message: 'This discount code has expired.',
        suggestion: 'Remove the discount code and try again, or use a different code.',
        canRetry: true,
      };
    }
    if (errorLower.includes('minimum') || errorLower.includes('min')) {
      return {
        title: 'Minimum not met',
        message: 'Your order doesn\'t meet the minimum for this discount.',
        suggestion: 'Add more items to your cart or remove the discount code.',
        canRetry: true,
      };
    }
    if (errorLower.includes('first-time') || errorLower.includes('first time')) {
      return {
        title: 'First-time customers only',
        message: 'This discount is for first-time customers only.',
        suggestion: 'Remove this code if you\'ve ordered before.',
        canRetry: true,
      };
    }
    return {
      title: 'Invalid discount',
      message: 'This discount code is not valid.',
      suggestion: 'Check the code and try again, or remove it to proceed.',
      canRetry: true,
    };
  }

  // Customer not found (Stripe mode mismatch)
  if (errorLower.includes('no such customer') || errorLower.includes('customer') && errorLower.includes('not found')) {
    return {
      title: 'Account sync issue',
      message: 'There was a temporary issue with your account.',
      suggestion: 'Please try again. If the problem continues, log out and log back in.',
      canRetry: true,
    };
  }

  // Network / connection errors
  if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
    return {
      title: 'Connection issue',
      message: 'We couldn\'t connect to the payment system.',
      suggestion: 'Check your internet connection and try again.',
      canRetry: true,
    };
  }

  // Stripe API errors
  if (errorLower.includes('stripe') && !errorLower.includes('customer')) {
    return {
      title: 'Payment system error',
      message: 'Our payment system is experiencing issues.',
      suggestion: 'Please try again in a few minutes. We\'re working on it!',
      canRetry: true,
      contactSupport: true,
    };
  }

  // URL / redirect errors
  if (errorLower.includes('url') || errorLower.includes('redirect')) {
    return {
      title: 'Checkout redirect failed',
      message: 'We couldn\'t redirect you to the payment page.',
      suggestion: 'Please try again. If the problem persists, try a different browser.',
      canRetry: true,
    };
  }

  // Cart validation errors
  if (errorLower.includes('cart') || errorLower.includes('items')) {
    return {
      title: 'Cart issue',
      message: 'There\'s an issue with your cart.',
      suggestion: 'Refresh the page and try again. If items are missing, add them back.',
      canRetry: true,
    };
  }

  // Generic server error
  if (errorLower.includes('server') || errorLower.includes('500') || errorLower.includes('internal')) {
    return {
      title: 'Something went wrong',
      message: 'We encountered an unexpected error.',
      suggestion: 'Please try again. If the problem continues, contact us for help.',
      canRetry: true,
      contactSupport: true,
    };
  }

  // Default fallback - always be helpful
  return {
    title: 'Checkout issue',
    message: 'We couldn\'t complete your checkout.',
    suggestion: 'Please try again. If the problem continues, contact us and we\'ll help you complete your order.',
    canRetry: true,
    contactSupport: true,
  };
}

/**
 * Sanitizes error messages to remove technical details
 * This is a backup in case technical errors slip through
 */
export function sanitizeErrorMessage(error: string): string {
  // Remove price IDs
  let sanitized = error.replace(/price_[a-zA-Z0-9]+/g, '[item]');
  // Remove customer IDs
  sanitized = sanitized.replace(/cus_[a-zA-Z0-9]+/g, '[account]');
  // Remove session IDs
  sanitized = sanitized.replace(/cs_[a-zA-Z0-9_]+/g, '[session]');
  // Remove UUIDs
  sanitized = sanitized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[id]');
  // Remove Stripe-specific terms
  sanitized = sanitized.replace(/stripe/gi, 'payment system');

  return sanitized;
}
