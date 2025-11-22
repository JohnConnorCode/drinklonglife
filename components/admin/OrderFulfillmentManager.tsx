'use client';

/**
 * OrderFulfillmentManager Component
 *
 * Admin interface for managing order fulfillment status
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { logger } from '@/lib/logger';

interface Order {
  id: string;
  customer_email: string;
  amount_total: number;
  amount_subtotal: number | null;
  currency: string;
  fulfillment_status: string;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  admin_notes: string | null;
}

interface StatusHistory {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by_email: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-red-100 text-red-800' },
];

const CARRIERS = [
  'USPS',
  'UPS',
  'FedEx',
  'DHL',
  'Other',
];

export function OrderFulfillmentManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [notes, setNotes] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('fulfillment_status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      logger.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatusHistory = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
    } catch (err: any) {
      logger.error('Error loading status history:', err);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.fulfillment_status);
    setTrackingNumber(order.tracking_number || '');
    setTrackingUrl(order.tracking_url || '');
    setCarrier(order.carrier || '');
    setNotes('');
    setError(null);
    setSuccess(null);
    loadStatusHistory(order.id);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    if (!newStatus) {
      setError('Please select a status');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Call update_order_fulfillment_status RPC function
      const { error } = await supabase.rpc('update_order_fulfillment_status', {
        p_order_id: selectedOrder.id,
        p_new_status: newStatus,
        p_notes: notes || null,
        p_tracking_number: trackingNumber || null,
        p_tracking_url: trackingUrl || null,
        p_carrier: carrier || null,
      });

      if (error) throw error;

      setSuccess(`Order status updated to ${newStatus}`);
      loadOrders();
      loadStatusHistory(selectedOrder.id);

      // Update selected order
      const updatedOrder = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder({
          ...updatedOrder,
          fulfillment_status: newStatus,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier: carrier || null,
        });
      }

      setNotes('');
    } catch (err: any) {
      logger.error('Error updating order status:', err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status;
  };

  const formatAddress = (order: Order) => {
    const parts = [
      order.shipping_address_line1,
      order.shipping_address_line2,
      order.shipping_city,
      order.shipping_state,
      order.shipping_postal_code,
      order.shipping_country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'No shipping address';
  };

  const getPendingOrdersCount = () => {
    return orders.filter(o => o.fulfillment_status === 'pending' || o.fulfillment_status === 'processing').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Orders ({orders.length})</h2>
          {getPendingOrdersCount() > 0 && (
            <p className="text-sm text-orange-600">
              {getPendingOrdersCount()} orders pending fulfillment
            </p>
          )}
        </div>

        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">Order List</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No orders found
              </div>
            ) : (
              orders.map(order => (
                <button
                  key={order.id}
                  onClick={() => handleOrderSelect(order)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {order.customer_email}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.fulfillment_status)}`}>
                      {getStatusLabel(order.fulfillment_status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(order.amount_total)} • {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  {order.tracking_number && (
                    <div className="text-xs text-gray-500 mt-1">
                      Tracking: {order.tracking_number}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Order Details & Management */}
        {selectedOrder ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Customer:</span>
                  <div className="text-gray-900">{selectedOrder.customer_email}</div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Amount:</span>
                  <div className="text-gray-900">
                    {formatCurrency(selectedOrder.amount_total)} {selectedOrder.currency.toUpperCase()}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Order Date:</span>
                  <div className="text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Shipping Address:</span>
                  <div className="text-gray-900">
                    {selectedOrder.shipping_name && <div>{selectedOrder.shipping_name}</div>}
                    <div>{formatAddress(selectedOrder)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h4 className="font-medium text-gray-900">Update Fulfillment Status</h4>

              <div>
                <label htmlFor="new-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="new-status"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={processing}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <>
                  <div>
                    <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1">
                      Carrier
                    </label>
                    <select
                      id="carrier"
                      value={carrier}
                      onChange={e => setCarrier(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={processing}
                    >
                      <option value="">Select carrier</option>
                      {CARRIERS.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      id="tracking-number"
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="e.g., 1Z999AA10123456784"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label htmlFor="tracking-url" className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking URL (optional)
                    </label>
                    <input
                      type="url"
                      id="tracking-url"
                      value={trackingUrl}
                      onChange={e => setTrackingUrl(e.target.value)}
                      placeholder="https://www.ups.com/track?..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={processing}
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={processing}
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={processing || !newStatus}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            {/* Status History */}
            {statusHistory.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Status History</h4>
                <div className="space-y-2">
                  {statusHistory.map(history => (
                    <div key={history.id} className="p-3 bg-gray-50 rounded-md text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {history.from_status ? `${getStatusLabel(history.from_status)} → ` : ''}
                          {getStatusLabel(history.to_status)}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(history.created_at).toLocaleString()}
                        </span>
                      </div>
                      {history.notes && (
                        <div className="text-gray-600">{history.notes}</div>
                      )}
                      {history.changed_by_email && (
                        <div className="text-gray-400 text-xs mt-1">
                          By: {history.changed_by_email}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center">
            <p className="text-gray-500">Select an order to manage fulfillment</p>
          </div>
        )}
      </div>
    </div>
  );
}
