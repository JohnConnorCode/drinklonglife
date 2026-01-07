'use client';

import { useState, FormEvent } from 'react';

interface NewsletterFormProps {
  listId?: string;
  className?: string;
}

const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID || 'WCHubr';
const DEFAULT_LIST_ID = 'VFxqc9'; // Main newsletter list
const API_ENDPOINT = `https://a.klaviyo.com/client/subscriptions/?company_id=${COMPANY_ID}`;

export function NewsletterForm({ listId = DEFAULT_LIST_ID, className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const payload: any = {
        data: {
          type: 'subscription',
          attributes: {
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: email,
                },
              },
            },
          },
        },
      };

      // Add list relationship if listId provided
      if (listId) {
        payload.data.relationships = {
          list: {
            data: {
              type: 'list',
              id: listId,
            },
          },
        };
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'revision': '2024-10-15',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 202) {
        setStatus('success');
        setMessage('Thanks for subscribing!');
        setEmail('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Klaviyo API error:', errorData);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading'}
            className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary bg-white shadow-md text-base sm:text-lg disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-accent-primary text-white rounded-xl font-bold hover:bg-accent-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'loading' ? 'Entering...' : 'Enter Long Life Mode'}
          </button>
        </div>

        {message && (
          <p className={`text-sm font-medium ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
