import { supabaseAdmin } from '@/lib/supabase-admin';
import { IPC_DATA } from '@/data/indices';
import { createLogger } from '@/lib/logger';

const log = createLogger('IPC-DB');

export async function syncIPCToSupabase(): Promise<number> {
  const admin = supabaseAdmin;
  if (!admin) {
    log.warn('No supabase admin — skipping IPC sync');
    return 0;
  }

  let synced = 0;
  for (const item of IPC_DATA) {
    const { error } = await admin.from('country_ipc').upsert({
      country_code: item.code.toLowerCase(),
      country_name: item.country,
      ipc_value: item.ipc,
      nivel: item.nivel,
      region: item.region,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'country_code' });

    if (!error) synced++;
    else log.error(`Failed to sync IPC for ${item.code}`, error);
  }

  log.info(`IPC sync: ${synced}/${IPC_DATA.length} countries`);
  return synced;
}

export interface IPCData {
  country_code: string;
  country_name: string;
  ipc_value: string;
  nivel: string;
  region: string;
}

export async function getIPCFromDB(code: string): Promise<IPCData | null> {
  const admin = supabaseAdmin;
  if (!admin) return null;

  try {
    const { data, error } = await admin
      .from('country_ipc')
      .select('*')
      .eq('country_code', code.toLowerCase())
      .maybeSingle();

    if (error || !data) return null;
    return data as IPCData;
  } catch {
    return null;
  }
}

export async function getAllIPCFromDB(): Promise<IPCData[]> {
  const admin = supabaseAdmin;
  if (!admin) return [];

  try {
    const { data } = await admin.from('country_ipc').select('*');
    return (data || []) as IPCData[];
  } catch {
    return [];
  }
}
