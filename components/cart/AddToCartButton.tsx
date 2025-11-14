'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
  priceId: string;
  productName: string;
  productType: 'one-time' | 'subscription';
  amount: number; // in cents
  image?: string;
  blendSlug: string;
  sizeKey: string;
  variantLabel: string;
  className?: string;
}

export function AddToCartButton({
  priceId,
  productName,
  productType,
  amount,
  image,
  blendSlug,
  sizeKey,
  variantLabel,
  className = '',
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Add item to cart
    addItem({
      priceId,
      productName,
      productType,
      quantity: 1,
      amount,
      image,
      metadata: {
        blendSlug,
        sizeKey,
        variantLabel,
      },
    });

    // Show success state
    setJustAdded(true);
    setIsAdding(false);

    // Reset success state after 2 seconds
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAddToCart}
        disabled={isAdding || justAdded}
        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
          justAdded
            ? 'bg-green-600 text-white'
            : 'bg-gray-900 text-white hover:bg-accent-primary hover:scale-105'
        } shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {justAdded ? (
          <>
            <Check className="w-5 h-5" />
            Added!
          </>
        ) : isAdding ? (
          'Adding...'
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </button>

      {justAdded && (
        <button
          onClick={handleViewCart}
          className="px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 bg-accent-primary text-white hover:opacity-90 hover:scale-105 shadow-md"
        >
          View Cart
        </button>
      )}
    </div>
  );
}
