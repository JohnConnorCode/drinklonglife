'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Section } from '@/components/Section';
import { FadeIn } from '@/components/animations';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  amount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  fulfillmentStatus: string;
}

function OrderLookupContent() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const prefillOrder = searchParams.get('order') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [orderNumber, setOrderNumber] = useState(prefillOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch('/api/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), orderNumber: orderNumber.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Order not found');
        return;
      }

      setOrder(data.order);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFulfillmentColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-gray-100 to-gray-200 py-16">
      <div className="max-w-2xl mx-auto">
        <FadeIn direction="up">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Order Lookup
            </h1>
            <p className="text-lg text-gray-600">
              Enter your email and order number to view your order details
            </p>
          </div>
        </FadeIn>

        {!order ? (
          <FadeIn direction="up" delay={0.1}>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., A1B2C3D4"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-primary focus:outline-none transition-colors uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Check your confirmation email for your order number
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-accent-primary text-white rounded-full font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Looking up...' : 'Find My Order'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Have an account?{' '}
                  <Link href="/login" className="text-accent-primary font-semibold hover:underline">
                    Sign in to view all orders
                  </Link>
                </p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn direction="up" delay={0.1}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-accent-primary to-accent-green p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-heading text-2xl font-bold mb-1">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-white/80">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(order.amount, order.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    Payment: {order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getFulfillmentColor(order.fulfillmentStatus)}`}>
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price, order.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setOrder(null)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-accent-primary hover:text-accent-primary transition-all"
                >
                  Look Up Another Order
                </button>
                <Link
                  href="/blends"
                  className="flex-1 px-6 py-3 bg-accent-primary text-white rounded-full font-semibold text-center hover:opacity-90 transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        <FadeIn direction="up" delay={0.2}>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help with your order?{' '}
              <a
                href="mailto:support@drinklonglife.com"
                className="text-accent-primary hover:underline font-semibold"
              >
                Contact Support
              </a>
            </p>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

export default function OrderLookupPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-gradient-to-br from-accent-cream via-gray-100 to-gray-200 py-16 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </Section>
    }>
      <OrderLookupContent />
    </Suspense>
  );
}
