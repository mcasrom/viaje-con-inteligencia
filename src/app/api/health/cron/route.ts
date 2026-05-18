import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Last 30 runs for trend analysis
    const { data: history, error } = await supabaseAdmin
      .from('cron_history')
      .select('id, status, duration_ms, started_at, completed_at, ok_steps, error_steps, total_steps')
      .order('started_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    if (!history || history.length === 0) {
      return NextResponse.json({
        status: 'ok',
        runs: [],
        total: 0,
        degradation: null,
        message: 'No cron history yet. Run the master cron first.',
      });
    }

    // Degradation detection
    const lastRun = history[0];
    const hoursSinceLastRun = (Date.now() - new Date(lastRun.completed_at).getTime()) / (1000 * 60 * 60);

    const avgDuration = Math.round(history.reduce((s, r) => s + (r.duration_ms || 0), 0) / history.length);
    const recentAvg = Math.round(
      history.slice(0, 5).reduce((s, r) => s + (r.duration_ms || 0), 0) / Math.min(5, history.length)
    );

    const degradeThreshold = avgDuration * 2;
    const durationDegraded = recentAvg > degradeThreshold && history.length >= 5;

    const totalErrors = history.filter(r => r.status === 'error').length;
    const totalPartial = history.filter(r => r.status === 'partial').length;
    const successRate = history.length > 0
      ? Math.round((history.filter(r => r.status === 'success').length / history.length) * 100)
      : 0;

    const degradation: any = {};
    if (hoursSinceLastRun > 27) degradation.stale = `Última ejecución hace ${Math.round(hoursSinceLastRun)}h`;
    if (durationDegraded) degradation.duration = `Duración reciente (${recentAvg / 1000}s) duplica la media (${avgDuration / 1000}s)`;
    if (totalErrors > 0) degradation.errors = `${totalErrors} ejecuciones con error en las últimas ${history.length}`;
    if (successRate < 80 && history.length >= 3) degradation.successRate = `Solo ${successRate}% de éxito`;

    return NextResponse.json({
      status: 'ok',
      total: history.length,
      lastRun: {
        id: lastRun.id,
        status: lastRun.status,
        durationMs: lastRun.duration_ms,
        okSteps: lastRun.ok_steps,
        errorSteps: lastRun.error_steps,
        totalSteps: lastRun.total_steps,
        completedAt: lastRun.completed_at,
        hoursSinceLastRun: Math.round(hoursSinceLastRun * 10) / 10,
      },
      averages: {
        durationMs: avgDuration,
        durationSeconds: Math.round(avgDuration / 10) / 100,
        recentDurationMs: recentAvg,
        recentDurationSeconds: Math.round(recentAvg / 10) / 100,
      },
      successRate,
      degradation: Object.keys(degradation).length > 0 ? degradation : null,
      runs: history,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 });
  }
}
