import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ signals: [], stats: { total: 0, urgent: 0, firstPerson: 0 } });
  }

  try {
    const [allRes, urgentRes, fpRes] = await Promise.all([
      supabaseAdmin
        .from('osint_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabaseAdmin
        .from('osint_signals')
        .select('id', { count: 'exact', head: true })
        .in('urgency', ['high', 'critical'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabaseAdmin
        .from('osint_signals')
        .select('id', { count: 'exact', head: true })
        .eq('is_first_person', true),
    ]);

    return NextResponse.json({
      signals: allRes.data || [],
      stats: {
        total: allRes.data?.length || 0,
        urgent: urgentRes.count || 0,
        firstPerson: fpRes.count || 0,
      },
    });
  } catch (e) {
    console.error('[OSINT] Fetch error:', e);
    return NextResponse.json({ signals: [], stats: { total: 0, urgent: 0, firstPerson: 0 } });
  }
}
