import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!client && supabaseUrl && supabaseAnonKey) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient;
  }
  return client;
}

export const supabaseBrowserClient = getBrowserClient();
