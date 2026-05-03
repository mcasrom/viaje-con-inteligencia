import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllPosts, getPostSlugs } from '@/lib/posts';
import { paisesData } from '@/data/paises';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_token')?.value;
  const expectedToken = process.env.ADMIN_PASSWORD || 'admin';

  if (authHeader === `Bearer ${expectedToken}` || cookie === expectedToken) {
    return true;
  }
  return false;
}

async function getCronStatus() {
  if (!supabase) return { scrapeMaec: null, checkAlerts: null, ineScrape: null };

  const [scrapeRes, alertsRes, ineRes] = await Promise.all([
    supabase.from('scraper_logs').select('source, status, items_scraped, errors, duration_ms, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('risk_alerts').select('country_code, old_risk, new_risk, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('ine_tourism_history').select('created_at').order('created_at', { ascending: false }).limit(1),
  ]);

  return {
    scrapeMaec: scrapeRes.data || [],
    checkAlerts: alertsRes.data || [],
    ineScrape: ineRes.data?.[0]?.created_at || null,
  };
}

async function getNewsletterStatus() {
  if (!supabase) return { subscribers: 0, history: [], lastSend: null };

  const [subsRes, histRes] = await Promise.all([
    supabase.from('newsletter_subscribers').select('id, email, subscribed_at').order('subscribed_at', { ascending: false }).limit(10),
    supabase.from('newsletter_history').select('subject, content, recipient_count, created_at').order('created_at', { ascending: false }).limit(5),
  ]);

  const countRes = await supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true });

  return {
    subscribers: countRes.count || 0,
    recentSubscribers: subsRes.data || [],
    history: histRes.data || [],
  };
}

async function getSocialMediaStatus() {
  if (!supabase) return { botStats: null, botUsers: 0 };

  const [statsRes, usersRes] = await Promise.all([
    supabase.from('bot_stats').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('bot_users').select('id', { count: 'exact', head: true }),
  ]);

  return {
    botStats: statsRes.data || [],
    botUsers: usersRes.count || 0,
  };
}

async function getUserCount() {
  if (!supabase) return { profiles: 0, trips: 0, favorites: 0 };

  const [profilesRes, tripsRes, favsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('trips').select('id', { count: 'exact', head: true }),
    supabase.from('favorites').select('id', { count: 'exact', head: true }),
  ]);

  return {
    profiles: profilesRes.count || 0,
    trips: tripsRes.count || 0,
    favorites: favsRes.count || 0,
  };
}

function getBlogPostsInfo() {
  const posts = getAllPosts({ sort: 'recent' });
  const slugs = getPostSlugs();
  const noCategory = posts.filter(p => !p.category || p.category === '');
  const noImage = posts.filter(p => !p.image || p.image.trim() === '');
  const noExcerpt = posts.filter(p => !p.excerpt || p.excerpt.trim() === '');

  return {
    total: posts.length,
    slugs,
    recent: posts.slice(0, 5).map(p => ({ slug: p.slug, title: p.title, date: p.date, category: p.category })),
    issues: {
      noCategory: noCategory.map(p => p.slug),
      noImage: noImage.map(p => p.slug),
      noExcerpt: noExcerpt.map(p => p.slug),
    },
  };
}

function getCountryAudit() {
  const entries = Object.entries(paisesData);
  const visible = entries.filter(([, p]) => p.visible !== false);
  const hidden = entries.filter(([, p]) => p.visible === false);
  const queHacerZero = entries.filter(([, p]) => !p.queHacer || p.queHacer.length === 0);
  const queHacerFour = entries.filter(([, p]) => p.queHacer && p.queHacer.length === 4);

  const riskDistribution: Record<string, number> = {};
  entries.forEach(([, p]) => {
    riskDistribution[p.nivelRiesgo] = (riskDistribution[p.nivelRiesgo] || 0) + 1;
  });

  return {
    total: entries.length,
    visible: visible.length,
    hidden: hidden.map(([code, p]) => ({ code, name: p.nombre })),
    riskDistribution,
    queHacerZero: queHacerZero.map(([code, p]) => ({ code, name: p.nombre })),
    queHacerFour: queHacerFour.map(([code, p]) => ({ code, name: p.nombre })),
  };
}

function getHardcodedDataWarnings() {
  const warnings = [
    {
      file: 'src/lib/mastodon.ts',
      issue: 'Mastodon instance URL hardcoded',
      value: 'mastodon.social',
      severity: 'low',
    },
    {
      file: 'src/app/api/newsletter/subscribe/route.ts',
      issue: 'Dummy Resend token fallback',
      value: 're_123456789',
      severity: 'medium',
    },
    {
      file: 'src/data/paises.ts',
      issue: 'Hardcoded economic data (tourism revenue, GDP)',
      value: '$108B, 107 mil millones USD',
      severity: 'low',
    },
    {
      file: 'src/lib/scraper/audit.ts',
      issue: 'In-memory audit log (lost on restart, max 100 entries)',
      value: 'volatile',
      severity: 'high',
    },
    {
      file: 'src/app/api/cron/check-alerts/route.ts',
      issue: 'Change detection uses in-memory lastKnownRisks (lost on restart)',
      value: 'volatile',
      severity: 'high',
    },
    {
      file: 'src/app/api/newsletter/announcement/route.ts',
      issue: 'Newsletter history recipient_count hardcoded to 0',
      value: '0',
      severity: 'medium',
    },
  ];
  return warnings;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [cron, newsletter, social, users, posts, countries, hardcoded] = await Promise.all([
    getCronStatus(),
    getNewsletterStatus(),
    getSocialMediaStatus(),
    getUserCount(),
    getBlogPostsInfo(),
    getCountryAudit(),
    getHardcodedDataWarnings(),
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    cron,
    newsletter,
    social,
    users,
    posts,
    countries,
    hardcoded,
  });
}
