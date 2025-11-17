import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', request.url), {
    status: 303,
  });
}

export async function GET(request: Request) {
  // Support GET requests too for convenience
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL('/', request.url), {
    status: 303,
  });
}
