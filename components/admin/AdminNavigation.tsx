'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  RefreshCw,
  Package,
  Leaf,
  Users,
  Percent,
  UserCircle,
  Mail,
  Building2,
  FileText,
  Store,
  LogOut,
  CreditCard,
  ExternalLink,
  Boxes,
  Truck,
} from 'lucide-react';
import { SignOutButton } from '@/components/auth/SignOutButton';

type NavLink =
  | { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; divider?: never; description?: string }
  | { divider: true; label: string; href?: never; icon?: never; exact?: never; description?: never };

const navLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, description: 'Overview & metrics' },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, description: 'View & manage orders' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: RefreshCw, description: 'Recurring orders' },
  { divider: true, label: 'Operations' },
  { href: '/admin/fulfillment', label: 'Fulfillment', icon: Truck, description: 'Shipping & tracking' },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes, description: 'Stock management' },
  { href: '/admin/products', label: 'Products', icon: Package, description: 'Blends & pricing' },
  { href: '/admin/ingredients', label: 'Ingredients', icon: Leaf, description: 'Ingredient database' },
  { divider: true, label: 'Marketing' },
  { href: '/admin/referrals', label: 'Referrals', icon: Users, description: 'Ambassador program' },
  { href: '/admin/discounts', label: 'Discounts', icon: Percent, description: 'Promo codes' },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, description: 'Email subscribers' },
  { divider: true, label: 'Accounts' },
  { href: '/admin/users', label: 'Customers', icon: UserCircle, description: 'User accounts' },
  { href: '/admin/wholesale', label: 'Wholesale', icon: Building2, description: 'B2B applications' },
  { href: '/admin/email-templates', label: 'Email Templates', icon: FileText, description: 'Transactional emails' },
];

const settingsLinks = [
  { href: '/admin/stripe-mode', label: 'Stripe Settings', icon: CreditCard, description: 'Payment config' },
];

export function AdminNavigation() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="flex flex-col h-full">
      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navLinks.map((link, index) => {
          // Handle section dividers
          if (link.divider) {
            return (
              <div key={`divider-${index}`} className="pt-5 pb-2 first:pt-0">
                <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  {link.label}
                </p>
              </div>
            );
          }

          const Icon = link.icon!;
          const active = isActive(link.href!, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href!}
              title={link.description}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                active
                  ? 'bg-accent-primary/10 text-accent-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-primary rounded-r-full" />
              )}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-accent-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Settings Section */}
      <div className="px-3 py-3 border-t border-gray-100">
        <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          Settings
        </p>
        {settingsLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.description}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative ${
                active
                  ? 'bg-accent-primary/10 text-accent-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-primary rounded-r-full" />
              )}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-accent-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 bg-gray-50/30">
        <Link
          href="/"
          target="_blank"
          className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
        >
          <Store className="w-[18px] h-[18px] flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="flex-1">View Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
        </Link>
        <SignOutButton
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all text-left group"
          icon={<LogOut className="w-[18px] h-[18px] flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />}
        />
      </div>
    </nav>
  );
}

// Mobile sidebar overlay
export function MobileAdminNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-[85vw] max-w-72 bg-white z-50 md:hidden shadow-2xl">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <span className="text-lg font-bold text-gray-900">Admin Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col h-[calc(100%-4rem)]">
          <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navLinks.map((link, index) => {
              // Handle section dividers
              if (link.divider) {
                return (
                  <div key={`divider-${index}`} className="pt-5 pb-2 first:pt-0">
                    <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      {link.label}
                    </p>
                  </div>
                );
              }

              const Icon = link.icon!;
              const active = isActive(link.href!, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                    active
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-primary rounded-r-full" />
                  )}
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-accent-primary' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="block">{link.label}</span>
                    {link.description && (
                      <span className="block text-xs text-gray-400 truncate">{link.description}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="px-3 py-3 border-t border-gray-100">
            <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              Settings
            </p>
            {settingsLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                    active
                      ? 'bg-accent-primary/10 text-accent-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent-primary rounded-r-full" />
                  )}
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-accent-primary' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="px-3 py-3 border-t border-gray-100 space-y-0.5 bg-gray-50/30">
            <Link
              href="/"
              target="_blank"
              onClick={onClose}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
            >
              <Store className="w-[18px] h-[18px] flex-shrink-0 text-gray-400" />
              <span className="flex-1">View Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
            </Link>
            <SignOutButton
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all text-left group"
              icon={<LogOut className="w-[18px] h-[18px] flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />}
            />
          </div>
        </nav>
      </div>
    </>
  );
}
