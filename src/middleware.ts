import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Protected routes
  const protectedRoutes = ['/home', '/submit-idea', '/history']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Allow access to reset-password route without session
  if (request.nextUrl.pathname.startsWith('/reset-password')) {
    return response
  }

  if (!session && isProtectedRoute) {
    // Redirect to login if accessing protected route without session
    const redirectUrl = request.nextUrl.pathname
    return NextResponse.redirect(
      new URL(`/?redirectTo=${redirectUrl}`, request.url)
    )
  }

  // If user is signed in and the current path is / or /login
  // redirect the user to /home
  if (session && !isProtectedRoute && !request.nextUrl.pathname.startsWith('/reset-password')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: ['/', '/home', '/submit-idea', '/history', '/login', '/reset-password']
} 