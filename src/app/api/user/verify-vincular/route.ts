import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

const log = createLogger('VerifyVincular');

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Falta código' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const { data: vincular, error } = await supabaseAdmin
      .from('vincular_codes')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !vincular) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 404 });
    }

    if (vincular.used) {
      return NextResponse.json({ error: 'Código ya usado' }, { status: 400 });
    }

    if (new Date(vincular.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Código expirado. Solicita uno nuevo en @ViajeConInteligenciaBot' }, { status: 400 });
    }

    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        telegram_id: vincular.telegram_chat_id,
        telegram_username: vincular.telegram_username || null,
      }, { onConflict: 'id' });

    await supabaseAdmin
      .from('vincular_codes')
      .update({ used: true })
      .eq('id', vincular.id);

    log.info(`Usuario ${user.id} vinculado con Telegram ${vincular.telegram_chat_id}`);

    return NextResponse.json({ ok: true, linked: true });
  } catch (error) {
    log.error('Error en verify-vincular', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
