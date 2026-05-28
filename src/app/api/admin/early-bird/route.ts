import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('early_bird_digests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ digests: data || [] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
