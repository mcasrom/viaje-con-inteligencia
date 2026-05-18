import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cron_history')
      .select('status, completed_at, duration_ms, ok_steps, error_steps, total_steps')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        status: 'unknown',
        message: 'No cron history found',
        healthy: false,
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    const lastRun = new Date(data.completed_at);
    const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);

    const degraded =
      data.status === 'error' ||
      data.status === 'partial' ||
      hoursSinceLastRun > 27;

    return NextResponse.json({
      status: degraded ? 'degraded' : 'healthy',
      lastRun: data.completed_at,
      hoursSinceLastRun: Math.round(hoursSinceLastRun * 10) / 10,
      lastStatus: data.status,
      durationMs: data.duration_ms,
      okSteps: data.ok_steps,
      errorSteps: data.error_steps,
      totalSteps: data.total_steps,
      healthy: !degraded,
      timestamp: new Date().toISOString(),
    }, { status: degraded ? 503 : 200 });
  } catch (e: any) {
    return NextResponse.json({
      status: 'error',
      message: e.message,
      healthy: false,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
