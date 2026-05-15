import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { verifyAdminPassword } from '@/lib/admin-auth';
import { invalidateCache } from '@/lib/paises-db';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';

const log = createLogger('AdminPaises');

function requireAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session')?.value;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const provided = authHeader?.replace('Bearer ', '') || cookie || queryToken || '';
  return verifyAdminPassword(provided);
}

const UpdateSchema = z.object({
  codigo: z.string().min(1).max(10),
  nombre: z.string().min(1).optional(),
  capital: z.string().optional().nullable(),
  continente: z.string().optional().nullable(),
  nivel_riesgo: z.enum(['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto']).optional(),
  ultimo_informe: z.string().optional().nullable(),
  bandera: z.string().optional().nullable(),
  visible: z.boolean().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseAdmin
    .from('paises')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    log.error('Error fetching paises:', error);
    return NextResponse.json({ error: 'Error fetching paises' }, { status: 500 });
  }

  return NextResponse.json({ paises: data || [] });
}

export async function PUT(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);

  if (!parsed.success) {
    log.error('Validation error:', parsed.error.format());
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
  }

  const { codigo, ...fields } = parsed.data;

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };

  if (fields.nombre !== undefined) updateData.nombre = fields.nombre;
  if (fields.capital !== undefined) updateData.capital = fields.capital;
  if (fields.continente !== undefined) updateData.continente = fields.continente;
  if (fields.nivel_riesgo !== undefined) updateData.nivel_riesgo = fields.nivel_riesgo;
  if (fields.ultimo_informe !== undefined) updateData.ultimo_informe = fields.ultimo_informe;
  if (fields.bandera !== undefined) updateData.bandera = fields.bandera;
  if (fields.visible !== undefined) updateData.visible = fields.visible;
  if (fields.data !== undefined) updateData.data = fields.data;

  const { error } = await supabaseAdmin
    .from('paises')
    .upsert({ codigo: codigo.toLowerCase(), ...updateData }, { onConflict: 'codigo' });

  if (error) {
    log.error('Error updating pais:', error);
    return NextResponse.json({ error: 'Error updating pais' }, { status: 500 });
  }

  invalidateCache();
  log.info(`Pais updated: ${codigo}`);

  return NextResponse.json({ success: true });
}
