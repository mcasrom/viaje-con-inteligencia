import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_COUNTRIES = ['cu'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.startsWith('/pais/')) {
    const codigo = pathname.split('/')[2]?.toLowerCase();
    if (codigo && BLOCKED_COUNTRIES.includes(codigo)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/pais/:path*'],
};