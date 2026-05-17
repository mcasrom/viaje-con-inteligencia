import { createHash, randomBytes } from 'crypto';
import { supabaseAdmin } from './supabase-admin';

export interface ApiKeyInfo {
  id: number;
  userId: string;
  name: string;
  keyPrefix: string;
  tier: string;
  active: boolean;
  monthlyLimit: number;
}

export interface VerifyResult {
  valid: boolean;
  key?: ApiKeyInfo;
  error?: string;
  status: number;
  remaining?: number;
  limit?: number;
}

const TIER_LIMITS: Record<string, number> = {
  free: 3000,
  starter: 10000,
  pro: 50000,
  enterprise: 1000000,
};

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(name: string): { key: string; prefix: string; hash: string } {
  const prefix = `vci_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_`;
  const random = randomBytes(24).toString('base64url');
  const key = `${prefix}${random}`;
  return { key, prefix, hash: hashApiKey(key) };
}

export async function verifyApiKey(request: Request): Promise<VerifyResult> {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return { valid: false, error: 'x-api-key header required', status: 401 };
  }

  const hash = hashApiKey(apiKey);
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, name, key_prefix, tier, active, monthly_limit')
    .eq('key_hash', hash)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid API key', status: 401 };
  }

  if (!data.active) {
    return { valid: false, error: 'API key is disabled', status: 403 };
  }

  const keyInfo: ApiKeyInfo = {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    keyPrefix: data.key_prefix,
    tier: data.tier,
    active: data.active,
    monthlyLimit: data.monthly_limit,
  };

  const limit = TIER_LIMITS[data.tier] || data.monthly_limit;

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: usageData } = await supabaseAdmin
    .from('api_usage')
    .select('count')
    .eq('api_key_id', data.id)
    .gte('created_at', firstOfMonth);

  const totalUsed = (usageData || []).reduce((sum, r) => sum + (r.count || 0), 0);

  if (totalUsed >= limit) {
    return {
      valid: false, error: `Monthly limit reached (${limit})`, status: 429,
      key: keyInfo, remaining: 0, limit,
    };
  }

  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return {
    valid: true, key: keyInfo,
    remaining: limit - totalUsed, limit,
    status: 200,
  };
}

export async function logApiUsage(apiKeyId: number, endpoint: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabaseAdmin
    .from('api_usage')
    .select('id, count')
    .eq('api_key_id', apiKeyId)
    .eq('date', today)
    .eq('endpoint', endpoint)
    .maybeSingle();

  if (data) {
    await supabaseAdmin
      .from('api_usage')
      .update({ count: (data.count || 0) + 1 })
      .eq('id', data.id);
  } else {
    await supabaseAdmin
      .from('api_usage')
      .insert({ api_key_id: apiKeyId, date: today, endpoint, count: 1 });
  }
}
