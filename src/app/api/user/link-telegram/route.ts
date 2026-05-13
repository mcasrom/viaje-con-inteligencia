import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { telegramId, telegramUsername } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Falta telegramId' }, { status: 400 });
    }

    await supabase.from('profiles').upsert({
      id: user.id,
      telegram_id: Number(telegramId),
      telegram_username: telegramUsername || null,
    }, { onConflict: 'id' });

    return NextResponse.json({ ok: true, linked: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
