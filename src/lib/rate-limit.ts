import { NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30; // peticiones por ventana

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Limpieza periódica de entradas expiradas
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 60_000);

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export function checkRateLimit(ip: string, max: number = RATE_LIMIT_MAX, window: number = RATE_LIMIT_WINDOW): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + window });
    return { allowed: true, remaining: max - 1, resetAt: now + window };
  }

  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
}

export function rateLimitResponse(ip: string): NextResponse {
  return NextResponse.json(
    { error: 'Demasiadas peticiones. Intenta de nuevo en 1 minuto.' },
    {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
