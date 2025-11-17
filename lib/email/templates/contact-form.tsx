import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

export const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
  name,
  email,
  message,
  timestamp,
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
        }
        .header {
          padding: 20px;
          background: #f9f9f9;
          border-left: 4px solid #E63946;
          margin-bottom: 20px;
        }
        .field {
          margin: 15px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 5px;
        }
        .field label {
          display: block;
          font-weight: 600;
          color: #666;
          margin-bottom: 5px;
          font-size: 12px;
          text-transform: uppercase;
        }
        .field-value {
          color: #333;
          font-size: 14px;
        }
        .message-box {
          background: white;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 5px;
          white-space: pre-wrap;
          font-family: inherit;
        }
      `}</style>
    </head>
    <body>
      <div className="header">
        <h2 style={{ margin: 0 }}>New Contact Form Submission</h2>
      </div>

      <div className="field">
        <label>From</label>
        <div className="field-value">{name}</div>
      </div>

      <div className="field">
        <label>Email</label>
        <div className="field-value">
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </div>

      <div className="field">
        <label>Submitted</label>
        <div className="field-value">
          {new Date(timestamp).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short'
          })}
        </div>
      </div>

      <div className="field">
        <label>Message</label>
        <div className="message-box">{message}</div>
      </div>
    </body>
  </html>
);

export default ContactFormEmail;
