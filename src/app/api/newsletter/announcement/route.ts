import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { getAllPosts } from '@/lib/posts';
import { sendTelegramMessage } from '@/lib/telegram-channel';
import { collectNewsletterData, buildWeeklyEmailHtml } from '@/lib/newsletter-generator';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ===== TELEGRAM: send recent posts =====
  const recentPosts = getAllPosts({ sort: 'recent' }).slice(0, 5);
  const telegramResults: boolean[] = [];
  for (const post of recentPosts) {
    const hashtags = post.tags?.map((t: string) => `#${t.replace(/\s+/g, '')}`).join(' ') || '#ViajeInteligencia #España';
    const telegramPost = `📝 *${post.title}*\n\n${post.excerpt?.slice(0, 150)}...\n\n🔗 https://viajeinteligencia.com/blog/${post.slug}\n\n${hashtags}`;
    const tgResult = await sendTelegramMessage(telegramPost);
    telegramResults.push(tgResult);
  }

  // ===== GENERATE professional newsletter =====
  const issue = await collectNewsletterData();
  const html = await buildWeeklyEmailHtml(issue);
  const subject = `Briefing Semanal #${issue.edition} — ${issue.weekDate}`;

  // ===== FETCH verified subscribers =====
  const { data: subscribers } = isSupabaseAdminConfigured()
    ? await supabaseAdmin!.from('newsletter_subscribers').select('email, name').eq('verified', true).order('subscribed_at', { ascending: true })
    : { data: null };
  const totalRecipients = subscribers?.length || 0;

  // ===== SAVE to history =====
  if (supabase) {
    await supabase.from('newsletter_history').insert({
      subject,
      content: html,
      recipients_count: totalRecipients,
    });
  }

  // ===== BATCH SEND to verified subscribers =====
  let sent = 0;
  let errors = 0;

  if (resend && subscribers && subscribers.length > 0) {
    for (const sub of subscribers) {
      try {
        const personalizedHtml = html.replace('{{EMAIL}}', encodeURIComponent(sub.email));
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
            to: sub.email,
            subject,
            html: personalizedHtml,
            open_tracking: true,
            click_tracking: true,
          }),
        });
        sent++;
        await new Promise(r => setTimeout(r, 300));
      } catch {
        errors++;
      }
    }
  }

  return NextResponse.json({
    subject,
    stats: {
      posts: recentPosts.length,
      high_risk_countries: issue.newAlerts + (issue.countryAlerts?.filter(a => a.type === 'alert').length || 0),
      changes: issue.irvChanges,
      alerts: issue.newAlerts,
      destination: !!issue.destinationSpotlight,
      qa: !!issue.weeklyQuestion,
    },
    email: { sent, errors },
    telegram: {
      sent: telegramResults.filter(Boolean).length,
      failed: telegramResults.filter(f => !f).length,
    },
  });
}
