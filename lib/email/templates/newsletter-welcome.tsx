import * as React from 'react';

interface NewsletterWelcomeEmailProps {
  email: string;
}

export const NewsletterWelcomeEmail: React.FC<NewsletterWelcomeEmailProps> = () => (
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
        }
        .header {
          text-align: center;
          padding: 30px 0;
          background: linear-gradient(135deg, #FFC837 0%, #85C65D 100%);
          border-radius: 10px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 32px;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #E63946;
          color: white;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </head>
    <body>
      <div className="header">
        <h1>Welcome to Long Life! 🌱</h1>
      </div>

      <div className="content">
        <h2>Thanks for joining our wellness community!</h2>
        <p>Hey there,</p>
        <p>
          We're thrilled to have you on board. You're now part of a community dedicated to
          living longer, healthier lives through cold-pressed, regenerative nutrition.
        </p>
        <p>
          <strong>What to expect:</strong>
        </p>
        <ul>
          <li>Weekly blend drops and exclusive offers</li>
          <li>Health tips and wellness insights</li>
          <li>Farm stories and ingredient spotlights</li>
          <li>Early access to new products</li>
        </ul>
        <p>
          <a href="https://drinklonglife.com/blends" className="button">
            Explore Our Blends
          </a>
        </p>
      </div>

      <div className="footer">
        <p>You're receiving this because you signed up at drinklonglife.com</p>
        <p>
          <a href="{{unsubscribe_url}}">Unsubscribe</a> |
          <a href="https://drinklonglife.com">Visit our website</a>
        </p>
        <p>Long Life · Cold-Pressed Wellness</p>
      </div>
    </body>
  </html>
);

export default NewsletterWelcomeEmail;
