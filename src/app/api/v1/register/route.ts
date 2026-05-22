import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateApiKey, hashApiKey } from '@/lib/api-auth';
import { createLogger } from '@/lib/logger';

const log = createLogger('ApiRegister');

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email válido requerido' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
    }

    const { key, prefix, hash } = generateApiKey('API Free');
    const limits: Record<string, number> = { free: 100 };

    const { error } = await supabaseAdmin.from('api_keys').insert({
      name: `Free - ${email}`,
      key_hash: hash,
      key_prefix: prefix,
      tier: 'free',
      monthly_limit: limits.free,
    });

    if (error) {
      log.error('Error creating API key', error.message);
      return NextResponse.json({ error: 'Error al generar la key' }, { status: 500 });
    }

    return NextResponse.json({
      key,
      docs: 'https://www.viajeinteligencia.com/api-endpoints',
      usage: 'curl -H "X-API-Key: TU_KEY" https://www.viajeinteligencia.com/api/v1/risk/es',
      limit: '100 requests/mes',
      tier: 'free',
    });
  } catch (e: any) {
    log.error('Register error', e.message);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
