// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow admin routes - no redirect
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Allow dashboard routes
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};