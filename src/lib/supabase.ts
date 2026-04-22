import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

export async function signInWithEmail(email: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });
  return { data, error };
}

export async function signInWithTelegram(userId: string, username?: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { data, error } = await supabase.auth.signInWithOtp({
    email: `telegram_${userId}@viaje-inteligencia.app`,
    options: {
      data: { telegram_id: userId, username }
    }
  });
  return { data, error };
}

export async function signOut() {
  if (!supabase) return { error: 'Supabase no configurado' };
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getFavorites(userId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('*, countries(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
  return data || [];
}

export async function addFavorite(userId: string, countryCode: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  return supabase
    .from('favorites')
    .insert({ user_id: userId, country_code: countryCode });
}

export async function removeFavorite(userId: string, countryCode: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  return supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('country_code', countryCode);
}

export async function isFavorite(userId: string, countryCode: string) {
  if (!supabase) return false;
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('country_code', countryCode)
    .single();
  return !!data;
}

export async function getPostViews(slug: string): Promise<number> {
  if (!supabase) return 0;
  const { data } = await supabase
    .from('post_views')
    .select('views')
    .eq('slug', slug)
    .single();
  return data?.views || 0;
}

export async function incrementPostViews(slug: string): Promise<number> {
  if (!supabase) return 0;
  const { data: existing } = await supabase
    .from('post_views')
    .select('views')
    .eq('slug', slug)
    .single();

  if (existing) {
    await supabase
      .from('post_views')
      .update({ views: existing.views + 1, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    return existing.views + 1;
  } else {
    await supabase
      .from('post_views')
      .insert({ slug, views: 1 });
    return 1;
  }
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  country_code?: string;
  start_date?: string;
  end_date?: string;
  days: number;
  budget: string;
  interests: string[];
  itinerary_raw?: string;
  status: 'draft' | 'planned' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getTrips(userId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error getting trips:', error);
    return [];
  }
  return data || [];
}

export async function getTrip(userId: string, tripId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('id', tripId)
    .single();
  if (error) {
    console.error('Error getting trip:', error);
    return null;
  }
  return data;
}

export async function createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { data, error } = await supabase
    .from('trips')
    .insert([trip])
    .select()
    .single();
  return { data, error };
}

export async function updateTrip(
  userId: string,
  tripId: string,
  updates: Partial<Omit<Trip, 'id' | 'user_id' | 'created_at'>>
) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { data, error } = await supabase
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', tripId)
    .select()
    .single();
  return { data, error };
}

export async function deleteTrip(userId: string, tripId: string) {
  if (!supabase) return { error: 'Supabase no configurado' };
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('user_id', userId)
    .eq('id', tripId);
  return { error };
}
