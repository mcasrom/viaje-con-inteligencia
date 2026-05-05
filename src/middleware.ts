import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const BLOCKED_COUNTRIES = ['cu'];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin2026!Viaje';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Block Cuba country pages
  if (pathname.startsWith('/pais/')) {
    const codigo = pathname.split('/')[2]?.toLowerCase();
    if (codigo && BLOCKED_COUNTRIES.includes(codigo)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect admin routes (skip in dev)
  const IS_DEV = process.env.NODE_ENV !== 'production';
  if (!IS_DEV && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get('admin_session')?.value;
    if (cookie !== ADMIN_PASSWORD) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Dev: auto-set session cookie if visiting admin
  if (IS_DEV && pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('admin_session')?.value;
    if (!cookie || cookie === 'undefined') {
      const response = NextResponse.next({ request });
      response.cookies.set('admin_session', 'dev', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
      return response;
    }
  }

  // Refresh Supabase session on each request
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/pais/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
