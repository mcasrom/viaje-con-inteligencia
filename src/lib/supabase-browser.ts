import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!client && supabaseUrl && supabaseAnonKey) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export const supabaseBrowserClient = getBrowserClient();
