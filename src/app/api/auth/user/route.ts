import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      user: null,
      message: 'Supabase no configurado' 
    });
  }

  try {
    const { data: { user }, error } = await supabase!.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    const { data: profile } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      }
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
