'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { AdminNavigation, MobileAdminNav } from '@/components/admin/AdminNavigation';
import { Menu } from 'lucide-react';

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-gray-200 shadow-sm">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-accent-primary/10 rounded-lg p-1.5">
              <AnimatedLogo
                size="sm"
                variant="header"
                showText={false}
              />
            </div>
            <div>
              <div className="font-heading text-lg font-bold text-gray-900">Long Life</div>
              <div className="text-xs text-accent-primary font-medium">Admin Console</div>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto">
          <AdminNavigation />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="bg-accent-primary/10 rounded-lg p-1.5">
            <AnimatedLogo
              size="sm"
              variant="header"
              showText={false}
            />
          </div>
          <div>
            <div className="font-heading text-base font-bold text-gray-900">Long Life</div>
            <div className="text-xs text-accent-primary font-medium">Admin</div>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileAdminNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top padding for fixed header */}
        <div className="md:hidden h-16 flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>

        {/* Footer - always at bottom */}
        <footer className="flex-shrink-0 border-t border-gray-200 bg-white mt-auto">
          <div className="px-6 lg:px-8 py-4">
            <p className="text-sm text-gray-500 text-center">
              Long Life Admin Console
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
