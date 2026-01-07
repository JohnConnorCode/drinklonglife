import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  currency: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerEmail,
  customerName,
  items,
  subtotal,
  total,
  currency,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #22c55e;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
          }
          .content {
            padding: 30px 0;
          }
          .order-number {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th {
            background: #f9fafb;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #e5e7eb;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals {
            text-align: right;
            margin: 20px 0;
          }
          .totals-row {
            display: flex;
            justify-content: flex-end;
            padding: 8px 0;
          }
          .totals-label {
            margin-right: 20px;
            color: #6b7280;
          }
          .totals-value {
            font-weight: 600;
            min-width: 100px;
          }
          .total-row {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #e5e7eb;
            padding-top: 12px;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="logo">🥤 Long Life</div>
          <p>Cold-Pressed Wellness Delivered</p>
        </div>

        <div className="content">
          <h1>Thank You for Your Order!</h1>
          <p>Hi {customerName || customerEmail},</p>
          <p>
            We're excited to confirm your order. Your fresh cold-pressed juice is being prepared
            with care and will be on its way to you soon.
          </p>

          <div className="order-number">
            <strong>Order Number:</strong> {orderNumber}
          </div>

          <h2>Order Summary</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="totals-row">
              <span className="totals-label">Subtotal:</span>
              <span className="totals-value">{formatCurrency(subtotal)}</span>
            </div>
            <div className="totals-row total-row">
              <span className="totals-label">Total:</span>
              <span className="totals-value">{formatCurrency(total)}</span>
            </div>
          </div>

          <p>
            <strong>What's Next?</strong>
          </p>
          <ul>
            <li>We'll send you a shipping confirmation with tracking information</li>
            <li>Your order typically arrives within 3-5 business days</li>
            <li>Keep your juice refrigerated upon arrival</li>
          </ul>

          <div style={{ textAlign: 'center' }}>
            <a href="https://drinklonglife.com/account" className="button">
              View Order Status
            </a>
          </div>
        </div>

        <div className="footer">
          <p>Questions? Contact us at support@drinklonglife.com</p>
          <p>© {new Date().getFullYear()} Long Life. All rights reserved.</p>
        </div>
      </body>
    </html>
  );
};

interface SubscriptionConfirmationEmailProps {
  customerEmail: string;
  customerName?: string;
  planName: string;
  planPrice: number;
  billingInterval: string;
  nextBillingDate: string;
  currency: string;
}

export const SubscriptionConfirmationEmail: React.FC<SubscriptionConfirmationEmailProps> = ({
  customerEmail,
  customerName,
  planName,
  planPrice,
  billingInterval,
  nextBillingDate,
  currency,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #22c55e;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #22c55e;
          }
          .content {
            padding: 30px 0;
          }
          .plan-card {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .benefits {
            background: #ecfdf5;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #22c55e;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #22c55e;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <div className="logo">🥤 Long Life</div>
          <p>Cold-Pressed Wellness Delivered</p>
        </div>

        <div className="content">
          <h1>Welcome to Your Subscription!</h1>
          <p>Hi {customerName || customerEmail},</p>
          <p>
            Thank you for subscribing to Long Life! You've just taken an important step
            toward consistent wellness and vitality.
          </p>

          <div className="plan-card">
            <h2>{planName}</h2>
            <p><strong>{formatCurrency(planPrice)}</strong> per {billingInterval}</p>
            <p><strong>Next Billing Date:</strong> {nextBillingDate}</p>
          </div>

          <div className="benefits">
            <h3>Your Subscription Benefits:</h3>
            <ul>
              <li>✅ Free delivery every {billingInterval}</li>
              <li>✅ Save 15% vs one-time purchases</li>
              <li>✅ Cancel or pause anytime</li>
              <li>✅ Flexibility to adjust your plan</li>
            </ul>
          </div>

          <p>
            <strong>What Happens Next?</strong>
          </p>
          <ul>
            <li>Your first delivery will ship within 2-3 business days</li>
            <li>You'll receive a tracking number once it ships</li>
            <li>Future deliveries will arrive automatically each {billingInterval}</li>
            <li>Manage your subscription anytime from your account</li>
          </ul>

          <div style={{ textAlign: 'center' }}>
            <a href="https://drinklonglife.com/account" className="button">
              Manage Subscription
            </a>
          </div>
        </div>

        <div className="footer">
          <p>Questions? Contact us at support@drinklonglife.com</p>
          <p>© {new Date().getFullYear()} Long Life. All rights reserved.</p>
        </div>
      </body>
    </html>
  );
};
