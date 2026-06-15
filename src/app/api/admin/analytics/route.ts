import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const [cfResult, nginxResult] = await Promise.all([
      supabaseAdmin
        .from('cloudflare_analytics')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12),
      supabaseAdmin
        .from('nginx_traffic_stats')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(12),
    ]);

    if (cfResult.error) {
      return Response.json({ error: cfResult.error.message }, { status: 500 });
    }

    return Response.json({
      weeks:       cfResult.data  || [],
      nginx_weeks: nginxResult.data || [],  // vacío si falla, no es fatal
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
