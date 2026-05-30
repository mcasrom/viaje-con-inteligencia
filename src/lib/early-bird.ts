import { createLogger } from '@/lib/logger';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { getTodosLosPaises } from '@/data/paises';

const log = createLogger('EarlyBird');

const ADMIN_EMAIL = 'info@viajeinteligencia.com';
const resend = process.env.RESEND_API_KEY ? new (await import('resend')).Resend(process.env.RESEND_API_KEY) : null;

const TYPE_ICON: Record<string, string> = {
  terrorism: '⚠️',
  airspace_closure: '✈️',
  conflict: '💥',
  natural_disaster: '🌍',
  flight_disruption: '🛫',
  health_outbreak: '🏥',
  protest: '📢',
  travel_advisory: '📋',
  security_threat: '🔒',
  infrastructure: '🏗️',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

const RISK_EMOJI: Record<string, string> = {
  'sin-riesgo': '🟢',
  'bajo': '🟡',
  'medio': '🟠',
  'alto': '🔴',
  'muy-alto': '⚫',
};

async function getRecentIncidents(hours = 24): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('incidents')
    .select('country_code, type, severity, description, detected_at, tone_score')
    .gte('detected_at', new Date(Date.now() - hours * 3600000).toISOString())
    .order('severity', { ascending: true })
    .order('detected_at', { ascending: false });
  return data || [];
}

async function getRecentMAECChanges(hours = 48): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('maec_risk_history')
    .select('country_code, old_level, new_level, changed_at')
    .gte('changed_at', new Date(Date.now() - hours * 3600000).toISOString())
    .order('changed_at', { ascending: false })
    .limit(10);
  return data || [];
}

async function getSentimentAlerts(hours = 24): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('sentiment_alerts')
    .select('country_code, avg_tone_7d, tone_trend_7d, triggered_at')
    .gte('triggered_at', new Date(Date.now() - hours * 3600000).toISOString())
    .order('avg_tone_7d', { ascending: true })
    .limit(10);
  return data || [];
}

async function getCriticalNews(hours = 24): Promise<any[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('osint_signals')
    .select('title, source, category, urgency, country_codes, published_at, raw_url')
    .gte('published_at', new Date(Date.now() - hours * 3600000).toISOString())
    .in('urgency', ['critical', 'high'])
    .order('urgency', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(15);
  return data || [];
}

async function getSystemHealth(): Promise<{ ok: number; fail: number; total: number; failed: string[] }> {
  try {
    const { runHealthChecks, getHealthSummary } = await import('@/lib/health-check');
    const results = await runHealthChecks();
    const summary = getHealthSummary(results);
    return {
      ok: summary.ok,
      fail: summary.fail,
      total: summary.total,
      failed: summary.failed.map(f => f.service),
    };
  } catch {
    return { ok: 0, fail: 1, total: 1, failed: ['health-check-error'] };
  }
}

async function getTrafficSummary(): Promise<{ pageViews?: number; requests?: number; uniques?: number } | null> {
  try {
    if (!isSupabaseAdminConfigured()) return null;
    const { data } = await supabaseAdmin
      .from('cloudflare_analytics')
      .select('page_views, total_requests, unique_visitors')
      .order('week_start', { ascending: false })
      .limit(1);
    if (!data || data.length === 0) return null;
    return { pageViews: data[0].page_views, requests: data[0].total_requests, uniques: data[0].unique_visitors };
  } catch {
    return null;
  }
}

async function getSubscriberCount(): Promise<number> {
  try {
    if (!isSupabaseAdminConfigured()) return 0;
    const { count } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);
    return count || 0;
  } catch {
    return 0;
  }
}

function urgencyBadge(urgency: string): string {
  switch (urgency) {
    case 'critical': return '<span style="background:#dc2626;color:#fff;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:700;">CRÍTICA</span>';
    case 'high': return '<span style="background:#f59e0b;color:#000;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:700;">ALTA</span>';
    default: return '';
  }
}

