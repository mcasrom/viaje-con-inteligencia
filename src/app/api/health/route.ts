import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { getAllCircuitStatuses } from '@/lib/circuit-breaker';

const log = createLogger('Health');
const startTime = Date.now();

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, any> = {};
  const errors: string[] = [];

  // Supabase
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('indices').select('id', { count: 'exact', head: true }).limit(1);
      checks.supabase = { status: error ? 'error' : 'ok', detail: error?.message || null };
      if (error) errors.push(`supabase: ${error.message}`);
    } else {
      checks.supabase = { status: 'error', detail: 'supabaseAdmin not initialized' };
      errors.push('supabase: not initialized');
    }
  } catch (err: any) {
    checks.supabase = { status: 'error', detail: err.message };
    errors.push(`supabase: ${err.message}`);
  }

  // Circuit breakers
  try {
    const circuits = getAllCircuitStatuses();
    const openCircuits = Object.entries(circuits).filter(([_, s]) => s.isOpen);
    checks.circuitBreakers = {
      status: openCircuits.length === 0 ? 'ok' : 'degraded',
      openCircuits: openCircuits.length,
      circuits,
    };
    if (openCircuits.length > 0) {
      errors.push(`circuit-breakers: ${openCircuits.length} open`);
    }
  } catch (err: any) {
    checks.circuitBreakers = { status: 'error', detail: err.message };
  }

  // Environment
  const envVars = ['SENTRY_DSN', 'TELEGRAM_BOT_TOKEN', 'RESEND_API_KEY', 'GROQ_API_KEY'];
  const missingEnv = envVars.filter(v => !process.env[v]);
  checks.environment = {
    status: missingEnv.length === 0 ? 'ok' : 'degraded',
    missingVars: missingEnv,
  };
  if (missingEnv.length > 0) {
    errors.push(`env: missing ${missingEnv.join(', ')}`);
  }

  // Uptime
  checks.uptime = {
    status: 'ok',
    seconds: Math.floor((Date.now() - startTime) / 1000),
  };

  const status = errors.length === 0 ? 'ok' : errors.length <= 2 ? 'degraded' : 'error';

  log.info(`Health check: ${status} (${errors.length} issues)`);

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
