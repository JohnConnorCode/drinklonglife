import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware to protect routes and handle authentication
 * Uses Supabase's recommended updateSession pattern
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Update session and get user (this MUST come first - do not add logic before this)
  const { supabaseResponse, user } = await updateSession(request)

  // Admin routes - require authentication AND admin access
  const isAdminRoute = pathname.startsWith('/admin')

  // Protected routes - require authentication
  const protectedRoutes = ['/account']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Auth routes - redirect to /account if already logged in
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  // If user is not authenticated and trying to access protected/admin route
  if ((isProtectedRoute || isAdminRoute) && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)

    // IMPORTANT: Copy cookies from supabaseResponse manually
    const response = NextResponse.redirect(redirectUrl)
    const cookies = supabaseResponse.cookies.getAll()
    for (const cookie of cookies) {
      response.cookies.set(cookie.name, cookie.value, cookie)
    }
    return response
  }

  // If trying to access admin route, check admin status
  if (isAdminRoute && user) {
    // We need to check if user is admin
    // Create a new Supabase client for this check
    const { createServerClient } = await import('@supabase/ssr')

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Don't modify cookies here, just read
          },
        },
      }
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.sub) // getClaims() returns 'sub' as user ID
      .single()

    if (!profile?.is_admin) {
      // Not an admin - redirect to unauthorized page
      const response = NextResponse.redirect(new URL('/unauthorized', request.url))
      const cookies = supabaseResponse.cookies.getAll()
      for (const cookie of cookies) {
        response.cookies.set(cookie.name, cookie.value, cookie)
      }
      return response
    }
  }

  // If user is authenticated and trying to access auth routes
  if (isAuthRoute && user) {
    const redirectTo = searchParams.get('redirectTo') || '/account'
    const response = NextResponse.redirect(new URL(redirectTo, request.url))
    const cookies = supabaseResponse.cookies.getAll()
    for (const cookie of cookies) {
      response.cookies.set(cookie.name, cookie.value, cookie)
    }
    return response
  }

  // Return the supabaseResponse unchanged (CRITICAL!)
  return supabaseResponse
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
}
