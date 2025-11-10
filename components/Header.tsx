'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { urlFor } from '@/lib/image';

interface HeaderProps {
  siteSettings?: any;
  navigation?: any;
  ctaLabel?: string;
}

export function Header({ siteSettings, navigation, ctaLabel }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerLinks = navigation?.headerLinks || [];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 relative z-50">
            {siteSettings?.logo ? (
              <div className="relative w-8 h-8">
                <Image
                  src={urlFor(siteSettings.logo).url()}
                  alt={siteSettings.title || 'Long Life'}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-xl font-heading font-bold">
                {siteSettings?.title || 'Long Life'}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {headerLinks.map((link: any) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.text}
                  href={link.href || '#'}
                  className={clsx(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-accent-primary' : 'text-gray-700 hover:text-black'
                  )}
                >
                  {link.text}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Button */}
          <Link
            href="/blends"
            className="hidden md:inline-flex px-6 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {ctaLabel || 'Shop Blends'}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative z-50 p-2 -mr-2"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={clsx(
                  'w-full h-0.5 bg-black transition-all',
                  mobileMenuOpen && 'rotate-45 translate-y-2'
                )}
              />
              <span
                className={clsx(
                  'w-full h-0.5 bg-black transition-opacity',
                  mobileMenuOpen && 'opacity-0'
                )}
              />
              <span
                className={clsx(
                  'w-full h-0.5 bg-black transition-all',
                  mobileMenuOpen && '-rotate-45 -translate-y-2'
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel */}
          <nav className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
            <div className="px-4 py-6 space-y-1">
              {headerLinks.map((link: any) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                return (
                  <Link
                    key={link.text}
                    href={link.href || '#'}
                    className={clsx(
                      'block px-4 py-3 text-lg font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-100 text-black'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {link.text}
                  </Link>
                );
              })}

              {/* Mobile CTA */}
              <Link
                href="/blends"
                className="block mt-6 px-6 py-3 text-center rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors"
              >
                {ctaLabel || 'Shop Blends'}
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
