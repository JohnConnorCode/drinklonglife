import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Validates and sanitizes redirect paths to prevent open redirect vulnerabilities
 * SECURITY: Only allows relative paths that don't start with // (protocol-relative URLs)
 */
function validateRedirectPath(path: string | null): string {
  if (!path) {
    return '/account';
  }

  // CRITICAL: Prevent open redirects - only allow paths starting with single /
  if (!path.startsWith('/') || path.startsWith('//')) {
    console.warn(`Rejected invalid redirect path: ${path}`);
    return '/account';
  }

  // Whitelist allowed redirect paths
  const allowedPrefixes = [
    '/account',
    '/admin',
    '/checkout',
    '/blends',
    '/shop',
    '/cart',
    '/thank-you'
  ];

  const isAllowed = allowedPrefixes.some(prefix => path.startsWith(prefix));
  if (!isAllowed) {
    console.warn(`Redirect path not in whitelist: ${path}`);
    return '/account';
  }

  return path;
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');
  const next = validateRedirectPath(nextParam);
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = cookies();

    // CRITICAL: Create response object FIRST so we can set cookies on it
    let response = NextResponse.redirect(`${origin}${next}`);

    // Create Supabase client with cookie handlers that write to the response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // cookies() can throw in route handlers - this is expected
            }
            // CRITICAL: Also set on the response object we're returning
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // cookies() can throw in route handlers - this is expected
            }
            // CRITICAL: Also remove from the response object
            response.cookies.set(name, '', options);
          },
        },
      }
    );

    // Exchange code for session (this will call the set() methods above)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        `${origin}/login?message=${encodeURIComponent('Authentication failed. Please try again.')}`
      );
    }

    // Return the response WITH the session cookies
    return response;
  }

  // No code present, redirect to login
  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent('No authentication code provided.')}`
  );
}
