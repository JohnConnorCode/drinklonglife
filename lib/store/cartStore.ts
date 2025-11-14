import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  discountPercent?: number;
  discountAmount?: number; // in cents
  valid: boolean;
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
 * Generate unique cart item ID
 */
function generateCartItemId(priceId: string, metadata: CartItem['metadata']): string {
  const parts = [priceId, metadata.sizeKey, metadata.blendSlug].filter(Boolean);
  return parts.join('-');
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
        const id = generateCartItemId(item.priceId, item.metadata);
        const existingItem = get().items.find((i) => i.id === id);

        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: get().items.map((i) =>
              i.id === id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...get().items, { ...item, id }],
          });
        }
      },

      // Remove item from cart
      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
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
          // Call API to validate coupon
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid coupon code');
          }

          const coupon: Coupon = await response.json();

          set({ coupon, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to apply coupon',
            isLoading: false,
          });
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
