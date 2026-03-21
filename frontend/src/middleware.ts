import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protect /dashboard/* routes from unauthenticated access.
 * Reads the Supabase session token from localStorage is not possible in middleware
 * (no DOM access), so we check for the access_token cookie set by Supabase Auth.
 */
// Dashboard pages rendered by the (dashboard) route group — these URLs
// don't contain "(dashboard)" because it's a Next.js route group.
const PROTECTED_PREFIXES = [
  '/today', '/billing', '/explore', '/settings', '/overview',
  '/oracle', '/briefs', '/clusters', '/posts', '/landscape',
  '/cannibalization', '/consolidation', '/actions', '/issues',
  '/competitors', '/impact', '/profile', '/calendar', '/wrapped',
  '/dashboard',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie (set automatically by @supabase/ssr)
  const supabaseSession =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('supabase-auth-token') ||
    request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`);

  // Also allow if Authorization header present (API-style auth)
  const authHeader = request.headers.get('authorization');

  if (!supabaseSession && !authHeader) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match dashboard route group pages.
     * The (dashboard) route group renders at these URL prefixes.
     * Excludes: _next/static, _next/image, favicon.ico, api routes
     */
    '/today/:path*',
    '/billing/:path*',
    '/explore/:path*',
    '/settings/:path*',
    '/overview/:path*',
    '/oracle/:path*',
    '/briefs/:path*',
    '/clusters/:path*',
    '/posts/:path*',
    '/landscape/:path*',
    '/cannibalization/:path*',
    '/consolidation/:path*',
    '/actions/:path*',
    '/issues/:path*',
    '/competitors/:path*',
    '/impact/:path*',
    '/profile/:path*',
    '/calendar/:path*',
    '/wrapped/:path*',
    '/dashboard/:path*',
  ],
};
