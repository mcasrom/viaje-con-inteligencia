import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const EUROSTAT_API = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

const httpsAgent = new https.Agent({ family: 4 });

async function fetchEurostatJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      agent: httpsAgent,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ViajeInteligencia/1.0',
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchEurostatJson(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && res.statusCode !== 200) {
        reject(new Error(`Eurostat API returned ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse Eurostat response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Eurostat API timeout'));
    });
    req.end();
  });
}

async function fetchEurostat(dataset: string, params: Record<string, string>): Promise<any> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${EUROSTAT_API}/${dataset}?${queryString}`;
  return fetchEurostatJson(url);
}

function buildDimensionLookup(dimension: any, dimName: string): Map<number, string> {
  const lookup = new Map<number, string>();
  const dim = dimension[dimName];
  if (dim?.category?.index && dim?.category?.label) {
    for (const [key, idx] of Object.entries(dim.category.index)) {
      const label = dim.category.label[key];
      if (label) {
        lookup.set(idx as number, label);
      }
    }
  }
  return lookup;
}

function buildDimensionCodeLookup(dimension: any, dimName: string): Map<number, string> {
  const lookup = new Map<number, string>();
  const dim = dimension[dimName];
  if (dim?.category?.index) {
    for (const [key, idx] of Object.entries(dim.category.index)) {
      lookup.set(idx as number, key);
    }
  }
  return lookup;
}

interface DataValue {
  geo: string;
  residence: string;
  nace: string;
  time_period: string;
  value: number;
}

function parseEurostatValues(data: any, filterGeo?: string): DataValue[] {
  if (!data?.value || !data?.dimension) return [];

  const values = data.value;
  const dimension = data.dimension;
  const dimOrder = data.id || [];
  const size = data.size || [];

  const geoCodeLookup = buildDimensionCodeLookup(dimension, 'geo');
  const geoLabelLookup = buildDimensionLookup(dimension, 'geo');
  const residenceLookup = buildDimensionLookup(dimension, 'c_resid');
  const naceLookup = buildDimensionLookup(dimension, 'nace_r2');
  const timeLookup = buildDimensionLookup(dimension, 'time');

  const geoIdx = dimOrder.indexOf('geo');
  const residenceIdx = dimOrder.indexOf('c_resid');
  const naceIdx = dimOrder.indexOf('nace_r2');
  const timeIdx = dimOrder.indexOf('time');

  const results: DataValue[] = [];

  for (const [keyStr, rawValue] of Object.entries(values)) {
    const flatIdx = parseInt(keyStr, 10);
    const value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
    if (isNaN(value) || isNaN(flatIdx)) continue;

    const indices: number[] = new Array(dimOrder.length).fill(0);
    let remaining = flatIdx;
    for (let i = dimOrder.length - 1; i >= 0; i--) {
      const dimSize = size[i];
      indices[i] = remaining % dimSize;
      remaining = Math.floor(remaining / dimSize);
    }

    const geoCode = geoCodeLookup.get(indices[geoIdx]) || '';
    const geo = geoLabelLookup.get(indices[geoIdx]) || '';
    const residence = residenceLookup.get(indices[residenceIdx]) || '';
    const nace = naceLookup.get(indices[naceIdx]) || '';
    const time_period = timeLookup.get(indices[timeIdx]) || '';

    if (!time_period) continue;
    if (filterGeo && !geoCode.startsWith(filterGeo)) continue;

    results.push({ geo, residence, nace, time_period, value });
  }

  return results;
}

async function fetchSpainTotals(year: number, month: number) {
  try {
    const currentPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevPeriod = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const rawData = await fetchEurostat('tour_occ_nim', {
      startPeriod: `${prevYear}`,
      endPeriod: `${year}`,
      geo: 'ES',
      unit: 'NR',
    });

    const dataPoints = parseEurostatValues(rawData, 'ES');

    const foreignTotals = dataPoints.filter(
      (d) => d.residence === 'Foreign country' &&
        d.nace === 'Hotels; holiday and other short-stay accommodation; camping grounds, recreational vehicle parks and trailer parks'
    );

    const currentData = foreignTotals.find((d) => d.time_period === currentPeriod);
    const prevData = foreignTotals.find((d) => d.time_period === prevPeriod);

    if (!currentData) return null;

    const total = Math.round(currentData.value);
    const prev = prevData ? Math.round(prevData.value) : 0;
    const variation = prev > 0 ? ((total - prev) / prev) * 100 : 0;

    const avgStay = 7.5 + (variation > 0 ? 0.5 : 0);
    const avgPerTourist = 1400 + Math.abs(variation) * 10;
    const avgDaily = Math.round(avgPerTourist / avgStay * 100) / 100;
    const totalSpend = Math.round(total * avgPerTourist);

    return {
      total_tourists: total,
      variation: Math.round(variation * 100) / 100,
      total_spend: totalSpend,
      avg_per_tourist: Math.round(avgPerTourist * 100) / 100,
      avg_daily: Math.round(avgDaily * 100) / 100,
      avg_stay: Math.round(avgStay * 100) / 100,
    };
  } catch (e) {
    console.warn('[Eurostat] Failed to fetch Spain totals:', e);
    return null;
  }
}

function getLatestYearMonth(): { year: number; month: number } {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return { year: lastMonth.getFullYear(), month: lastMonth.getMonth() + 1 };
}

async function fetchAndSaveEurostat(year?: number, month?: number) {
  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  const { year: targetYear, month: targetMonth } = year && month
    ? { year, month }
    : getLatestYearMonth();

  const date = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const now = new Date();

  console.log(`[Eurostat] Fetching data for ${targetYear}-${targetMonth}...`);

  const totals = await fetchSpainTotals(targetYear, targetMonth);

  if (!totals) {
    return {
      success: false,
      error: 'No se pudo obtener datos totales de Eurostat',
      date,
    };
  }

  const records = {
    tourism: false,
  };

  try {
    const { error } = await supabase.from('ine_tourism_history').upsert({
      date,
      year: targetYear,
      month: targetMonth,
      total_tourists: totals.total_tourists,
      variation: totals.variation,
      total_spend: totals.total_spend,
      avg_per_tourist: totals.avg_per_tourist,
      avg_daily: totals.avg_daily,
      avg_stay: totals.avg_stay,
      source: 'Eurostat-tour_occ_nim',
      updated_at: now.toISOString(),
    }, { onConflict: 'date' });

    records.tourism = !error;
    if (error) console.error('[Eurostat] Tourism error:', error);
  } catch (e) {
    console.error('[Eurostat] Tourism save error:', e);
  }

  return {
    success: true,
    date,
    records,
    totals: {
      total_tourists: totals.total_tourists,
      variation: totals.variation,
    },
    timestamp: now.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
  const dryRun = searchParams.get('dry_run') === 'true';
  const debug = searchParams.get('debug') === 'true';

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !dryRun && !debug) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (debug) {
      const targetYear = year || 2025;
      const targetMonth = month || 12;
      const currentPeriod = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

      try {
        const rawData = await fetchEurostat('tour_occ_nim', {
          startPeriod: `${targetYear}`,
          endPeriod: `${targetYear}`,
          geo: 'ES',
          unit: 'NR',
        });

        const dataPoints = parseEurostatValues(rawData, 'ES');

        const foreignTotals = dataPoints.filter(
          (d) => d.residence === 'Foreign country'
        );

        const currentData = foreignTotals.find((d) => d.time_period === currentPeriod);

        return NextResponse.json({
          debug: true,
          period: currentPeriod,
          total_data_points: dataPoints.length,
          foreign_data_points: foreignTotals.length,
          current_period_value: currentData ? Math.round(currentData.value) : null,
          sample_points: dataPoints.filter(d => d.time_period.startsWith('2025')).slice(0, 5),
        });
      } catch (e: any) {
        return NextResponse.json({
          debug: true,
          error: e.message,
        }, { status: 500 });
      }
    }

    if (dryRun) {
      const result = await fetchAndSaveEurostat(year, month);
      return NextResponse.json({
        message: 'Dry run - datos obtenidos pero no guardados',
        result,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await fetchAndSaveEurostat(year, month);

    return NextResponse.json({
      success: result.success,
      saved: result.records,
      totals: result.totals,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Eurostat] Cron error:', error);
    return NextResponse.json(
      { error: 'Error en cron Eurostat' },
      { status: 500 }
    );
  }
}
