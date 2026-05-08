import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

let client: SupabaseClient | null = null;
let initializing = false;

/**
 * Get or create a Supabase browser client (singleton pattern with race condition prevention)
 * @returns Promise<SupabaseClient> - The Supabase client instance
 */
export async function getBrowserClient(): Promise<SupabaseClient> {
  // If already initialized, return existing client
  if (client) {
    return client;
  }

  // If another coroutine is initializing, wait for it
  if (initializing) {
    while (!client) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return client;
  }

  // Mark as initializing to prevent race conditions
  initializing = true;

  try {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return client;
  } finally {
    initializing = false;
  }
}
