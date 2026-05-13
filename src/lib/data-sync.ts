import { supabaseAdmin } from '@/lib/supabase-admin';
import { MAIN_AIRPORTS } from '@/data/airports';
import { EVENTS_FALLBACK } from '@/lib/events-fallback';
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
