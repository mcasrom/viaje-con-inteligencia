import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('newsletter_history')
    .select('id, subject, content, recipients_count, sent_at')
    .order('sent_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'No newsletter found' }, { status: 404 });
  }

  return new NextResponse(data.content, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter-${data.sent_at?.split('T')[0] || 'latest'}.html"`,
    },
  });
}
