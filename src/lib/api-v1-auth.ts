import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

interface APIKeyInfo {
  id: number;
  name: string;
  rate_limit: number;
  usage_count: number;
}

const apiKeyCache = new Map<string, { info: APIKeyInfo; expires: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
}

async function validateAPIKey(apiKey: string): Promise<{ valid: boolean; info?: APIKeyInfo; error?: string }> {
  const cached = apiKeyCache.get(apiKey);
  if (cached && cached.expires > Date.now()) {
    return { valid: true, info: cached.info };
  }

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, rate_limit, usage_count')
    .eq('key', apiKey)
    .eq('active', true)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid or inactive API key' };
  }

  const info: APIKeyInfo = {
    id: data.id,
    name: data.name,
    rate_limit: data.rate_limit,
    usage_count: data.usage_count || 0,
  };

  apiKeyCache.set(apiKey, { info, expires: Date.now() + 60000 });

  return { valid: true, info };
}

async function logUsage(apiKeyId: number, endpoint: string, method: string, status: number, ip: string) {
  try {
    await supabaseAdmin.from('api_usage_logs').insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status,
      ip,
    });
    // Update usage count
    const { data } = await supabaseAdmin
      .from('api_keys')
      .select('usage_count')
      .eq('id', apiKeyId)
      .single();
    await supabaseAdmin.from('api_keys').update({
      usage_count: (data?.usage_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    }).eq('id', apiKeyId);
  } catch {}
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Content-Type': 'application/json',
  };
}

export async function apiHandler(
  request: NextRequest,
  handler: (info: APIKeyInfo, ip: string) => Promise<NextResponse>,
  endpoint: string
): Promise<NextResponse> {
  const headers = corsHeaders();

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  if (request.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }, { status: 405, headers });
  }

  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required. Use X-API-Key header.', code: 'NO_API_KEY', docs: 'https://www.viajeinteligencia.com/api-endpoints' }, { status: 401, headers });
  }

  const validation = await validateAPIKey(apiKey);
  if (!validation.valid || !validation.info) {
    return NextResponse.json({ error: validation.error, code: 'INVALID_API_KEY' }, { status: 403, headers });
  }

  const ip = getClientIp(request);

  try {
    const response = await handler(validation.info, ip);
    const status = response.status;
    logUsage(validation.info.id, endpoint, 'GET', status, ip);
    return response;
  } catch (err: any) {
    logUsage(validation.info.id, endpoint, 'GET', 500, ip);
    return NextResponse.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, { status: 500, headers });
  }
}
