import { supabaseAdmin } from '@/lib/supabase-admin';
import { fetchEventsByCountry } from '@/lib/events-wikidata';
import { fetchGDELTEvents } from '@/lib/events-gdelt';
import { enrichMany } from '@/lib/events-groq';
import { getFallbackEvents, getUpcomingFallbackEvents } from '@/lib/events-fallback';

const PRIORITY_COUNTRIES = [
  'ES', 'FR', 'IT', 'DE', 'GB', 'PT', 'GR',
  'MX', 'AR', 'CO', 'BR', 'US',
  'JP', 'TH', 'TR',
  'MA', 'EG',
];

interface StoredEvent {
  source: string;
  source_id: string;
  country: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  start_date: string | null;
  end_date: string | null;
  impact_traveler: string | null;
  impact_note: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
}

export async function fetchAndStoreEvents(): Promise<{
  wikidata: number;
  gdelt: number;
  enriched: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let wikidataCount = 0;
  let gdeltCount = 0;

  for (const code of PRIORITY_COUNTRIES) {
    try {
      const [wikidataEvents, gdeltEvents] = await Promise.all([
        fetchEventsByCountry(code),
        fetchGDELTEvents(code, 3),
      ]);

      const toStore: StoredEvent[] = [];

      for (const ev of wikidataEvents) {
        toStore.push({
          source: 'wikidata',
          source_id: ev.source_id,
          country: code,
          title: ev.title,
          description: ev.description,
          category: ev.category,
          subcategory: ev.subcategory,
          start_date: ev.start_date,
          end_date: ev.end_date,
          impact_traveler: null,
          impact_note: null,
          url: ev.url,
          lat: ev.lat,
          lng: ev.lng,
          city: ev.city,
        });
      }

      for (const ev of gdeltEvents) {
        toStore.push({
          source: 'gdelt',
          source_id: ev.source_id,
          country: code,
          title: ev.title,
          description: ev.description,
          category: ev.category,
          subcategory: ev.subcategory,
          start_date: ev.start_date,
          end_date: null,
          impact_traveler: null,
          impact_note: null,
          url: ev.url,
          lat: null,
          lng: null,
          city: null,
        });
      }

      if (toStore.length === 0) continue;

      const enriched = await enrichMany(toStore);
      for (let i = 0; i < toStore.length; i++) {
        toStore[i].impact_traveler = enriched[i]?.impact_traveler || 'low';
        toStore[i].impact_note = enriched[i]?.impact_note || null;
        toStore[i].category = enriched[i]?.category || toStore[i].category;
        toStore[i].subcategory = enriched[i]?.subcategory || toStore[i].subcategory;
      }

      for (const ev of toStore) {
        try {
          await supabaseAdmin
            .from('events')
            .upsert({
              source: ev.source,
              source_id: ev.source_id,
              country: ev.country,
              title: ev.title,
              description: ev.description,
              category: ev.category,
              subcategory: ev.subcategory,
              start_date: ev.start_date,
              end_date: ev.end_date,
              impact_traveler: ev.impact_traveler,
              impact_note: ev.impact_note,
              url: ev.url,
              lat: ev.lat,
              lng: ev.lng,
              city: ev.city,
            }, {
              onConflict: 'source,source_id',
              ignoreDuplicates: false,
            });
        } catch (e: any) {
          errors.push(`${code}: upsert error: ${e.message}`);
        }
      }

      wikidataCount += wikidataEvents.length;
      gdeltCount += gdeltEvents.length;
    } catch (e: any) {
      errors.push(`${code}: fetch error: ${e.message}`);
    }
  }

  return {
    wikidata: wikidataCount,
    gdelt: gdeltCount,
    enriched: wikidataCount + gdeltCount,
    errors,
  };
}

export async function getEvents(options: {
  country?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: any[]; count: number; source: string }> {
  let query = supabaseAdmin
    .from('events')
    .select('*', { count: 'exact' });

  if (options.country) {
    query = query.eq('country', options.country.toUpperCase());
  }
  if (options.category) {
    query = query.eq('category', options.category);
  }
  if (options.startDate) {
    query = query.gte('start_date', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('end_date', options.endDate);
  }

  query = query
    .order('start_date', { ascending: true, nullsFirst: false })
    .limit(options.limit || 50)
    .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  // Fallback a eventos hardcodeados si Supabase no tiene datos
  if (!data || data.length === 0) {
    const fallback = getFallbackEvents(options);
    const mapped = fallback.data.map(e => ({
      id: `fallback-${e.code}-${e.start_date}-${Math.random().toString(36).slice(2, 6)}`,
      title: e.title,
      country: e.code.toUpperCase(),
      description: e.impact_note || e.title,
      category: e.category,
      subcategory: e.subcategory,
      start_date: e.start_date,
      end_date: e.end_date,
      impact_traveler: e.impact_traveler,
      impact_note: e.impact_note,
      city: e.city,
      source: e.source,
      url: null,
      lat: null,
      lng: null,
    }));
    return { data: mapped, count: fallback.count, source: 'fallback' };
  }

  return { data: data || [], count: count || 0, source: 'supabase' };
}

export async function getUpcomingEvents(country?: string, days = 30) {
  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

  return getEvents({
    country,
    startDate: today,
    endDate: future,
    limit: 200,
  });
}

export async function getEventCategories() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('category, subcategory')
    .order('category');

  if (error) throw new Error(error.message);
  const cats = new Set<string>();
  const subcats = new Set<string>();
  for (const row of data || []) {
    if (row.category) cats.add(row.category);
    if (row.subcategory) subcats.add(row.subcategory);
  }
  return { categories: [...cats], subcategories: [...subcats] };
}
