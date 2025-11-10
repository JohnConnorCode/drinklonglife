'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { AnimatedLogo } from './AnimatedLogo';
import { StaggerContainer } from './animations';
import { RippleEffect } from './RippleEffect';

interface HeaderProps {
  siteSettings?: any;
  navigation?: any;
  ctaLabel?: string;
}

export function Header({ siteSettings, navigation, ctaLabel }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerLinks = navigation?.primaryLinks || [];

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

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-white border-b border-gray-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 relative z-50">
            <AnimatedLogo
              size="md"
              variant="header"
              logoUrl={siteSettings?.logo?.asset?.url}
              showText={true}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {headerLinks.map((link: any, index: number) => {
              const href = link.externalUrl || (link.reference?.slug?.current ? `/${link.reference.slug.current}` : '#');
              const isActive = pathname === href || pathname.startsWith(href + '/');

              return (
                <Link
                  key={link.title || index}
                  href={href}
                  target={link.newTab ? '_blank' : undefined}
                  rel={link.newTab ? 'noopener noreferrer' : undefined}
                  className={clsx(
                    'group text-sm font-medium transition-colors relative',
                    isActive ? 'text-accent-primary' : 'text-gray-700 hover:text-black'
                  )}
                >
                  {link.title}
                  <span
                    className={clsx(
                      'absolute -bottom-1 left-0 h-0.5 bg-accent-primary transition-all duration-300',
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Button */}
          <RippleEffect
            className="hidden md:inline-flex rounded-full"
            color="rgba(255, 255, 255, 0.4)"
          >
            <Link
              href="/blends"
              className="px-6 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg block"
            >
              {ctaLabel || 'Shop Blends'}
            </Link>
          </RippleEffect>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative z-50 p-3 -mr-2 touch-manipulation"
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
            <StaggerContainer staggerDelay={0.1} className="px-4 py-6 space-y-1">
              {headerLinks.map((link: any, index: number) => {
                const href = link.externalUrl || (link.reference?.slug?.current ? `/${link.reference.slug.current}` : '#');
                const isActive = pathname === href || pathname.startsWith(href + '/');

                return (
                  <Link
                    key={link.title || index}
                    href={href}
                    target={link.newTab ? '_blank' : undefined}
                    rel={link.newTab ? 'noopener noreferrer' : undefined}
                    className={clsx(
                      'block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                        : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                    )}
                  >
                    {link.title}
                  </Link>
                );
              })}

              {/* Mobile CTA */}
              <RippleEffect
                className="block mt-6 rounded-full"
                color="rgba(255, 255, 255, 0.4)"
              >
                <Link
                  href="/blends"
                  className="block px-6 py-3 text-center rounded-full bg-accent-primary text-white font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {ctaLabel || 'Shop Blends'}
                </Link>
              </RippleEffect>
            </StaggerContainer>
          </nav>
        </>
      )}
    </header>
  );
}
