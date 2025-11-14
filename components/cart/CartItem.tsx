'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore, formatPrice, type CartItem as CartItemType } from '@/lib/store/cartStore';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  const blendUrl = item.metadata.blendSlug ? `/blends/${item.metadata.blendSlug}` : '#';
  const itemTotal = item.amount * item.quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      {/* Product Image */}
      {item.image && (
        <Link href={blendUrl} className="flex-shrink-0">
          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.productName}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      )}

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={blendUrl} className="hover:text-accent-primary transition-colors">
            <h3 className="font-semibold text-lg text-gray-900">
              {item.productName}
            </h3>
          </Link>
          {item.metadata.variantLabel && (
            <p className="text-sm text-gray-600 mt-1">{item.metadata.variantLabel}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {item.productType === 'subscription' ? 'Subscription' : 'One-time purchase'}
          </p>
        </div>

        {/* Mobile Price */}
        <div className="flex items-center justify-between mt-2 md:hidden">
          <p className="text-lg font-bold text-gray-900">{formatPrice(itemTotal)}</p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-semibold">Qty: {item.quantity}</span>
          <button
            onClick={handleIncrement}
            className="p-2 hover:bg-white rounded-md transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Price and Remove */}
        <div className="hidden md:flex flex-col items-end gap-2">
          <p className="text-lg font-bold text-gray-900">{formatPrice(itemTotal)}</p>
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>

        {/* Mobile Remove */}
        <button
          onClick={handleRemove}
          className="md:hidden text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors mt-2"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
}
