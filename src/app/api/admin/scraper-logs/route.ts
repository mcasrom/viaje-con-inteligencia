import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ logs: [], error: 'Supabase no configurado' });
  }

  try {
    const { data, error } = await supabase!
      .from('scraper_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ logs: [], error: error.message });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    return NextResponse.json({ logs: [], error: String(error) });
  }
}