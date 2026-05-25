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

function countryName(code: string): string {
  const map: Record<string, string> = {
    AU: 'Australia', US: 'Estados Unidos', ES: 'España', DE: 'Alemania', FR: 'Francia',
    GB: 'Reino Unido', IE: 'Irlanda', NL: 'Países Bajos', JP: 'Japón', SG: 'Singapur',
    CH: 'Suiza', CN: 'China', KR: 'Corea del Sur', CA: 'Canadá', BE: 'Bélgica',
    BR: 'Brasil', MX: 'México', AR: 'Argentina', CO: 'Colombia', CL: 'Chile',
    PE: 'Perú', IT: 'Italia', PT: 'Portugal', IN: 'India', RU: 'Rusia',
    IL: 'Israel', EG: 'Egipto', ZA: 'Sudáfrica', NZ: 'Nueva Zelanda', HK: 'Hong Kong',
    NO: 'Noruega', SE: 'Suecia', FI: 'Finlandia', PL: 'Polonia', VN: 'Vietnam',
    ID: 'Indonesia', TH: 'Tailandia', TW: 'Taiwán', UA: 'Ucrania',
  };
  return map[code] || code;
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

async function fetchGraphql(): Promise<{ totals: CfTotals; countries: CfCountry[]; topPaths: CfTopPath[] } | null> {
  const sinceDay = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const query = {
    query: `{
      viewer {
        zones(filter: {zoneTag: "${CF_ZONE_ID}"}) {
          httpRequests1dGroups(
            limit: 7
            filter: {date_gt: "${sinceDay}"}
            orderBy: [date_DESC]
          ) {
            dimensions { date }
            sum { requests bytes threats pageViews cachedRequests encryptedRequests countryMap { clientCountryName requests } }
            uniq { uniques }
          }
        }
      }
    }`,
  };
  try {
    const res = await fetch(`${CF_API_BASE}/graphql`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(query),
    });
    if (!res.ok) {
      log.warn(`GraphQL API HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (json.errors) {
      log.warn('GraphQL API errors', json.errors);
      return null;
    }
    const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
    if (!groups.length) {
      log.warn('GraphQL returned empty daily data');
      return null;
    }
    let totalRequests = 0, totalBytes = 0, totalThreats = 0, totalPageViews = 0, totalUniques = 0, totalEncrypted = 0, totalCached = 0;
    const countryAgg = new Map<string, number>();
    for (const g of groups) {
      totalRequests += g.sum?.requests || 0;
      totalBytes += g.sum?.bytes || 0;
      totalThreats += g.sum?.threats || 0;
      totalPageViews += g.sum?.pageViews || 0;
      totalEncrypted += g.sum?.encryptedRequests || 0;
      totalCached += g.sum?.cachedRequests || 0;
      totalUniques += g.uniq?.uniques || 0;
      for (const c of g.sum?.countryMap || []) {
        const name = c.clientCountryName || 'ZZ';
        countryAgg.set(name, (countryAgg.get(name) || 0) + c.requests);
      }
    }
    const totalCountry = [...countryAgg.values()].reduce((a, b) => a + b, 0);
    const countries: CfCountry[] = [...countryAgg.entries()]
      .map(([country, requests]) => ({ country, requests, pct: totalCountry > 0 ? Math.round((requests / totalCountry) * 1000) / 10 : 0 }))
      .sort((a, b) => b.requests - a.requests);

    // Top paths not available in free Cloudflare plan (clientRequestPath field not supported)
    const topPaths: CfTopPath[] = [];

    return {
      totals: {
        pageViews: totalPageViews,
        uniqueVisitors: totalUniques,
        requests: totalRequests,
        bandwidthBytes: totalBytes,
        threats: totalThreats,
        sslPct: totalRequests > 0 ? Math.round((totalEncrypted / totalRequests) * 10000) / 100 : 0,
      },
      countries,
      topPaths,
    };
  } catch (err) {
    log.error('GraphQL fetch failed', err);
    return null;
  }
}

function buildSummary(result: CfAnalyticsResult, weekStart: string, weekEnd: string): string {
  const days = 7;
  const avgDaily = Math.round(result.totals.uniqueVisitors / days);
  const avgPageViews = Math.round(result.totals.pageViews / days);
  const topPath = result.topPaths[0];
  const seoIssues = result.statusCodes['404'] || 0;

  const table = result.countries.length > 0 ? [
    '',
    '🌍  TRÁFICO POR PAÍS (últimos 7 días)',
    '┌──────────────────────┬──────────┬───────┐',
    ...result.countries.slice(0, 15).map((c, i) => {
      const name = `${c.country} ${countryName(c.country)}`.padEnd(20);
      const req = c.requests.toLocaleString().padStart(8);
      const pct = `${c.pct}%`.padStart(5);
      const note = i === 0 && c.country === 'AU' ? ' ← tú (desarrollo)' :
                   c.country === 'US' ? ' ← crawlers/crons' :
                   c.country === 'ES' ? ' ← tu residencia' : '';
      return `│ ${name} │ ${req} │ ${pct} │${note}`;
    }).join('\n'),
    '└──────────────────────┴──────────┴───────┘',
    result.countries.length > 15 ? `... y ${result.countries.length - 15} países más` : '',
  ].join('\n') : '';

  return [
    `📊 Cloudflare Analytics — ${weekStart} a ${weekEnd}`,
    '',
    `👥 Visitantes únicos: ${result.totals.uniqueVisitors.toLocaleString()} (${avgDaily}/día)`,
    `📄 Páginas vistas: ${result.totals.pageViews.toLocaleString()} (${avgPageViews}/día)`,
    `🔗 Peticiones: ${result.totals.requests.toLocaleString()}`,
    `💾 Ancho de banda: ${formatBytes(result.totals.bandwidthBytes)}`,
    `🔒 SSL: ${result.totals.sslPct}%`,
    `⚠️ Amenazas: ${result.totals.threats}`,
    result.crawlerRequests > 0 ? `🤖 Crawlers: ${result.crawlerRequests}` : '',
    topPath ? `\n🏆 Página top: ${topPath.path} (${topPath.requests} req)` : '',
    seoIssues > 0 ? `🔴 404s: ${seoIssues}` : '',
    table,
  ].join('\n');
}

export async function runCloudflareAnalytics(): Promise<{ stored: boolean; summary: string }> {
  if (!isConfigured()) {
    log.warn('Cloudflare not configured — missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID');
    return { stored: false, summary: '❌ Cloudflare Analytics no configurado (faltan tokens)' };
  }

  const fetched = await fetchGraphql();
  if (!fetched) {
    return { stored: false, summary: '❌ Error al consultar Cloudflare Analytics API' };
  }

  const result: CfAnalyticsResult = {
    totals: fetched.totals,
    countries: fetched.countries,
    topPaths: fetched.topPaths,
    statusCodes: {},
    crawlerRequests: fetched.countries
      .filter(c => ['US', 'IE', 'DE', 'NL', 'GB'].includes(c.country))
      .reduce((sum, c) => sum + c.requests, 0),
  };

  // Estimate crawler traffic: US + major DC countries that are likely bots/crons
  result.crawlerRequests = Math.round(result.crawlerRequests * 0.6);

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
      visitantes_unicos: i === 0 ? Math.round(fetched.totals.uniqueVisitors / 7) : 0,
      paginas_vistas: i === 0 ? Math.round(fetched.totals.pageViews / 7) : 0,
      peticiones: i === 0 ? Math.round(fetched.totals.requests / 7) : 0,
    });
  }

  const csvData = buildCsv(csvRows);

  const seoMetrics = {
    not_found_404: 0,
    redirects_301: 0,
    server_errors_5xx: 0,
    total_status_codes: {},
  };

  const summary = buildSummary(result, weekStart, weekEnd);

  try {
    const { error } = await supabaseAdmin.from('cloudflare_analytics').insert({
      week_start: weekStart,
      week_end: weekEnd,
      page_views: fetched.totals.pageViews,
      unique_visitors: fetched.totals.uniqueVisitors,
      total_requests: fetched.totals.requests,
      bandwidth_bytes: fetched.totals.bandwidthBytes,
      threat_count: fetched.totals.threats,
      top_pages: fetched.topPaths,
      status_codes: {},
      countries: fetched.countries,
      seo_metrics: seoMetrics,
      csv_data: csvData,
      ssl_encrypted_pct: fetched.totals.sslPct,
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

export async function hasWeeklyAnalytics(weekStart: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cloudflare_analytics')
      .select('id')
      .eq('week_start', weekStart)
      .maybeSingle();
    return !!(!error && data);
  } catch {
    return false;
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
