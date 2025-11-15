'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProductVariant {
  id?: string;
  size_key: string;
  label: string;
  stripe_price_id: string;
  is_default: boolean;
  display_order: number;
  is_active: boolean;
  price_usd?: number | null;
  sku?: string | null;
}

interface VariantsManagerProps {
  productId?: string;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const SIZE_OPTIONS = [
  { value: 'gallon', label: 'Gallon' },
  { value: 'half_gallon', label: 'Half Gallon' },
  { value: 'shot', label: 'Shot' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'case', label: 'Case' },
];

export function VariantsManager({ productId, variants, onVariantsChange }: VariantsManagerProps) {
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>(variants || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      size_key: 'gallon',
      label: 'Gallon',
      stripe_price_id: '',
      is_default: localVariants.length === 0,
      display_order: localVariants.length + 1,
      is_active: true,
      price_usd: null,
      sku: null,
    };
    const updated = [...localVariants, newVariant];
    setLocalVariants(updated);
    onVariantsChange(updated);
    setEditingIndex(updated.length - 1);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...localVariants];
    updated[index] = { ...updated[index], [field]: value };

    // If setting this as default, unset others
    if (field === 'is_default' && value === true) {
      updated.forEach((v, i) => {
        if (i !== index) {
          v.is_default = false;
        }
      });
    }

    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  const deleteVariant = (index: number) => {
    const updated = localVariants.filter((_, i) => i !== index);

    // If we deleted the default, make the first one default
    if (updated.length > 0 && !updated.some(v => v.is_default)) {
      updated[0].is_default = true;
    }

    setLocalVariants(updated);
    onVariantsChange(updated);
    setEditingIndex(null);
  };

  const moveVariant = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === localVariants.length - 1)
    ) {
      return;
    }

    const updated = [...localVariants];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update display orders
    updated.forEach((v, i) => {
      v.display_order = i + 1;
    });

    setLocalVariants(updated);
    onVariantsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <button
          type="button"
          onClick={addVariant}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + Add Variant
        </button>
      </div>

      {localVariants.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No variants yet</p>
          <button
            type="button"
            onClick={addVariant}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Add Your First Variant
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {localVariants.map((variant, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${
                editingIndex === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => moveVariant(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVariant(index, 'down')}
                    disabled={index === localVariants.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▼
                  </button>
                </div>

                {/* Variant Form */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={variant.size_key}
                      onChange={(e) => {
                        updateVariant(index, 'size_key', e.target.value);
                        // Auto-update label to match
                        const option = SIZE_OPTIONS.find(o => o.value === e.target.value);
                        if (option) {
                          updateVariant(index, 'label', option.label);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      {SIZE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Display Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.label}
                      onChange={(e) => updateVariant(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g., 1-Gallon Jug"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stripe Price ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={variant.stripe_price_id}
                      onChange={(e) => updateVariant(index, 'stripe_price_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="price_xxxxx"
                    />
                    {variant.stripe_price_id && !variant.stripe_price_id.startsWith('price_') && (
                      <p className="text-red-600 text-xs mt-1">
                        Must start with "price_"
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price (USD) <span className="text-gray-400 text-xs">(optional, for display)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price_usd || ''}
                      onChange={(e) => updateVariant(index, 'price_usd', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="99.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      SKU <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="YB-GAL-001"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.is_default}
                        onChange={(e) => updateVariant(index, 'is_default', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Default</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.is_active}
                        onChange={(e) => updateVariant(index, 'is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title={editingIndex === index ? 'Collapse' : 'Expand'}
                  >
                    {editingIndex === index ? '▼' : '▶'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteVariant(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Validation Summary */}
              {editingIndex === index && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Order: {variant.display_order}</p>
                    <p>{variant.is_default ? '✓ Default variant' : '○ Not default'}</p>
                    <p>{variant.is_active ? '✓ Active' : '○ Inactive'}</p>
                    {variant.stripe_price_id && variant.stripe_price_id.startsWith('price_') && (
                      <p className="text-green-600">✓ Valid Stripe Price ID</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {localVariants.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>{localVariants.length}</strong> variant{localVariants.length !== 1 ? 's' : ''} configured
            {localVariants.filter(v => v.is_active).length < localVariants.length && (
              <span className="ml-2">
                ({localVariants.filter(v => v.is_active).length} active)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
