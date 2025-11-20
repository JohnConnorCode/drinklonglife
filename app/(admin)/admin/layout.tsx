import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { AnimatedLogo } from '@/components/AnimatedLogo';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check admin access (middleware should have caught this, but be safe)
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-accent-cream flex flex-col">
      {/* Admin Header */}
      <div className="bg-accent-primary text-white shadow-lg border-b-4 border-accent-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="bg-white/10 rounded-lg p-1.5">
                  <AnimatedLogo
                    size="sm"
                    variant="header"
                    showText={false}
                  />
                </div>
                <div>
                  <div className="font-heading text-lg font-bold">Long Life</div>
                  <div className="text-xs text-accent-yellow">Admin Console</div>
                </div>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/orders"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Orders
                </Link>
                <Link
                  href="/admin/subscriptions"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Subscriptions
                </Link>
                <Link
                  href="/admin/products"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/admin/ingredients"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Ingredients
                </Link>
                <Link
                  href="/admin/referrals"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Referrals
                </Link>
                <Link
                  href="/admin/discounts"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Discounts
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/newsletter"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Newsletter
                </Link>
                <Link
                  href="/admin/wholesale"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Wholesale
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Store
              </Link>
              <SignOutButton className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-md transition-colors border border-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" style={{ minHeight: '90vh' }}>
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-accent-primary border-t-4 border-accent-yellow mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-white/70 text-center">
            Long Life Admin Console • Restricted Access
          </p>
        </div>
      </footer>
    </div>
  );
}
