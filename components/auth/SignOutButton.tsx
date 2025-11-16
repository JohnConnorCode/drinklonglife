'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({
  className = '',
  children = 'Sign Out',
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);

      // Sign out on client side - this clears cookies automatically
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Redirect and refresh to clear any cached data
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      // Show user-friendly error
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      alert(`Error: ${message}. Please try refreshing the page.`);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Signing out...' : children}
    </button>
  );
}
