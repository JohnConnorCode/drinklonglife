import * as React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  orderDate: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  customerName,
  items,
  subtotal,
  shipping,
  tax,
  total,
  orderDate,
}) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
        }
        .header {
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #FFC837 0%, #85C65D 100%);
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
        }
        .check-mark {
          font-size: 60px;
          margin-bottom: 10px;
        }
        .content {
          padding: 30px;
        }
        .order-info {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .order-info p {
          margin: 5px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          text-align: left;
          padding: 12px;
          background: #f9f9f9;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .totals {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
        }
        .total-row {
          font-weight: bold;
          font-size: 18px;
          padding-top: 10px;
          margin-top: 10px;
          border-top: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #E63946;
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #eee;
        }
      `}</style>
    </head>
    <body>
      <div className="container">
        <div className="header">
          <div className="check-mark">✓</div>
          <h1>Order Confirmed!</h1>
        </div>

        <div className="content">
          <p>Hi {customerName},</p>
          <p>
            Thank you for your order! We're excited to get your fresh, cold-pressed wellness
            blends to you.
          </p>

          <div className="order-info">
            <p><strong>Order Number:</strong> #{orderId}</p>
            <p><strong>Order Date:</strong> {new Date(orderDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>

          <h2>Order Details</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>${(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Shipping:</span>
              <span>${(shipping / 100).toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Tax:</span>
              <span>${(tax / 100).toFixed(2)}</span>
            </div>
            <div className="totals-row total-row">
              <span>Total:</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
          </div>

          <p style={{ marginTop: '30px' }}>
            <strong>What's Next?</strong>
          </p>
          <ul>
            <li>You'll receive a shipping notification when your order is on its way</li>
            <li>Expected delivery: 2-3 business days</li>
            <li>Keep refrigerated upon arrival for maximum freshness</li>
          </ul>

          <div style={{ textAlign: 'center' }}>
            <a href="https://drinklonglife.com/account" className="button">
              View Order Status
            </a>
          </div>
        </div>

        <div className="footer">
          <p>Questions? Contact us at support@drinklonglife.com</p>
          <p>Long Life · Cold-Pressed Wellness</p>
        </div>
      </div>
    </body>
  </html>
);

export default OrderConfirmationEmail;
