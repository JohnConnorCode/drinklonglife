import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/account';
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createServerClient();

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        `${origin}/login?message=${encodeURIComponent('Authentication failed. Please try again.')}`
      );
    }

    // Successful authentication - redirect to intended destination
    return NextResponse.redirect(`${origin}${next}`);
  }

  // No code present, redirect to login
  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent('No authentication code provided.')}`
  );
}
