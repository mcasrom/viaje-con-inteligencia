import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: history } = await supabaseAdmin
      .from('model_training_log')
      .select('*')
      .order('id', { ascending: false })
      .limit(30);

    return NextResponse.json({
      history: history || [],
    });
  } catch {
    return NextResponse.json({ history: [] });
  }
}
