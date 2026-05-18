import { createLogger } from '@/lib/logger';
import { supabaseAdmin } from './supabase-admin';

const log = createLogger('CloudflareAnalytics');

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';
const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '';
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';

interface CfTotals {
  pageViews: number;
  uniqueVisitors: number;
  requests: number;
  bandwidthBytes: number;
  threats: number;
  sslPct: number;
}

interface CfCountry {
  country: string;
  requests: number;
  pct: number;
}

interface CfTopPath {
  path: string;
  requests: number;
}

interface CfStatusCodes {
  [code: string]: number;
}

interface CfAnalyticsResult {
  totals: CfTotals;
  countries: CfCountry[];
  topPaths: CfTopPath[];
  statusCodes: CfStatusCodes;
  crawlerRequests: number;
}

function headers() {
  return {
    Authorization: `Bearer ${CF_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function isConfigured(): boolean {
  return !!(CF_API_TOKEN && CF_ZONE_ID);
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function buildCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const header = keys.join(',');
  const lines = rows.map(r => keys.map(k => {
    const v = r[k];
    if (typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n')))
      return `"${v.replace(/"/g, '""')}"`;
    return String(v);
  }).join(','));
  return [header, ...lines].join('\n');
}

async function fetchDashboard(): Promise<CfTotals | null> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${CF_API_BASE}/zones/${CF_ZONE_ID}/analytics/dashboard?since=${since}&until=${new Date().toISOString()}&continuous=true`;
  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) {
      log.warn(`Dashboard API HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (!json.success) {
      log.warn('Dashboard API returned error', json.errors);
      return null;
    }
    const t = json.result.totals;
    const total = t.requests.all || 0;
    const ssl = t.requests.ssl || 0;
    return {
      pageViews: t.pageviews?.all || 0,
      uniqueVisitors: t.uniques?.all || 0,
      requests: total,
      bandwidthBytes: t.bandwidth?.all || 0,
      threats: t.threats?.all || 0,
      sslPct: total > 0 ? Math.round((ssl / total) * 10000) / 100 : 0,
    };
  } catch (err) {
    log.error('Dashboard API fetch failed', err);
    return null;
  }
}

async function fetchTopPagesFromNginx(): Promise<{ topPaths: CfTopPath[]; statusCodes: CfStatusCodes; countryRequests: CfCountry[] }> {
  try {
    const res = await fetch('http://localhost:8080/nginx-stats', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      topPaths: data.topPaths || [],
      statusCodes: data.statusCodes || {},
      countryRequests: data.countries || [],
    };
  } catch {
    return { topPaths: [], statusCodes: {}, countryRequests: [] };
  }
}

function buildSummary(result: CfAnalyticsResult, weekStart: string, weekEnd: string): string {
  const days = 7;
  const avgDaily = Math.round(result.totals.uniqueVisitors / days);
  const avgPageViews = Math.round(result.totals.pageViews / days);
  const topPath = result.topPaths[0];
  const seoIssues = result.statusCodes['404'] || 0;
  return [
    `📊 Cloudflare Analytics — ${weekStart} a ${weekEnd}`,
    '',
    `👥 Visitantes únicos: ${result.totals.uniqueVisitors.toLocaleString()} (${avgDaily}/día)`,
    `📄 Páginas vistas: ${result.totals.pageViews.toLocaleString()} (${avgPageViews}/día)`,
    `🔗 Peticiones: ${result.totals.requests.toLocaleString()}`,
    `💾 Ancho de banda: ${formatBytes(result.totals.bandwidthBytes)}`,
    `🔒 SSL: ${result.totals.sslPct}%`,
    `⚠️ Amenazas: ${result.totals.threats}`,
    `🤖 Crawlers: ${result.crawlerRequests}`,
    topPath ? `\n🏆 Página top: ${topPath.path} (${topPath.requests} req)` : '',
    seoIssues > 0 ? `\n🔴 404s: ${seoIssues}` : '',
    result.countries.length > 0 ? `\n🌍 Top países: ${result.countries.slice(0, 5).map(c => `${c.country} (${c.pct}%)`).join(', ')}` : '',
  ].join('\n');
}

export async function runCloudflareAnalytics(): Promise<{ stored: boolean; summary: string }> {
  if (!isConfigured()) {
    log.warn('Cloudflare not configured — missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID');
    return { stored: false, summary: '❌ Cloudflare Analytics no configurado (faltan tokens)' };
  }

  const totals = await fetchDashboard();
  if (!totals) {
    return { stored: false, summary: '❌ Error al consultar Cloudflare Analytics API' };
  }

  const nginxData = await fetchTopPagesFromNginx();

  const result: CfAnalyticsResult = {
    totals,
    countries: nginxData.countryRequests || [],
    topPaths: nginxData.topPaths || [],
    statusCodes: nginxData.statusCodes || {},
    crawlerRequests: 0,
  };

  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const weekEnd = now.toISOString().split('T')[0];

  const csvRows: Record<string, string | number>[] = [];
  const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayName = dayNames[d.getDay()];
    csvRows.push({
      fecha: d.toISOString().split('T')[0],
      dia: dayName,
      visitantes_unicos: i === 0 ? Math.round(totals.uniqueVisitors / 7) : 0,
      paginas_vistas: i === 0 ? Math.round(totals.pageViews / 7) : 0,
      peticiones: i === 0 ? Math.round(totals.requests / 7) : 0,
    });
  }

  const csvData = buildCsv(csvRows);

  const seoMetrics = {
    not_found_404: result.statusCodes['404'] || 0,
    redirects_301: result.statusCodes['301'] || 0,
    server_errors_5xx: (result.statusCodes['500'] || 0) + (result.statusCodes['502'] || 0) + (result.statusCodes['503'] || 0),
    total_status_codes: result.statusCodes,
  };

  const summary = buildSummary(result, weekStart, weekEnd);

  try {
    const { error } = await supabaseAdmin.from('cloudflare_analytics').insert({
      week_start: weekStart,
      week_end: weekEnd,
      page_views: totals.pageViews,
      unique_visitors: totals.uniqueVisitors,
      total_requests: totals.requests,
      bandwidth_bytes: totals.bandwidthBytes,
      threat_count: totals.threats,
      top_pages: result.topPaths,
      status_codes: result.statusCodes,
      countries: result.countries,
      seo_metrics: seoMetrics,
      csv_data: csvData,
      ssl_encrypted_pct: totals.sslPct,
      crawler_requests: result.crawlerRequests,
      extracted_at: new Date().toISOString(),
    });
    if (error) {
      log.error('Error storing analytics', error);
      return { stored: false, summary };
    }
    log.info(`Analytics stored for week ${weekStart}–${weekEnd}`);
    return { stored: true, summary };
  } catch (err) {
    log.error('Supabase insert failed', err);
    return { stored: false, summary };
  }
}

export async function getWeeklyAnalyticsCsv(weekStart: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cloudflare_analytics')
      .select('csv_data')
      .eq('week_start', weekStart)
      .single();
    if (error || !data) return null;
    return data.csv_data as string;
  } catch {
    return null;
  }
}