export async function buildEarlyBirdDigest(): Promise<string | null> {
  try {
    const paises = getTodosLosPaises();
    const paisMap = new Map(paises.map(p => [p.codigo, p]));

    const [incidents, maecChanges, sentimentAlerts, criticalNews, health, traffic, subscribers] = await Promise.all([
      getRecentIncidents(24),
      getRecentMAECChanges(48),
      getSentimentAlerts(24),
      getCriticalNews(24),
      getSystemHealth(),
      getTrafficSummary(),
      getSubscriberCount(),
    ]);

    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const lines: string[] = [];

    lines.push(`🌅 Early Bird — ${today}`);
    lines.push('');

    // === SISTEMA ===
    if (health.fail > 0) {
      lines.push(`🔴 Sistema: ${health.fail}/${health.total} fallos`);
      for (const f of health.failed.slice(0, 5)) {
        lines.push(`  ❌ ${f}`);
      }
      lines.push('');
    } else {
      lines.push(`✅ Sistema: ${health.ok}/${health.total} OK`);
      lines.push('');
    }

    // === TRÁFICO ===
    if (traffic) {
      lines.push(`📊 Tráfico (última semana)`);
      if (traffic.pageViews != null) lines.push(`  👁 Page views: ${traffic.pageViews.toLocaleString('es-ES')}`);
      if (traffic.uniques != null) lines.push(`  👤 Visitantes únicos: ${traffic.uniques.toLocaleString('es-ES')}`);
      if (traffic.requests != null) lines.push(`  📡 Requests: ${traffic.requests.toLocaleString('es-ES')}`);
      lines.push('');
    }

    // === SUSCRIPTORES ===
    lines.push(`📬 Newsletter: ${subscribers} suscriptores verificados`);
    lines.push('');

    // === NOTICIAS CRÍTICAS ===
    if (criticalNews.length > 0) {
      lines.push(`🔴 NOTICIAS CRÍTICAS Y RELEVANTES (24h)`);
      lines.push('');
      for (const n of criticalNews.slice(0, 10)) {
        const countries = Array.isArray(n.country_codes) && n.country_codes.length > 0
          ? n.country_codes.map((c: string) => paisMap.get(c)?.nombre || c).join(', ')
          : 'Global';
        const icon = n.urgency === 'critical' ? '🔴' : '🟠';
        const source = n.source || 'OSINT';
        lines.push(`${icon} [${source.toUpperCase()}] ${n.title || 'Sin título'}`);
        lines.push(`   Países: ${countries}`);
        if (n.raw_url) lines.push(`   ${n.raw_url}`);
        lines.push('');
      }
    }

    // === CAMBIOS MAEC ===
    if (maecChanges.length > 0) {
      lines.push(`📊 Cambios MAEC (últimas 48h)`);
      lines.push('');
      for (const c of maecChanges.slice(0, 5)) {
        const pais = paisMap.get(c.country_code);
        const emoji = pais?.bandera || '🌍';
        const oldEmoji = RISK_EMOJI[c.old_level] || '❓';
        const newEmoji = RISK_EMOJI[c.new_level] || '❓';
        const arrow = c.old_level === c.new_level ? '→' : (c.new_level > c.old_level ? '⬆️' : '⬇️');
        lines.push(`${emoji} ${pais?.nombre || c.country_code} ${oldEmoji} ${arrow} ${newEmoji}`);
      }
      lines.push('');
    }

    // === INCIDENTES ===
    if (incidents.length > 0) {
      lines.push(`🚨 Incidentes nuevos (24h)`);
      lines.push('');
      const grouped = new Map<string, any[]>();
      for (const inc of incidents) {
        const key = `${inc.type}_${inc.severity}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(inc);
      }
      for (const sev of SEVERITY_ORDER) {
        for (const [typeKey, items] of grouped) {
          if (!typeKey.endsWith(sev)) continue;
          const [type] = typeKey.split('_');
          const icon = TYPE_ICON[type] || '📌';
          const label = type.replace(/_/g, ' ');
          const countries = items.map(i => {
            const pais = paisMap.get(i.country_code);
            return pais?.nombre || i.country_code;
          }).join(', ');
          lines.push(`${icon} ${label} (${sev}) — ${countries}`);
        }
      }
      lines.push('');
    }

    // === SENTIMIENTO ===
    if (sentimentAlerts.length > 0) {
      lines.push(`📉 Sentimiento negativo (24h)`);
      lines.push('');
      for (const s of sentimentAlerts.slice(0, 5)) {
        const pais = paisMap.get(s.country_code);
        const emoji = pais?.bandera || '🌍';
        const tone = s.avg_tone_7d?.toFixed(1) || '0';
        const trend = s.tone_trend_7d > 0 ? '📈 mejorando' : '📉 empeorando';
        lines.push(`${emoji} ${pais?.nombre || s.country_code} tone: ${tone} ${trend}`);
      }
      lines.push('');
    }

    // === RESUMEN EJECUTIVO ===
    const totalIncidents = incidents.length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    const negativeSentiment = sentimentAlerts.filter(s => s.avg_tone_7d < -5).length;
    const criticalNewsCount = criticalNews.filter(n => n.urgency === 'critical').length;

    lines.push(`📋 RESUMEN EJECUTIVO`);
    lines.push(`• Noticias críticas: ${criticalNewsCount}`);
    lines.push(`• Incidentes: ${totalIncidents} (${criticalIncidents} críticos/altos)`);
    lines.push(`• Cambios MAEC: ${maecChanges.length}`);
    lines.push(`• Sentimiento negativo: ${negativeSentiment} países`);
    lines.push(`• Sistema: ${health.ok}/${health.total} OK`);
    lines.push('');
    lines.push(`🔗 Dashboard: https://www.viajeinteligencia.com/admin/dashboard`);
    lines.push(`🔗 OSINT: https://www.viajeinteligencia.com/admin/osint`);
    lines.push(`🔗 Early Bird historial: https://www.viajeinteligencia.com/admin/early-bird`);

    return lines.join('\n');
  } catch (err) {
    log.error('Error building early bird digest', err);
    return null;
  }
}

export interface EarlyBirdRecord {
  id?: number;
  created_at: string;
  digest_text: string;
  incidents_count: number;
  maec_changes_count: number;
  sentiment_alerts_count: number;
  health_ok: number;
  health_fail: number;
  traffic_page_views: number | null;
  traffic_uniques: number | null;
  newsletter_subscribers: number;
  sent_telegram: boolean;
  sent_email: boolean;
}

export async function saveEarlyBirdDigest(record: EarlyBirdRecord): Promise<void> {
  try {
    if (!isSupabaseAdminConfigured()) return;
    const { error } = await supabaseAdmin.from('early_bird_digests').insert({
      created_at: record.created_at,
      digest_text: record.digest_text,
      incidents_count: record.incidents_count,
      maec_changes_count: record.maec_changes_count,
      sentiment_alerts_count: record.sentiment_alerts_count,
      health_ok: record.health_ok,
      health_fail: record.health_fail,
      traffic_page_views: record.traffic_page_views,
      traffic_uniques: record.traffic_uniques,
      newsletter_subscribers: record.newsletter_subscribers,
      sent_telegram: record.sent_telegram,
      sent_email: record.sent_email,
    });
    if (error) log.error('Failed to save early bird digest', error);
    else log.info('Early bird digest saved to DB');
  } catch (e) {
    log.error('Error saving early bird digest', e);
  }
}

export async function sendEarlyBirdDigest(text: string): Promise<boolean> {
  try {
    if (!resend) {
      log.error('Resend not configured');
      return false;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 640px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; }
    .header { font-size: 20px; font-weight: 700; color: #fbbf24; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f59e0b33; }
    .section { margin: 16px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .ok { color: #22c55e; }
    .error { color: #ef4444; }
    .critical { color: #ef4444; font-weight: 600; }
    .warning { color: #f59e0b; }
    .item { padding: 8px 12px; margin: 4px 0; background: #0f172a; border-radius: 6px; border-left: 3px solid #334155; font-size: 13px; line-height: 1.5; }
    .item.critical-item { border-left-color: #ef4444; }
    .item.high-item { border-left-color: #f59e0b; }
    .item a { color: #60a5fa; text-decoration: none; }
    .summary { background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #334155; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .summary-label { color: #94a3b8; }
    .summary-value { color: #e2e8f0; font-weight: 500; }
    .links { margin-top: 20px; padding-top: 16px; border-top: 1px solid #334155; }
    .links a { display: inline-block; margin-right: 16px; color: #60a5fa; text-decoration: none; font-size: 13px; }
    .divider { height: 1px; background: #334155; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">🌅 Early Bird — ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    ${text.split('\n').map(line => {
      if (line.startsWith('✅')) return `<div class="section"><span class="ok">${line}</span></div>`;
      if (line.startsWith('🔴')) return `<div class="section"><span class="critical">${line}</span></div>`;
      if (line.startsWith('📊') || line.startsWith('🚨') || line.startsWith('📉') || line.startsWith('📬') || line.startsWith('📋')) return `<div class="section-title">${line}</div>`;
      if (line.startsWith('  ')) return `<div class="item">${line.trim()}</div>`;
      if (line.startsWith('•')) return `<div class="summary-row"><span class="summary-label">${line.replace('• ', '').split(':')[0]}</span><span class="summary-value">${line.split(':').slice(1).join(':')}</span></div>`;
      if (line.startsWith('🔗')) return `<div class="links"><a href="${line.split(': ').slice(1).join(': ')}">${line.split(': ')[0].replace('🔗 ', '')}</a></div>`;
      if (line.trim() === '') return '<div class="divider"></div>';
      return `<div style="font-size:13px;line-height:1.5;">${line}</div>`;
    }).join('\n')}
  </div>
</body>
</html>`;

    const emailRes = await resend.emails.send({
      from: 'Viaje con Inteligencia <earlybird@viajeinteligencia.com>',
      to: ADMIN_EMAIL,
      subject: `🌅 Early Bird — ${new Date().toLocaleDateString('es-ES')}`,
      html: htmlContent,
      text: text,
    });

    const ok = !emailRes.error;
    log.info(`Early bird sent to email: ${ok}`);
    return ok;
  } catch (e) {
    log.error('Error sending early bird digest', e);
    return false;
  }
}
