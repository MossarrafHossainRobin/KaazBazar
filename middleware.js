// middleware.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseAdmin';

export async function middleware(request) {
  const session = request.cookies.get('session')?.value;
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decodedToken = await auth.verifySessionCookie(session);
    const isAdmin = decodedToken.role === 'admin';
    
    if (!isAdmin && request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};