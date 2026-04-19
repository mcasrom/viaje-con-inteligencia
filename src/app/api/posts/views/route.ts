import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }
  
  if (slug) {
    const { data } = await supabase
      .from('post_views')
      .select('views')
      .eq('slug', slug)
      .single();
    return NextResponse.json({ views: data?.views || 0 });
  }
  
  const { data } = await supabase
    .from('post_views')
    .select('slug, views');
  
  const viewsMap: Record<string, number> = {};
  data?.forEach((row: any) => { viewsMap[row.slug] = row.views; });
  
  return NextResponse.json({ views: viewsMap });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug } = body;

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  const { data: existing } = await supabase
    .from('post_views')
    .select('views')
    .eq('slug', slug)
    .single();

  let newCount = 1;
  if (existing) {
    await supabase
      .from('post_views')
      .update({ views: existing.views + 1, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    newCount = existing.views + 1;
  } else {
    await supabase
      .from('post_views')
      .insert({ slug, views: 1 });
  }

  return NextResponse.json({ views: newCount });
}
