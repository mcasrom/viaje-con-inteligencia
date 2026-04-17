import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const { data: stats, error } = await supabase!
    .from('bot_stats')
    .select('*')
    .order('last_active', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: commands } = await supabase!
    .from('bot_commands')
    .select('command');

  const commandCounts: Record<string, number> = {};
  commands?.forEach((c: any) => {
    commandCounts[c.command] = (commandCounts[c.command] || 0) + 1;
  });

  return NextResponse.json({
    totalUsers: stats?.length || 0,
    lastActive: stats?.[0]?.last_active || null,
    recentUsers: stats?.slice(0, 10),
    commandCounts,
  });
}