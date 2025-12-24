import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = request.cookies.get('token')?.value || 
                (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/verify')) {
    return NextResponse.next();
  }

  const publicApiRoutes = ['/api/auth/login', '/api/auth/signup'];
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const verified = verifyToken(token);
    if (!verified) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/setup-store')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/setup-store/:path*'],
};
