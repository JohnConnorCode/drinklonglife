'use client';

/**
 * InventoryManager Component
 *
 * Admin interface for managing product inventory levels
 */

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface ProductVariant {
  id: string;
  product_id: string;
  label: string;
  size_key: string;
  stripe_price_id: string;
  track_inventory: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number;
  product: {
    name: string;
  };
}

interface InventoryTransaction {
  id: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return';
  quantity_change: number;
  previous_quantity: number | null;
  new_quantity: number | null;
  notes: string | null;
  created_at: string;
}

export function InventoryManager() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockNotes, setRestockNotes] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [trackInventory, setTrackInventory] = useState(false);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          product_id,
          label,
          size_key,
          stripe_price_id,
          track_inventory,
          stock_quantity,
          low_stock_threshold,
          products:product_id (
            name
          )
        `)
        .eq('is_active', true)
        .order('stock_quantity', { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Transform data to match interface
      const transformedData = data?.map(v => ({
        ...v,
        product: {
          name: Array.isArray(v.products) ? v.products[0]?.name : v.products?.name || 'Unknown Product'
        }
      })) || [];

      setVariants(transformedData);
    } catch (err: any) {
      logger.error('Error loading variants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (variantId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('variant_id', variantId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      logger.error('Error loading transactions:', err);
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setTrackInventory(variant.track_inventory);
    setLowStockThreshold(variant.low_stock_threshold.toString());
    setRestockAmount('');
    setRestockNotes('');
    setError(null);
    setSuccess(null);
    loadTransactions(variant.id);
  };

  const handleToggleInventoryTracking = async () => {
    if (!selectedVariant) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ track_inventory: !trackInventory })
        .eq('id', selectedVariant.id);

      if (error) throw error;

      setSuccess('Inventory tracking updated');
      setTrackInventory(!trackInventory);
      loadVariants();
    } catch (err: any) {
      logger.error('Error updating inventory tracking:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateThreshold = async () => {
    if (!selectedVariant) return;

    const threshold = parseInt(lowStockThreshold);
    if (isNaN(threshold) || threshold < 1) {
      setError('Threshold must be a positive number');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ low_stock_threshold: threshold })
        .eq('id', selectedVariant.id);

      if (error) throw error;

      setSuccess('Low stock threshold updated');
      loadVariants();
    } catch (err: any) {
      logger.error('Error updating threshold:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedVariant) return;

    const amount = parseInt(restockAmount);
    if (isNaN(amount) || amount < 1) {
      setError('Restock amount must be a positive number');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Call increase_inventory RPC function
      const { data, error } = await supabase.rpc('increase_inventory', {
        p_variant_id: selectedVariant.id,
        p_quantity: amount,
        p_type: 'restock',
        p_notes: restockNotes || null,
      });

      if (error) throw error;

      setSuccess(`Successfully added ${amount} units to inventory`);
      setRestockAmount('');
      setRestockNotes('');
      loadVariants();
      loadTransactions(selectedVariant.id);
    } catch (err: any) {
      logger.error('Error restocking inventory:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getLowStockVariants = () => {
    return variants.filter(
      v =>
        v.track_inventory &&
        v.stock_quantity !== null &&
        v.stock_quantity <= v.low_stock_threshold
    );
  };

  const getOutOfStockVariants = () => {
    return variants.filter(
      v => v.track_inventory && v.stock_quantity !== null && v.stock_quantity <= 0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  const lowStockVariants = getLowStockVariants();
  const outOfStockVariants = getOutOfStockVariants();

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {outOfStockVariants.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">
            🚨 Out of Stock ({outOfStockVariants.length})
          </h3>
          <ul className="space-y-1">
            {outOfStockVariants.map(v => (
              <li key={v.id} className="text-sm text-red-800">
                <button
                  onClick={() => handleVariantSelect(v)}
                  className="hover:underline"
                >
                  {v.product.name} - {v.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lowStockVariants.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Low Stock ({lowStockVariants.length})
          </h3>
          <ul className="space-y-1">
            {lowStockVariants.map(v => (
              <li key={v.id} className="text-sm text-yellow-800">
                <button
                  onClick={() => handleVariantSelect(v)}
                  className="hover:underline"
                >
                  {v.product.name} - {v.label}: {v.stock_quantity} units left
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Variant List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Product Variants</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {variants.map(variant => (
            <button
              key={variant.id}
              onClick={() => handleVariantSelect(variant)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                selectedVariant?.id === variant.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {variant.product.name} - {variant.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {variant.track_inventory ? (
                      <span>
                        Stock: {variant.stock_quantity ?? 'Unlimited'} units
                        {variant.stock_quantity !== null &&
                          variant.stock_quantity <= variant.low_stock_threshold && (
                            <span className="ml-2 text-yellow-600 font-medium">
                              Low Stock
                            </span>
                          )}
                      </span>
                    ) : (
                      <span className="text-gray-400">Inventory tracking disabled</span>
                    )}
                  </div>
                </div>
                {selectedVariant?.id === variant.id && (
                  <div className="text-blue-600">Selected →</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Variant Management Panel */}
      {selectedVariant && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedVariant.product.name} - {selectedVariant.label}
            </h2>
            <p className="text-sm text-gray-500">Stripe Price ID: {selectedVariant.stripe_price_id}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Inventory Tracking Toggle */}
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={handleToggleInventoryTracking}
                disabled={processing}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable inventory tracking
              </span>
            </label>
          </div>

          {trackInventory && (
            <>
              {/* Current Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock
                </label>
                <div className="text-3xl font-bold text-gray-900">
                  {selectedVariant.stock_quantity ?? 'Unlimited'} units
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="threshold"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(e.target.value)}
                    min="1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                  <button
                    onClick={handleUpdateThreshold}
                    disabled={processing}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Restock */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Restock Inventory</h3>

                <div>
                  <label htmlFor="restock-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Add
                  </label>
                  <input
                    type="number"
                    id="restock-amount"
                    value={restockAmount}
                    onChange={e => setRestockAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                </div>

                <div>
                  <label htmlFor="restock-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="restock-notes"
                    value={restockNotes}
                    onChange={e => setRestockNotes(e.target.value)}
                    placeholder="e.g., Received shipment from supplier X"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                </div>

                <button
                  onClick={handleRestock}
                  disabled={processing || !restockAmount}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Add to Inventory'}
                </button>
              </div>

              {/* Transaction History */}
              {transactions.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Transactions</h3>
                  <div className="space-y-2">
                    {transactions.map(tx => (
                      <div
                        key={tx.id}
                        className="p-3 bg-gray-50 rounded-md text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{tx.type}</span>
                          <span
                            className={`font-semibold ${
                              tx.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {tx.quantity_change > 0 ? '+' : ''}
                            {tx.quantity_change}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {tx.previous_quantity ?? '∞'} → {tx.new_quantity ?? '∞'} units
                        </div>
                        {tx.notes && (
                          <div className="text-gray-500 mt-1">{tx.notes}</div>
                        )}
                        <div className="text-gray-400 text-xs mt-1">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
