import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables at build time
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Create Supabase client for client components
 *
 * This uses @supabase/ssr which automatically:
 * - Manages auth cookies properly
 * - Handles session refresh
 * - Syncs auth state across tabs
 *
 * Usage in client components:
 * ```tsx
 * const supabase = createClient();
 * const { data } = await supabase.auth.signInWithPassword({...});
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
