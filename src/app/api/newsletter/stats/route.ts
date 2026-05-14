import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('NewsletterStats');

interface ResendEmail {
  id: string;
  opens?: { count: number; unique_count: number };
  clicks?: { count: number; unique_count: number };
}

async function fetchResendStats(resendIds: string[]): Promise<{ opens: number; clicks: number; uniqueOpens: number; uniqueClicks: number }> {
  if (!resendIds.length || !process.env.RESEND_API_KEY) {
    return { opens: 0, clicks: 0, uniqueOpens: 0, uniqueClicks: 0 };
  }

  let totalOpens = 0;
  let totalClicks = 0;
  let totalUniqueOpens = 0;
  let totalUniqueClicks = 0;

  const results = await Promise.allSettled(
    resendIds.map(id =>
      fetch(`https://api.resend.com/emails/${id}`, {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      }).then(r => r.json() as Promise<ResendEmail>)
    )
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const email = result.value;
      totalOpens += email.opens?.count || 0;
      totalUniqueOpens += email.opens?.unique_count || 0;
      totalClicks += email.clicks?.count || 0;
      totalUniqueClicks += email.clicks?.unique_count || 0;
    }
  }

  return { opens: totalOpens, clicks: totalClicks, uniqueOpens: totalUniqueOpens, uniqueClicks: totalUniqueClicks };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  try {
    if (id) {
      const { data } = await supabase
        .from('newsletter_history')
        .select('*')
        .eq('id', id)
        .single();

      if (!data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const resendIds: string[] = data.resend_ids || [];
      const stats = await fetchResendStats(resendIds);

      return NextResponse.json({ ...data, ...stats });
    }

    const { data: history } = await supabase
      .from('newsletter_history')
      .select('id, subject, recipients_count, opens_count, clicks_count, resend_ids, sent_at')
      .order('sent_at', { ascending: false })
      .limit(20);

    if (!history) {
      return NextResponse.json({ history: [] });
    }

    const historyWithStats = await Promise.all(
      history.map(async (h) => {
        const ids: string[] = h.resend_ids || [];
        const stats = ids.length > 0 ? await fetchResendStats(ids) : { opens: h.opens_count || 0, clicks: h.clicks_count || 0, uniqueOpens: 0, uniqueClicks: 0 };
        return { ...h, ...stats };
      })
    );

    return NextResponse.json({ history: historyWithStats });
  } catch (error) {
    log.error('Error fetching newsletter stats', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
