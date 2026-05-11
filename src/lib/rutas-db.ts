import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import type { ThematicRoute, ThemeRoute, WineSeason } from '@/data/rutas-espanas';

function mapRowToRoute(row: any): ThematicRoute {
  const d = row.data;
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    description: d.description,
    image: d.image,
    category: d.category,
    region: d.region,
    totalDistance: row.total_distance,
    totalDrivingTime: row.total_driving_time,
    segments: d.segments || [],
    locations: d.locations || [],
    bestSeason: d.bestSeason || [],
    difficulty: row.difficulty,
    roadType: d.roadType || 'mixto',
    avgDailyCost: d.avgDailyCost || { bajo: 0, medio: 0, alto: 0 },
    mlFeatures: d.mlFeatures || { popularityScore: 0, safetyScore: 0, valueScore: 0 },
  };
}

export async function getAllRoutesFromDB(): Promise<ThematicRoute[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data, error } = await supabaseAdmin
    .from('thematic_routes')
    .select('*')
    .order('total_distance', { ascending: true });
  if (error || !data || data.length === 0) return [];
  return data.map(mapRowToRoute);
}

export async function getRouteFromDB(id: string): Promise<ThematicRoute | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const { data, error } = await supabaseAdmin
    .from('thematic_routes')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return mapRowToRoute(data);
}

export async function getRoutesByCategoryFromDB(category: string): Promise<ThematicRoute[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data, error } = await supabaseAdmin
    .from('thematic_routes')
    .select('*')
    .eq('category', category)
    .order('total_distance', { ascending: true });
  if (error || !data || data.length === 0) return [];
  return data.map(mapRowToRoute);
}

export async function getWineSeasonsFromDB(): Promise<WineSeason[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data, error } = await supabaseAdmin
    .from('wine_seasons')
    .select('*')
    .order('id');
  if (error || !data || data.length === 0) return [];
  return data.map((row: any) => ({
    name: row.name,
    months: row.months,
    crowdLevel: row.crowd_level,
    priceMultiplier: row.price_multiplier,
    notes: row.notes,
  }));
}
