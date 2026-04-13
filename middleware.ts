import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for Mobile API
  if (pathname.startsWith('/api/mobile')) {
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }
    return response;
  }

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
    '/api/mobile/:path*',
    '/admin/:path*',
    '/checkin',
    '/',
  ],
};
