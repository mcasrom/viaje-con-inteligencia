import { NextResponse } from 'next/server';
import { getAllMAECAlerts, getMAECData } from '@/lib/scraper/maec';
import { supabase } from '@/lib/supabase';
import { paisesData } from '@/data/paises';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  let logId: string | null = null;
  const results: { country: string; status: string; error?: string }[] = [];

  try {
    console.log('[Cron] Iniciando scrape MAEC completo...');
    
    if (supabase) {
      const { data: logData } = await supabase
        .from('scraper_logs')
        .insert({ source: 'maec_full_scrape', status: 'running', items_scraped: 0 })
        .select('id')
        .single();
      logId = logData?.id || null;
    }

    const alerts = await getAllMAECAlerts();
    results.push({ country: 'all_alerts', status: 'ok', error: undefined });

    for (const [code, pais] of Object.entries(paisesData)) {
      try {
        const data = await getMAECData(code);
        if (data && data.nivelRiesgo) {
          results.push({ country: code, status: 'ok' });
        } else {
          results.push({ country: code, status: 'no_data' });
        }
      } catch (err) {
        results.push({ country: code, status: 'error', error: String(err) });
      }
    }

    const successCount = results.filter(r => r.status === 'ok').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (supabase && logId) {
      await supabase
        .from('scraper_logs')
        .update({
          status: errorCount > 0 ? 'partial' : 'success',
          items_scraped: successCount,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          metadata: { alerts_count: alerts.length, errors: errorCount },
        })
        .eq('id', logId);
    }

    console.log(`[Cron] Scrape MAEC completado: ${successCount} ok, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      total: results.length,
      success: successCount,
      errors: errorCount,
      alerts: alerts.length,
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error en scrape MAEC:', error);

    if (supabase && logId) {
      await supabase
        .from('scraper_logs')
        .update({
          status: 'error',
          errors: String(error),
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        })
        .eq('id', logId);
    }

    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}