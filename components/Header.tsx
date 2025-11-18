'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';
import { StaggerContainer } from './animations';
import { RippleEffect } from './RippleEffect';
import { createClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingCart } from 'lucide-react';
import { SignOutButton } from './auth/SignOutButton';

interface HeaderProps {
  siteSettings?: any;
  navigation?: any;
  ctaLabel?: string;
}

export function Header({ siteSettings, navigation, ctaLabel }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [blendsMenuOpen, setBlendsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const headerLinks = navigation?.primaryLinks || [];
  const cartItemCount = useCartStore((state) => state.getItemCount());

  const blends = [
    { name: 'Green Bomb', slug: 'green-bomb' },
    { name: 'Red Bomb', slug: 'red-bomb' },
    { name: 'Yellow Bomb', slug: 'yellow-bomb' },
  ];

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

  // Check authentication state
  useEffect(() => {
    const supabase = createClient();

    // Get initial session and check admin status
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);

      // Check if user is admin
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.is_admin === true);
      } else {
        setIsAdmin(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      // Check if user is admin
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.is_admin === true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
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
                <motion.div
                  key={link.title || index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.0 + index * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  <Link
                    href={href}
                    target={link.newTab ? '_blank' : undefined}
                    rel={link.newTab ? 'noopener noreferrer' : undefined}
                    className={clsx(
                      'group text-sm font-heading font-medium transition-colors relative',
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
                </motion.div>
              );
            })}

            {/* Blends Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 1.0 + headerLinks.length * 0.1,
                ease: 'easeOut',
              }}
              className="relative"
              onMouseEnter={() => setBlendsMenuOpen(true)}
              onMouseLeave={() => setBlendsMenuOpen(false)}
            >
              <Link
                href="/blends"
                className={clsx(
                  'group text-sm font-heading font-medium transition-colors relative flex items-center gap-1',
                  pathname.startsWith('/blends') ? 'text-accent-primary' : 'text-gray-700 hover:text-black'
                )}
              >
                Blends
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span
                  className={clsx(
                    'absolute -bottom-1 left-0 h-0.5 bg-accent-primary transition-all duration-300',
                    pathname.startsWith('/blends') ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>

              {/* Dropdown Menu */}
              {blendsMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/blends"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent-primary transition-colors font-medium"
                  >
                    All Blends
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  {blends.map((blend) => (
                    <Link
                      key={blend.slug}
                      href={`/blends/${blend.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent-primary transition-colors"
                    >
                      {blend.name}
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Ambassadors Link (hardcoded) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 1.0 + (headerLinks.length + 1) * 0.1,
                ease: 'easeOut',
              }}
            >
              <Link
                href="/referral"
                className={clsx(
                  'group text-sm font-heading font-medium transition-colors relative',
                  pathname === '/referral' ? 'text-accent-primary' : 'text-gray-700 hover:text-black'
                )}
              >
                Ambassadors
                <span
                  className={clsx(
                    'absolute -bottom-1 left-0 h-0.5 bg-accent-primary transition-all duration-300',
                    pathname === '/referral' ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            </motion.div>
          </nav>

          {/* Desktop Auth & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Button - Only show if cart has items */}
            {cartItemCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 1.0 + headerLinks.length * 0.1,
                  ease: 'easeOut',
                }}
              >
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 hover:text-black transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute bg-accent-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ top: '1rem', right: '-0.25rem' }}>
                    {cartItemCount}
                  </span>
                </Link>
              </motion.div>
            )}

            {!user ? (
              // Not logged in - show Login and Sign Up buttons
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.0 + headerLinks.length * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-900 hover:text-accent-primary transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.0 + headerLinks.length * 0.1 + 0.05,
                    ease: 'easeOut',
                  }}
                >
                  <RippleEffect
                    className="inline-flex rounded-full"
                    color="rgba(255, 255, 255, 0.4)"
                  >
                    <Link
                      href="/signup"
                      className="px-6 py-2 rounded-full bg-accent-primary text-white text-sm font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg block"
                    >
                      Sign Up
                    </Link>
                  </RippleEffect>
                </motion.div>
              </>
            ) : (
              // Logged in - show user menu
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 1.0 + headerLinks.length * 0.1,
                  ease: 'easeOut',
                }}
                className="relative"
              >
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                    <span className="text-accent-primary font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                  <svg
                    className={clsx('w-4 h-4 transition-transform', userMenuOpen && 'rotate-180')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        My Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                        >
                          Admin
                        </Link>
                      )}
                      <SignOutButton className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        Sign Out
                      </SignOutButton>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>

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

              {/* Ambassadors Link (hardcoded) */}
              <Link
                href="/referral"
                className={clsx(
                  'block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-300',
                  pathname === '/referral'
                    ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                )}
              >
                Ambassadors
              </Link>

              {/* Mobile Cart Link - Only show if cart has items */}
              {cartItemCount > 0 && (
                <Link
                  href="/cart"
                  className={clsx(
                    'flex items-center justify-between px-4 py-3 text-lg font-medium rounded-lg transition-all duration-300',
                    pathname === '/cart'
                      ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                      : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </span>
                  <span className="bg-accent-primary text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </Link>
              )}

              {/* Mobile Auth */}
              {!user ? (
                <div className="mt-6 space-y-3">
                  <Link
                    href="/login"
                    className="block px-6 py-3 text-center rounded-full border-2 border-accent-primary text-accent-primary font-medium hover:bg-accent-primary/5 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <RippleEffect
                    className="block rounded-full"
                    color="rgba(255, 255, 255, 0.4)"
                  >
                    <Link
                      href="/signup"
                      className="block px-6 py-3 text-center rounded-full bg-accent-primary text-white font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </RippleEffect>
                </div>
              ) : (
                <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    className="block px-6 py-3 text-center rounded-full border-2 border-accent-primary text-accent-primary font-medium hover:bg-accent-primary/5 transition-all duration-300"
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-6 py-3 text-center rounded-full border-2 border-accent-primary text-accent-primary font-medium hover:bg-accent-primary/5 transition-all duration-300"
                    >
                      Admin
                    </Link>
                  )}
                  <SignOutButton className="w-full block px-6 py-3 text-center rounded-full border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300">
                    Sign Out
                  </SignOutButton>
                </div>
              )}
            </StaggerContainer>
          </nav>
        </>
      )}
    </header>
  );
}
