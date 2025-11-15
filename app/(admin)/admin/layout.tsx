import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { isCurrentUserAdmin } from '@/lib/admin';
import { SignOutButton } from '@/components/auth/SignOutButton';

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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-heading text-xl font-bold">
                ⚡ Admin Console
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Products
                </Link>
                <Link
                  href="/admin/ingredients"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Ingredients
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/discounts"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Discounts
                </Link>
                <Link
                  href="/admin/settings"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Account
              </Link>
              <SignOutButton className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            Long Life Admin Console • Restricted Access
          </p>
        </div>
      </footer>
    </div>
  );
}
