import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cloudflare_analytics')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(12);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ weeks: data || [] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
