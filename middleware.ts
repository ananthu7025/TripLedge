import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user session from cookies
  const userSession = request.cookies.get('user_session');
  const isAuthenticated = !!userSession;

  // Handle root route - redirect based on auth status
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Admin login page
  const isLoginPage = pathname === '/admin/login';

  // Protected admin routes
  const isProtectedRoute = pathname.startsWith('/admin') && !isLoginPage;
  const isCheckInPage = pathname === '/checkin';

  // If user is not authenticated and tries to access check-in page, redirect to login
  if (!isAuthenticated && isCheckInPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If user is authenticated and tries to access login page, redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // If user is not authenticated and tries to access protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/checkin',
    '/',
  ],
};
