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
