'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';

const navLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/subscriptions', label: 'Subscriptions' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/ingredients', label: 'Ingredients' },
  { href: '/admin/referrals', label: 'Referrals' },
  { href: '/admin/discounts', label: 'Discounts' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/wholesale', label: 'Wholesale' },
  { href: '/admin/email-templates', label: 'Email Templates' },
  { href: '/admin/stripe-mode', label: '⚙️ Stripe Mode', divider: true },
];

export function AdminNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation - hidden on mobile */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors ${
              link.divider ? 'border-l border-white/20 ml-1 pl-3' : ''
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button - visible only on mobile */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Dropdown - visible only when open */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-accent-primary border-b-4 border-accent-yellow shadow-lg z-50">
          <nav className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors ${
                  link.divider ? 'border-t border-white/20 mt-2 pt-3' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/20 mt-2 pt-2 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
              >
                ← Back to Store
              </Link>
              <div className="px-3 py-2">
                <SignOutButton className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-md transition-colors border border-white/20" />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
