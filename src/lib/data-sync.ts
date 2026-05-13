import { supabaseAdmin } from '@/lib/supabase-admin';
import { MAIN_AIRPORTS } from '@/data/airports';
import { EVENTS_FALLBACK } from '@/lib/events-fallback';
import { travelAttributes } from '@/data/clustering';
import { createLogger } from '@/lib/logger';

const log = createLogger('DataSync');

export async function syncAirportsToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  let synced = 0;
  for (const [code, airports] of Object.entries(MAIN_AIRPORTS)) {
    const a = airports[0];
    if (!a) continue;
    const { error } = await admin.from('airports').upsert({
      country_code: code,
      iata: a.iata,
      name: a.name,
      city: a.city,
      lat: a.lat,
      lon: a.lon,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'country_code' });
    if (!error) synced++;
  }
  log.info(`Airports sync: ${synced}/${Object.keys(MAIN_AIRPORTS).length}`);
  return synced;
}

export async function syncEventsFallbackToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  await admin.from('events').delete().eq('source', 'fallback');

  const rows = EVENTS_FALLBACK.map(ev => ({
    source: 'fallback',
    source_id: `fb-${ev.code}-${ev.title.slice(0, 40).replace(/\s+/g, '-').toLowerCase()}`,
    country: ev.country,
    title: ev.title,
    category: ev.category,
    subcategory: ev.subcategory,
    start_date: ev.start_date,
    end_date: ev.end_date,
    impact_traveler: ev.impact_traveler,
    impact_note: ev.impact_note,
    city: ev.city,
    verified: false,
  }));

  const { error } = await admin.from('events').insert(rows);
  if (error) {
    log.error('Events fallback sync error', error);
    return 0;
  }
  log.info(`Events fallback sync: ${rows.length} inserted`);
  return rows.length;
}

export async function syncTravelAttributesToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  let synced = 0;
  for (const [code, attrs] of Object.entries(travelAttributes)) {
    const { error } = await admin.from('travel_attributes').upsert({
      codigo_pais: code,
      playa: attrs.playa,
      cultural: attrs.cultural,
      naturaleza: attrs.naturaleza,
      familiar: attrs.familiar,
      mejor_epoca: attrs.mejorEpoca,
      duracion_optima: attrs.duracionOptima,
      actualizado_en: new Date().toISOString(),
    }, { onConflict: 'codigo_pais' });
    if (!error) synced++;
  }
  log.info(`Travel attributes sync: ${synced}/${Object.keys(travelAttributes).length}`);
  return synced;
}

export async function syncCountryNameMapToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  const { COUNTRY_NAME_TO_CODE } = await import('@/lib/scraper/us-state-dept');
  let synced = 0;

  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    const { error } = await admin.from('country_name_map').upsert({
      name_lower: name,
      country_code: code,
    }, { onConflict: 'name_lower' });
    if (!error) synced++;
  }

  log.info(`Country name map sync: ${synced}/${Object.keys(COUNTRY_NAME_TO_CODE).length}`);
  return synced;
}

export async function syncOpenSkyBoundsToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  const { COUNTRY_BOUNDS } = await import('@/lib/opensky');
  const entryCount = Object.keys(COUNTRY_BOUNDS).length;
  let synced = 0;

  for (const [code, b] of Object.entries(COUNTRY_BOUNDS)) {
    const { error } = await admin.from('opensky_bounds').upsert({
      country_code: code,
      lat_min: b.lamin,
      lat_max: b.lamax,
      lon_min: b.lomin,
      lon_max: b.lomax,
    }, { onConflict: 'country_code' });
    if (!error) synced++;
  }

  log.info(`OpenSky bounds sync: ${synced}/${entryCount}`);
  return synced;
}

export async function syncDisposableEmailsToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) return 0;

  const { DISPOSABLE_DOMAINS } = await import('@/lib/disposable-emails');
  let synced = 0;

  for (const domain of DISPOSABLE_DOMAINS) {
    const { error } = await admin.from('disposable_email_domains').upsert({
      domain,
    }, { onConflict: 'domain' });
    if (!error) synced++;
  }

  log.info(`Disposable emails sync: ${synced}/${DISPOSABLE_DOMAINS.size}`);
  return synced;
}
