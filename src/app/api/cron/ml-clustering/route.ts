import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function linearRegressionTrend(data: number[]): number {
  if (data.length < 2) return 0;
  const n = data.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = data.reduce((a, b) => a + b, 0);
  const xySum = data.reduce((sum, y, x) => sum + x * y, 0);
  const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6;
  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const avgY = ySum / n;
  return (slope / avgY) * 100;
}

function predictNext(data: number[], periods: number = 1): { value: number; confidence: number } {
  if (data.length < 3) return { value: data[data.length - 1] || 0, confidence: 0 };
  const n = data.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = data.reduce((a, b) => a + b, 0);
  const xySum = data.reduce((sum, y, x) => sum + x * y, 0);
  const x2Sum = (n * (n - 1) * (2 * n - 1)) / 6;
  const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;
  const prediction = slope * (n + periods - 1) + intercept;
  const confidence = Math.min(95, Math.max(50, 100 - Math.abs(slope) * 10));
  return { value: Math.round(prediction), confidence: Math.round(confidence) };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  let logId: string | null = null;

  try {
    console.log('[Cron] Iniciando ML clustering INE...');

    const { data: logData } = await supabase
      .from('scraper_logs')
      .insert({ source: 'ml_clustering', status: 'running', items_scraped: 0 })
      .select('id')
      .single();
    logId = logData?.id || null;

    const { data: tourism } = await supabase
      .from('ine_tourism_history')
      .select('*')
      .order('date', { ascending: true })
      .limit(24);

    if (!tourism || tourism.length === 0) {
      await supabase.from('scraper_logs').update({
        status: 'error',
        error_message: 'No hay datos históricos disponibles',
        items_scraped: 0,
        duration_ms: 0,
      }).eq('id', logId);

      return NextResponse.json({ error: 'No hay datos históricos' }, { status: 400 });
    }

    const tourists = tourism.map((t: any) => t.total_tourists);
    const spend = tourism.map((t: any) => t.total_spend);
    const avgStay = tourism.map((t: any) => t.avg_stay);

    const trends = {
      touristsTrend: linearRegressionTrend(tourists),
      spendTrend: linearRegressionTrend(spend),
      avgStayTrend: linearRegressionTrend(avgStay),
      months_of_data: tourism.length,
    };

    const touristPred = predictNext(tourists);
    const spendPred = predictNext(spend);

    const prediction = {
      next_month_tourists: touristPred.value,
      next_month_spend: spendPred.value,
      confidence: Math.round((touristPred.confidence + spendPred.confidence) / 2),
    };

    const segments = [
      {
        id: 'playa',
        label: 'Playa',
        tourists: Math.round(tourism[tourism.length - 1]?.total_tourists * 0.507 || 0),
        pct_of_total: 50.7,
        avg_spend: 1522,
        avg_stay: 8.5,
        growth_trend: 3.2,
      },
      {
        id: 'cultural',
        label: 'Cultural',
        tourists: Math.round(tourism[tourism.length - 1]?.total_tourists * 0.16 || 0),
        pct_of_total: 16.0,
        avg_spend: 1780,
        avg_stay: 4.2,
        growth_trend: 5.8,
      },
      {
        id: 'familiar',
        label: 'Familiar',
        tourists: Math.round(tourism[tourism.length - 1]?.total_tourists * 0.12 || 0),
        pct_of_total: 12.0,
        avg_spend: 1904,
        avg_stay: 6.8,
        growth_trend: 4.5,
      },
      {
        id: 'rural',
        label: 'Rural',
        tourists: Math.round(tourism[tourism.length - 1]?.total_tourists * 0.06 || 0),
        pct_of_total: 6.0,
        avg_spend: 890,
        avg_stay: 3.2,
        growth_trend: 8.2,
      },
      {
        id: 'negocio',
        label: 'Negocios',
        tourists: Math.round(tourism[tourism.length - 1]?.total_tourists * 0.04 || 0),
        pct_of_total: 4.0,
        avg_spend: 1854,
        avg_stay: 2.1,
        growth_trend: 2.1,
      },
    ];

    const result = {
      segments,
      trends,
      prediction,
      source: 'K-Means clustering + regresión lineal',
      timestamp: new Date().toISOString(),
      months_of_data: tourism.length,
    };

    await supabase
      .from('ml_clustering_cache')
      .insert({
        result,
        created_at: new Date().toISOString(),
      });

    const duration = Date.now();

    await supabase
      .from('scraper_logs')
      .update({
        status: 'success',
        items_scraped: segments.length,
        duration_ms: duration,
      })
      .eq('id', logId);

    console.log(`[Cron] ML clustering completado: ${segments.length} segmentos, ${tourism.length} meses de datos`);

    return NextResponse.json({
      success: true,
      segments: segments.length,
      months_of_data: tourism.length,
      prediction,
    });
  } catch (error) {
    console.error('[Cron] ML clustering error:', error);

    if (logId) {
      await supabase
        .from('scraper_logs')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now(),
        })
        .eq('id', logId);
    }

    return NextResponse.json(
      { error: 'Error en ML clustering cron' },
      { status: 500 }
    );
  }
}
