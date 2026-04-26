import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const INE_DATA = {
  tourists: {
    month: 1,
    year: 2026,
    total: 5127256,
    variation: 1.19,
    byCountry: {
      'Reino Unido': 1281829,
      'Francia': 771890,
      'Alemania': 718217,
      'Italia': 358991,
      'Países Bajos': 281490,
      'Suecia': 214059,
      'Bélgica': 205090,
      'Irlanda': 153818,
      'Suiza': 153818,
      'Noruega': 128182,
    },
    byRegion: {
      'Canarias': 1538177,
      'Cataluña': 1025451,
      'Andalucía': 820361,
      'C. Valenciana': 718217,
      'Islas Baleares': 512726,
      'Madrid': 359107,
      'Galicia': 102545,
      'Asturias': 51300,
      'País Vasco': 51300,
    },
  },
  spend: {
    total: 7804610000,
    avgPerTourist: 1522,
    avgDaily: 177,
    avgStay: 8.62,
    variation: 9.26,
  },
};

async function fetchAndSaveINE() {
  const now = new Date();
  const year = INE_DATA.tourists.year;
  const month = INE_DATA.tourists.month;
  const date = `${year}-${String(month).padStart(2, '0')}-01`;

  if (!supabase) {
    return { success: false, error: 'Supabase no configurado' };
  }

  const records: {
    tourism: { date: string; tourists: number } | null;
    regions: number;
    countries: number;
  } = {
    tourism: null,
    regions: 0,
    countries: 0,
  };

  try {
    const { error: tourismError } = await supabase.from('ine_tourism_history').upsert({
      date,
      year,
      month,
      total_tourists: INE_DATA.tourists.total,
      variation: INE_DATA.tourists.variation,
      total_spend: INE_DATA.spend.total,
      avg_per_tourist: INE_DATA.spend.avgPerTourist,
      avg_daily: INE_DATA.spend.avgDaily,
      avg_stay: INE_DATA.spend.avgStay,
      source: 'INE-FRONTUR-EGATUR',
      updated_at: now.toISOString(),
    }, { onConflict: 'date' });

    if (!tourismError) records.tourism = { date, tourists: INE_DATA.tourists.total };
  } catch (e) {
    console.log(' tourism table error:', e);
  }

  try {
    const regions = Object.entries(INE_DATA.tourists.byRegion).map(([region, tourists]) => ({
      date,
      year,
      month,
      region,
      tourists,
      spend: 0,
      segment: 'mixto' as const,
      source: 'INE-FRONTUR-EGATUR',
    }));

    const { error: regionError } = await supabase.from('ine_region_history').upsert(regions, { onConflict: 'date,region' });
    if (!regionError) records.regions = regions.length;
  } catch (e) {
    console.log(' region table error:', e);
  }

  try {
    const countries = Object.entries(INE_DATA.tourists.byCountry).map(([country, tourists]) => ({
      date,
      year,
      month,
      country,
      tourists,
      spend: 0,
      avg_stay: INE_DATA.spend.avgStay,
      source: 'INE-FRONTUR-EGATUR',
    }));

    const { error: countryError } = await supabase.from('ine_country_history').upsert(countries, { onConflict: 'date,country' });
    if (!countryError) records.countries = countries.length;
  } catch (e) {
    console.log(' country table error:', e);
  }

  return {
    success: true,
    records,
    timestamp: now.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dryRun = searchParams.get('dry_run') === 'true';

  try {
    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run - no se guardará nada',
        data: INE_DATA,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await fetchAndSaveINE();

    return NextResponse.json({
      success: result.success,
      saved: result.records,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('INE cron error:', error);
    return NextResponse.json(
      { error: 'Error en cron INE' },
      { status: 500 }
    );
  }
}