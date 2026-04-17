import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    await supabase!.auth.signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
