'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
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
}

export function Header({ siteSettings, navigation }: HeaderProps) {
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
    { name: 'Red Bomb', slug: 'red-bomb', color: '#ef4444' },
    { name: 'Green Bomb', slug: 'green-bomb', color: '#22c55e' },
    { name: 'Yellow Bomb', slug: 'yellow-bomb', color: '#eab308' },
    { name: 'Blue Bomb', slug: 'blue-bomb', color: '#3b82f6' },
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-2">
          {/* Logo - Full animated logo on all screen sizes */}
          <Link href="/" className="flex-shrink-0 relative z-50">
            <AnimatedLogo
              size="md"
              variant="header"
              logoUrl={siteSettings?.logo?.asset?.url}
              showText={true}
            />
          </Link>

          {/* Desktop Navigation - Progressive gap reduction */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8">
            {/* Blends Dropdown - First */}
            <div
              className="relative"
              onMouseEnter={() => setBlendsMenuOpen(true)}
              onMouseLeave={() => setBlendsMenuOpen(false)}
            >
              <Link
                href="/blends"
                className={clsx(
                  'group text-xs lg:text-sm font-heading font-medium transition-colors relative flex items-center gap-0.5 lg:gap-1 whitespace-nowrap',
                  pathname.startsWith('/blends') ? 'text-accent-primary' : 'text-gray-700 hover:text-black'
                )}
              >
                Blends
                <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-accent-primary transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: blend.color }}
                      />
                      {blend.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other Navigation Links (filter out Blends and Ingredients) */}
            {headerLinks
              .filter((link: any) => !['blends', 'ingredients'].includes(link.title?.toLowerCase()))
              .map((link: any, index: number) => {
                const href = link.externalUrl || (link.reference?.slug?.current ? `/${link.reference.slug.current}` : '#');
                const isActive = pathname === href || pathname.startsWith(href + '/');

                return (
                  <Link
                    key={link.title || index}
                    href={href}
                    target={link.newTab ? '_blank' : undefined}
                    rel={link.newTab ? 'noopener noreferrer' : undefined}
                    className={clsx(
                      'group text-xs lg:text-sm font-heading font-medium transition-colors relative whitespace-nowrap',
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

            {/* About Link */}
            <Link
              href="/about"
              className={clsx(
                'group text-xs lg:text-sm font-heading font-medium transition-colors relative whitespace-nowrap',
                pathname === '/about' ? 'text-accent-primary' : 'text-gray-700 hover:text-black'
              )}
            >
              About
              <span
                className={clsx(
                  'absolute -bottom-1 left-0 h-0.5 bg-accent-primary transition-all duration-300',
                  pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'
                )}
              />
            </Link>

            {/* Ambassadors Link */}
            <Link
              href="/referral"
              className={clsx(
                'group text-xs lg:text-sm font-heading font-medium transition-colors relative whitespace-nowrap',
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
          </nav>

          {/* Desktop Auth & CTA - Progressive gap reduction */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
            {/* Cart Button - Only show if cart has items */}
            {cartItemCount > 0 && (
              <Link
                href="/cart"
                className="relative p-1.5 lg:p-2 text-gray-700 hover:text-black transition-colors"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                <span className="absolute bg-accent-primary text-white text-[10px] lg:text-xs font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center" style={{ top: '0.75rem', right: '-0.25rem' }}>
                  {cartItemCount}
                </span>
              </Link>
            )}

            {!user ? (
              // Not logged in - show Login and Sign Up buttons
              <>
                <Link
                  href="/login"
                  className="px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold text-gray-900 hover:text-accent-primary transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
                <RippleEffect
                  className="inline-flex rounded-full"
                  color="rgba(255, 255, 255, 0.4)"
                >
                  <Link
                    href="/signup"
                    className="px-4 lg:px-6 py-1.5 lg:py-2 rounded-full bg-accent-primary text-white text-xs lg:text-sm font-medium hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg block whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </RippleEffect>
              </>
            ) : (
              // Logged in - show user menu
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-gray-50"
                >
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                    <span className="text-accent-primary font-semibold text-xs lg:text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                  <svg
                    className={clsx('w-3 h-3 lg:w-4 lg:h-4 transition-transform', userMenuOpen && 'rotate-180')}
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
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative z-50 p-2 -mr-1 touch-manipulation"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
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
          <nav className="md:hidden fixed top-14 lg:top-16 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
            <StaggerContainer staggerDelay={0.08} className="px-4 py-5 space-y-1">
              {/* Blends Section */}
              <div className="mb-4">
                <Link
                  href="/blends"
                  className={clsx(
                    'block px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-300',
                    pathname === '/blends'
                      ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                      : 'text-gray-900 hover:bg-gray-50'
                  )}
                >
                  Shop Blends
                </Link>
                <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                  {blends.map((blend) => (
                    <Link
                      key={blend.slug}
                      href={`/blends/${blend.slug}`}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 border',
                        pathname === `/blends/${blend.slug}`
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: blend.color }}
                      />
                      <span className="text-gray-700">{blend.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100 my-3" />

              {/* Other Navigation Links */}
              {headerLinks
                .filter((link: any) => !['blends', 'ingredients'].includes(link.title?.toLowerCase()))
                .map((link: any, index: number) => {
                  const href = link.externalUrl || (link.reference?.slug?.current ? `/${link.reference.slug.current}` : '#');
                  const isActive = pathname === href || pathname.startsWith(href + '/');

                  return (
                    <Link
                      key={link.title || index}
                      href={href}
                      target={link.newTab ? '_blank' : undefined}
                      rel={link.newTab ? 'noopener noreferrer' : undefined}
                      className={clsx(
                        'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {link.title}
                    </Link>
                  );
                })}

              {/* About Link */}
              <Link
                href="/about"
                className={clsx(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                  pathname === '/about'
                    ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                About
              </Link>

              {/* Ambassadors Link */}
              <Link
                href="/referral"
                className={clsx(
                  'block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                  pathname === '/referral'
                    ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                Ambassadors
              </Link>

              {/* Mobile Cart Link */}
              {cartItemCount > 0 && (
                <Link
                  href="/cart"
                  className={clsx(
                    'flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-all duration-300',
                    pathname === '/cart'
                      ? 'bg-gradient-to-r from-accent-yellow/20 to-accent-green/20 text-accent-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </span>
                  <span className="bg-accent-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
