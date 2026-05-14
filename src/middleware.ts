import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const BLOCKED_COUNTRIES = ['cu'];

// Rate limiting simple (in-memory, por instancia)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RL_WINDOW = 60_000;
const RL_MAX = 60;

function checkRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Excluir crons y healthcheck
  if (path.startsWith('/api/cron') || path === '/api/health') return true;

  const key = `${ip}:${path.startsWith('/api/') ? 'api' : 'web'}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RL_WINDOW });
    return true;
  }

  entry.count++;
  return entry.count <= RL_MAX;
}

// Limpieza periódica
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt < now) rateLimitMap.delete(key);
    }
  }, 60_000);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limiting para API (excepto cron/health)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/cron') && pathname !== '/api/health') {
    if (!checkRateLimit(request)) {
      return new NextResponse(JSON.stringify({ error: 'Demasiadas peticiones. Intenta de nuevo en 1 minuto.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      });
    }
  }

  // Block Cuba country pages
  if (pathname.startsWith('/pais/')) {
    const codigo = pathname.split('/')[2]?.toLowerCase();
    if (codigo && BLOCKED_COUNTRIES.includes(codigo)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect admin page routes (skip in dev, skip API routes — they handle auth themselves)
  const IS_DEV = process.env.NODE_ENV !== 'production';
  if (!IS_DEV && pathname.startsWith('/admin') && !pathname.startsWith('/api/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get('admin_session')?.value;
    if (!cookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Dev: auto-set session cookie if visiting admin
  if (IS_DEV && pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('admin_session')?.value;
    if (!cookie) {
      const response = NextResponse.next({ request });
      response.cookies.set('admin_session', '1', {
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
