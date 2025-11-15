import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { getOrderById, getStripeSession } from '@/lib/admin/orders';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { formatDateTime } from '@/lib/utils/formatDate';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge';
import { RefundButton } from '@/components/admin/RefundButton';
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater';

export const metadata: Metadata = {
  title: 'Order Details | Admin',
  description: 'View and manage order details',
};

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdmin();

  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  // Get Stripe session details
  const session = await getStripeSession(order.stripe_session_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center gap-1"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Orders
          </Link>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Order Details
          </h1>
          <p className="text-gray-600 mt-1">
            Order ID: {order.id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Order ID</div>
                <div className="text-sm text-gray-900 font-mono break-all">{order.id}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Created At</div>
                <div className="text-sm text-gray-900">{formatDateTime(order.created_at)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Updated At</div>
                <div className="text-sm text-gray-900">{formatDateTime(order.updated_at)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Stripe Session ID</div>
                <div className="text-sm text-gray-900 font-mono break-all">
                  {order.stripe_session_id}
                </div>
              </div>

              {order.user_id && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">User ID</div>
                  <div className="text-sm text-gray-900 font-mono">{order.user_id}</div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                <div className="text-sm text-gray-900">
                  {order.customer_email || session?.customer_email || 'N/A'}
                </div>
              </div>

              {session?.customer_details && (
                <>
                  {session.customer_details.name && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Name</div>
                      <div className="text-sm text-gray-900">{session.customer_details.name}</div>
                    </div>
                  )}

                  {session.customer_details.phone && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Phone</div>
                      <div className="text-sm text-gray-900">{session.customer_details.phone}</div>
                    </div>
                  )}
                </>
              )}

              {(session as any)?.shipping_details?.address && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Shipping Address</div>
                  <div className="text-sm text-gray-900">
                    {(session as any).shipping_details.address.line1}
                    {(session as any).shipping_details.address.line2 && (
                      <>, {(session as any).shipping_details.address.line2}</>
                    )}
                    <br />
                    {(session as any).shipping_details.address.city}, {(session as any).shipping_details.address.state} {(session as any).shipping_details.address.postal_code}
                    <br />
                    {(session as any).shipping_details.address.country}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          {session?.line_items && session.line_items.data.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>

              <div className="space-y-3">
                {session.line_items.data.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {item.description}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.amount_total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.price?.unit_amount || 0)} each
                      </div>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="pt-4 border-t-2 border-gray-200 space-y-2">
                  {session.total_details?.amount_discount && session.total_details.amount_discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(session.total_details.amount_discount)}
                      </span>
                    </div>
                  )}

                  {session.total_details?.amount_shipping && session.total_details.amount_shipping > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        {formatCurrency(session.total_details.amount_shipping)}
                      </span>
                    </div>
                  )}

                  {session.total_details?.amount_tax && session.total_details.amount_tax > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">
                        {formatCurrency(session.total_details.amount_tax)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      {formatCurrency(order.amount_total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {session?.payment_intent && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Payment Intent ID</div>
                  <div className="text-sm text-gray-900 font-mono break-all">
                    {typeof session.payment_intent === 'string'
                      ? session.payment_intent
                      : session.payment_intent.id}
                  </div>
                </div>

                {typeof session.payment_intent !== 'string' && (session.payment_intent as any).charges?.data[0] && (
                  <>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Payment Method</div>
                      <div className="text-sm text-gray-900 capitalize">
                        {(session.payment_intent as any).charges.data[0].payment_method_details?.type || 'N/A'}
                      </div>
                    </div>

                    {(session.payment_intent as any).charges.data[0].payment_method_details?.card && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Card Brand</div>
                          <div className="text-sm text-gray-900 capitalize">
                            {(session.payment_intent as any).charges.data[0].payment_method_details.card.brand}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-1">Last 4 Digits</div>
                          <div className="text-sm text-gray-900">
                            •••• {(session.payment_intent as any).charges.data[0].payment_method_details.card.last4}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Payment Mode</div>
                  <div className="text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.livemode
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {session.livemode ? 'Production' : 'Test'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {order.metadata && Object.keys(order.metadata).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>

              <div className="space-y-2">
                {Object.entries(order.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-500 min-w-[120px]">
                      {key}:
                    </span>
                    <span className="text-sm text-gray-900 break-all">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Status</h2>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>

          {/* Refund Management */}
          {order.payment_status === 'succeeded' && order.status !== 'refunded' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Refund</h2>
              <RefundButton
                orderId={order.id}
                orderAmount={order.amount_total}
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Status</span>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(order.amount_total)}
                </span>
              </div>

              {session?.line_items?.data && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm font-medium text-gray-900">
                    {session.line_items.data.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* External Links */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">External Links</h2>

            <div className="space-y-2">
              <a
                href={`https://dashboard.stripe.com/${session?.livemode ? '' : 'test/'}payments/${
                  typeof session?.payment_intent === 'string'
                    ? session.payment_intent
                    : session?.payment_intent?.id
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View in Stripe Dashboard
              </a>

              {order.customer_email && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.customer_email!);
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Customer Email
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
