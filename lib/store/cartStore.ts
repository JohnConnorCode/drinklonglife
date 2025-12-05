import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/logger';

/**
 * Cart item interface
 */
export interface CartItem {
  id: string;
  priceId: string;
  productName: string;
  productType: 'one-time' | 'subscription';
  quantity: number;
  amount: number; // in cents
  image?: string;
  metadata: {
    blendSlug?: string;
    sizeKey?: string;
    variantLabel?: string;
  };
}

/**
 * Coupon interface
 */
export interface Coupon {
  code: string;
  promotionCodeId?: string; // Stripe promotion code ID (promo_xxx) - for applying at checkout
  couponId: string;         // Underlying Stripe coupon ID
  discountType: 'percent' | 'amount';
  discountPercent?: number;
  discountAmount?: number; // in cents
  valid: boolean;
  restrictions?: {
    firstTimeOnly?: boolean;
    minimumAmount?: number;
  };
}

/**
 * Cart store state
 */
interface CartState {
  items: CartItem[];
  coupon?: Coupon;
  isLoading: boolean;
  error?: string;
}

/**
 * Cart store actions
 */
interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  clearCart: () => void;
  clearError: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

/**
 * Cart store type
 */
export type CartStore = CartState & CartActions;

/**
 * Generate unique cart item ID using a simple hash to avoid collisions
 */
function generateCartItemId(priceId: string, metadata: CartItem['metadata']): string {
  // Create a unique string from all identifying fields
  const uniqueStr = JSON.stringify({
    p: priceId,
    s: metadata.sizeKey || '',
    b: metadata.blendSlug || '',
  });

  // Simple hash function to create a short, unique ID
  let hash = 0;
  for (let i = 0; i < uniqueStr.length; i++) {
    const char = uniqueStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Return priceId prefix + hash for readability and uniqueness
  return `${priceId.slice(0, 20)}_${Math.abs(hash).toString(36)}`;
}

/**
 * Cart store using Zustand with localStorage persistence
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      coupon: undefined,
      isLoading: false,
      error: undefined,

      // Add item to cart
      addItem: (item) => {
        // Validate price ID before adding
        if (!item.priceId || !item.priceId.startsWith('price_') || item.priceId.length < 20) {
          logger.error('Invalid priceId:', item.priceId);
          const errorMsg = 'Invalid product data. Please refresh the page.';
          set({ error: errorMsg });
          // Auto-clear error after 8 seconds
          setTimeout(() => {
            if (get().error === errorMsg) {
              set({ error: undefined });
            }
          }, 8000);
          return;
        }

        // CRITICAL: Prevent mixing one-time and subscription items
        const currentItems = get().items;
        if (currentItems.length > 0) {
          const existingType = currentItems[0].productType;
          if (existingType !== item.productType) {
            const errorMsg = item.productType === 'subscription'
              ? 'Cannot add subscription to cart with one-time purchases. Please checkout separately or clear your cart first.'
              : 'Cannot add one-time purchase to cart with subscriptions. Please checkout separately or clear your cart first.';
            logger.warn('Mixed billing types in cart:', { existingType, newType: item.productType });
            set({ error: errorMsg });
            // Auto-clear error after 8 seconds
            setTimeout(() => {
              if (get().error === errorMsg) {
                set({ error: undefined });
              }
            }, 8000);
            return;
          }
        }

        // Enforce quantity=1 for subscription items
        if (item.productType === 'subscription' && item.quantity > 1) {
          logger.warn('Subscription items must have quantity of 1');
          const errorMsg = 'Subscription items can only have a quantity of 1.';
          set({ error: errorMsg });
          // Auto-clear error after 8 seconds
          setTimeout(() => {
            if (get().error === errorMsg) {
              set({ error: undefined });
            }
          }, 8000);
          return;
        }

        const id = generateCartItemId(item.priceId, item.metadata);
        const existingItem = get().items.find((i) => i.id === id);

        if (existingItem) {
          // Update quantity if item already exists (only for one-time items)
          if (item.productType === 'one-time') {
            set({
              items: get().items.map((i) =>
                i.id === id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              error: undefined, // Clear any previous errors
            });
          } else {
            // Subscription items can't increase quantity
            const errorMsg = 'This subscription is already in your cart.';
            set({ error: errorMsg });
            // Auto-clear error after 8 seconds
            setTimeout(() => {
              if (get().error === errorMsg) {
                set({ error: undefined });
              }
            }, 8000);
          }
        } else {
          // Add new item
          set({
            items: [...get().items, { ...item, id }],
            error: undefined, // Clear any previous errors
          });
        }
      },

      // Remove item from cart
      removeItem: (id) => {
        const newItems = get().items.filter((item) => item.id !== id);
        set({
          items: newItems,
          // Clear error when cart becomes empty (user fixed the problem by removing items)
          error: newItems.length === 0 ? undefined : get().error,
        });
      },

      // Update item quantity
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      // Apply coupon code
      applyCoupon: async (code) => {
        set({ isLoading: true, error: undefined });

        try {
          // Get current subtotal for min amount validation
          const subtotal = get().getSubtotal();

          // Call API to validate coupon
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, subtotal }),
          });

          const data = await response.json();

          if (!response.ok || !data.valid) {
            throw new Error(data.error || 'Invalid discount code');
          }

          // Map API response to Coupon interface
          const coupon: Coupon = {
            code: data.code,
            promotionCodeId: data.promotionCodeId,
            couponId: data.couponId,
            discountType: data.discountType,
            discountPercent: data.discountPercent,
            discountAmount: data.discountAmount,
            valid: true,
            restrictions: data.restrictions,
          };

          set({ coupon, isLoading: false });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to apply code';
          set({
            error: errorMsg,
            isLoading: false,
          });
          // Auto-clear error after 8 seconds
          setTimeout(() => {
            if (get().error === errorMsg) {
              set({ error: undefined });
            }
          }, 8000);
        }
      },

      // Remove coupon
      removeCoupon: () => {
        set({ coupon: undefined, error: undefined });
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          coupon: undefined,
          error: undefined,
        });
      },

      // Clear error manually
      clearError: () => {
        set({ error: undefined });
      },

      // Get subtotal (before discount)
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.amount * item.quantity,
          0
        );
      },

      // Get discount amount
      getDiscount: () => {
        const { coupon } = get();
        if (!coupon || !coupon.valid) return 0;

        const subtotal = get().getSubtotal();

        if (coupon.discountPercent) {
          return Math.round((subtotal * coupon.discountPercent) / 100);
        }

        if (coupon.discountAmount) {
          return Math.min(coupon.discountAmount, subtotal);
        }

        return 0;
      },

      // Get total (after discount)
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      // Get total item count
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      version: 2, // Increment to clear old cart data
      migrate: (persistedState: any, version: number) => {
        // Clear cart if version is old or if items have invalid priceIds
        if (version < 2) {
          return {
            items: [],
            coupon: undefined,
          };
        }

        // Filter out items with invalid priceIds
        if (persistedState?.items) {
          persistedState.items = persistedState.items.filter((item: any) =>
            item.priceId &&
            item.priceId.startsWith('price_') &&
            item.priceId.length > 20
          );
        }

        return persistedState;
      },
      // Only persist items and coupon, not loading/error states
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);

/**
 * Utility function to format price for display
 */
export function formatPrice(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}
