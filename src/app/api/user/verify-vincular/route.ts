import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createLogger } from '@/lib/logger';

const log = createLogger('VerifyVincular');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendTelegramMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
  } catch (e) {
    log.error('Error sending Telegram confirmation', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
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

    if (vincular.expires_at && new Date(vincular.expires_at) < new Date()) {
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
      .from('alert_preferences')
      .update({ user_id: user.id })
      .eq('telegram_chat_id', vincular.telegram_chat_id)
      .is('user_id', null);

    await supabaseAdmin
      .from('vincular_codes')
      .update({ used: true })
      .eq('id', vincular.id);

    log.info(`Usuario ${user.id} vinculado con Telegram ${vincular.telegram_chat_id}`);

    // Notificar al usuario en Telegram que la vinculación fue exitosa
    await sendTelegramMessage(
      vincular.telegram_chat_id,
      `✅ *Cuenta vinculada correctamente*\n\nTu cuenta web ahora está conectada con Telegram. Tus alertas de viaje se sincronizarán automáticamente entre la web y el bot.\n\nPuedes gestionar tus suscripciones desde viajeinteligencia.com/alertas o usando /mis-alertas aquí en el chat.`
    );

    return NextResponse.json({ ok: true, linked: true });
  } catch (error) {
    log.error('Error en verify-vincular', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
