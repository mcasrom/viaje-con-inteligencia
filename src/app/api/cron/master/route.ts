import { NextResponse } from 'next/server';
import { getAllMAECAlerts, getMAECData } from '@/lib/scraper/maec';
import { scrapeUSAdvisories } from '@/lib/scraper/us-state-dept';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';
import { generateRiskChangeAlert } from '@/lib/alerts-system';
import { fetchAllPosts, classifySignal, detectFirstPerson, type ClassifiedSignal, type SignalCategory } from '@/lib/osint-sensor';
import { Resend } from 'resend';
import { detectAndCreateIncidents } from '@/lib/incident-detector';
import { fetchAndStoreEvents } from '@/lib/events-fetch';
import { runMonitorForUser } from '@/lib/seguros/monitor';
import { createLogger } from '@/lib/logger';
const log = createLogger('Master');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
const ADMIN_EMAIL = 'info@viajeinteligencia.com';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// ===== MAEC SCRAPE =====
async function runMaecScrape(): Promise<any> {
  try {
    const alerts = await getAllMAECAlerts();

    // getAllMAECAlerts already scrapes 26 priority countries and caches them.
    // No need to scrape all 107 countries — paisesData provides hardcoded fallback.
    // Just log the scrape result.
    await supabase.from('scraper_logs').insert({
      source: 'maec_full_scrape', status: 'success',
      items_scraped: alerts.length, errors: 0, completed_at: new Date().toISOString(),
    });

    return { status: 'ok', alerts: alerts.length, countries_checked: 26 };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== US STATE DEPT SCRAPE =====
async function runUSStateDept(): Promise<any> {
  try {
    const result = await scrapeUSAdvisories();
    await supabase.from('scraper_logs').insert({
      source: 'us_state_dept', status: result.errors > 0 ? 'partial' : 'success',
      items_scraped: result.stored, items_failed: result.errors,
      completed_at: new Date().toISOString(),
    });
    return { status: 'ok', stored: result.stored, errors: result.errors, total: result.total };
  } catch (e: any) {
    await supabase.from('scraper_logs').insert({
      source: 'us_state_dept', status: 'error', error_message: e.message,
      completed_at: new Date().toISOString(),
    });
    return { status: 'error', error: e.message };
  }
}

// ===== RISK ALERTS CHECK =====
async function runRiskCheck(): Promise<any> {
  try {
    // Save daily MAEC risk snapshot for ALL countries
    const today = new Date().toISOString().split('T')[0];
    for (const [code, pais] of Object.entries(paisesData)) {
      if (code === 'cu') continue;
      await supabase.from('maec_risk_history').upsert({
        country_code: code,
        nivel_riesgo: pais.nivelRiesgo,
        date: today,
      }, { onConflict: 'country_code,date' });
    }

    const { data: latest } = await supabase
      .from('maec_risk_history')
      .select('country_code, nivel_riesgo')
      .order('date', { ascending: false })
      .limit(1000);

    const riskMap: Record<string, string> = {};
    for (const row of latest || []) {
      if (!riskMap[row.country_code]) riskMap[row.country_code] = row.nivel_riesgo;
    }

    const changes: any[] = [];
    for (const [code, pais] of Object.entries(paisesData)) {
      const oldRisk = riskMap[code];
      if (oldRisk && oldRisk !== pais.nivelRiesgo) {
        changes.push({ code, oldRisk, newRisk: pais.nivelRiesgo });
      }
    }

    for (const change of changes) {
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID) {
        const msg = generateRiskChangeAlert(change.code, change.oldRisk, change.newRisk);
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHANNEL_ID, text: msg, parse_mode: 'Markdown', disable_web_page_preview: true }),
        });
      }
      await supabase.from('risk_alerts').insert({
        country_code: change.code, old_risk: change.oldRisk, new_risk: change.newRisk,
        alert_sent: true, source: 'master_cron',
      });
    }

    return { status: 'ok', changes: changes.length };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== FLIGHT COSTS / TCI =====
async function runFlightCosts(): Promise<any> {
  try {
    let oilPrice: number | null = null;
    try {
      const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1d&interval=1d', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        oilPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
      }
    } catch {}

    if (oilPrice) {
      await supabase.from('oil_prices_history').upsert({
        date: new Date().toISOString().split('T')[0], price_usd: oilPrice, source: 'Yahoo',
      }, { onConflict: 'date' });
    }

    const [{ data: oilHistory }, { data: seasonalityRows }, { data: closures }, { data: routes }, { data: usRiskRows }, { data: demandShiftRows }] = await Promise.all([
      supabase.from('oil_prices_history').select('date, price_usd').order('date', { ascending: true }),
      supabase.from('seasonality').select('country_code, month, index_value'),
      supabase.from('airspace_closures').select('*').eq('is_active', true),
      supabase.from('affected_routes').select('*').eq('is_active', true),
      supabase.from('external_risk').select('country_code, risk_level').eq('source', 'us_state_dept'),
      supabase.from('demand_shifts').select('country_code, extra_demand_pct, reason').eq('is_active', true),
    ]);

    const liveOilHistory = (oilHistory || []).map(o => ({ month: o.date.slice(0, 7), price: Number(o.price_usd) }));
    const liveSeasonality: Record<string, Record<string, number>> = {};
    for (const row of (seasonalityRows || [])) {
      if (!liveSeasonality[row.country_code]) liveSeasonality[row.country_code] = {};
      liveSeasonality[row.country_code][String(row.month)] = Number(row.index_value);
    }
    const liveClosures = (closures || []).map((c: any) => ({
      code: c.code, name: c.name, closureDate: c.closure_date, reason: c.reason, severity: c.severity,
      isActive: c.is_active, notes: c.notes || '',
    }));
    const liveRoutes = (routes || []).map((r: any) => ({
      destination: r.destination, countryCode: r.country_code, closedAirspace: r.closed_airspace,
      detourKm: r.detour_km, fuelSurchargePct: Number(r.fuel_surcharge_pct),
      timeExtraHours: Number(r.time_extra_hours), alternativeRoute: r.alternative_route, isActive: r.is_active,
    }));
    const usRiskMap: Record<string, number> = {};
    for (const row of (usRiskRows || [])) {
      usRiskMap[row.country_code] = Number(row.risk_level);
    }
    const liveDemandShifts: Record<string, { extraDemandPct: number; reason: string }> = {};
    for (const row of (demandShiftRows || [])) {
      liveDemandShifts[row.country_code] = { extraDemandPct: Number(row.extra_demand_pct), reason: row.reason };
    }
    const liveData = {
      seasonality: Object.keys(liveSeasonality).length > 0 ? liveSeasonality : undefined,
      oilHistory: liveOilHistory.length > 0 ? liveOilHistory : undefined,
      oilPrice: oilPrice ?? undefined,
      airspaceClosures: liveClosures.length > 0 ? liveClosures : undefined,
      affectedRoutes: liveRoutes.length > 0 ? liveRoutes : undefined,
      usRiskMap: Object.keys(usRiskMap).length > 0 ? usRiskMap : undefined,
      demandShifts: Object.keys(liveDemandShifts).length > 0 ? liveDemandShifts : undefined,
    };

    const today = new Date().toISOString().split('T')[0];
    let calculated = 0;
    const countries = Object.values(paisesData).filter(p => p.visible !== false);

    for (const pais of countries) {
      const tci = calculateTCI(pais.codigo, liveData.seasonality, liveData);
      await supabase.from('flight_tci_cache').upsert({
        country_code: pais.codigo, tci_value: tci.tci, tci_trend: tci.trend,
        demand_idx: tci.demandIdx, oil_idx: tci.oilIdx, seasonality_idx: tci.seasonalityIdx,
        ipc_idx: tci.ipcIdx, risk_idx: tci.riskIdx, recommendation: tci.recommendation,
        last_calculated: new Date().toISOString(),
      }, { onConflict: 'country_code' });

      await supabase.from('tci_history').insert({
        date: today, country_code: pais.codigo, tci_value: tci.tci, tci_trend: tci.trend,
        demand_idx: tci.demandIdx, oil_idx: tci.oilIdx, seasonality_idx: tci.seasonalityIdx,
        ipc_idx: tci.ipcIdx, risk_idx: tci.riskIdx, oil_price_usd: oilPrice, conflict_surcharge: 0,
      });
      calculated++;
    }

    await supabase.from('scraper_logs').insert({
      source: 'flight_costs', status: calculated > 0 ? 'success' : 'partial',
      items_scraped: calculated, errors: 0, completed_at: new Date().toISOString(),
    });

    return { status: 'ok', countries_calculated: calculated, oil_price: oilPrice };
  } catch (e: any) {
    await supabase.from('scraper_logs').insert({
      source: 'flight_costs', status: 'error', error_message: e.message,
      completed_at: new Date().toISOString(),
    });
    return { status: 'error', error: e.message };
  }
}

// ===== AIRSPACE OSINT =====
async function runAirspaceOsint(): Promise<any> {
  try {
    const closures = [
      { country_code: 'RU', country_name: 'Rusia', reason: 'Conflicto Ucrania', severity: 'critical' },
      { country_code: 'UA', country_name: 'Ucrania', reason: 'Conflicto armado activo', severity: 'critical' },
      { country_code: 'SY', country_name: 'Siria', reason: 'Zona de guerra', severity: 'high' },
      { country_code: 'LY', country_name: 'Libia', reason: 'Inestabilidad', severity: 'high' },
      { country_code: 'YE', country_name: 'Yemen', reason: 'Conflicto armado', severity: 'high' },
      { country_code: 'AF', country_name: 'Afganistán', reason: 'Control Talibán', severity: 'high' },
      { country_code: 'IQ', country_name: 'Irak', reason: 'Zona de conflicto', severity: 'medium' },
      { country_code: 'SO', country_name: 'Somalia', reason: 'Inestabilidad', severity: 'medium' },
      { country_code: 'SD', country_name: 'Sudán', reason: 'Conflicto interno', severity: 'high' },
      { country_code: 'IR', country_name: 'Irán', reason: 'Tensiones geopolíticas', severity: 'medium' },
    ];

    const { data: existing } = await supabase.from('airspace_closures').select('country_code, is_active');
    const existingMap = new Map((existing || []).map((c: any) => [c.country_code, c.is_active]));
    let changes = 0;

    for (const closure of closures) {
      if (!existingMap.has(closure.country_code)) {
        await supabase.from('airspace_closures').insert({
          country_code: closure.country_code, country_name: closure.country_name,
          closure_date: new Date().toISOString().split('T')[0], reason: closure.reason,
          severity: closure.severity, is_active: true,
        });
        changes++;
      }
    }

    await supabase.from('scraper_logs').insert({
      source: 'osint_airspace', status: 'success', items_scraped: closures.length,
      duration_ms: 0, completed_at: new Date().toISOString(),
    });

    return { status: 'ok', closures_checked: closures.length, changes };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== NEWS SENTIMENT (GDELT + RSS: keyword-only, Reddit: Groq) =====
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  salud: ['outbreak', 'disease', 'epidemic', 'sick', 'hospital', 'virus', 'brotes', 'enfermedad', 'fallecido', 'herido', 'intoxicacion'],
  clima: ['earthquake', 'flood', 'hurricane', 'cyclone', 'tsunami', 'volcano', 'storm', 'wildfire', 'terremoto', 'inundacion', 'incendio', 'tormenta'],
  seguridad: ['bomb', 'shooting', 'attack', 'terrorist', 'robbed', 'attacked', 'atentado', 'tiroteo', 'robo', 'violencia'],
  logistico: ['strike', 'cancel', 'airport', 'flight', 'closure', 'blocked', 'shutdown', 'huelga', 'vuelo cancelado', 'cierre', 'bloqueado'],
  geopolitico: ['protest', 'riot', 'crisis', 'conflict', 'war', 'border', 'manifestacion', 'disturbio', 'conflicto', 'frontera', 'guerra'],
};

const URGENCY_KEYWORDS: Record<string, string[]> = {
  critical: ['dead', 'killed', 'evacuat', 'tsunami', 'bomb', 'terrorist', 'war', 'fallecido', 'muerto', 'evacuacion'],
  high: ['emergency', 'attack', 'shooting', 'earthquake', 'hurricane', 'outbreak', 'emergencia', 'atentado', 'terremoto'],
  medium: ['protest', 'strike', 'closure', 'cancel', 'warning', 'huelga', 'cierre', 'cancelado', 'advertencia'],
};

function classifyByKeywords(text: string, toneScore?: number): ClassifiedSignal {
  const lower = text.toLowerCase();
  let category = 'otro' as SignalCategory;
  let maxCatScore = 0;
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = kws.filter(kw => lower.includes(kw)).length;
    if (score > maxCatScore) { maxCatScore = score; category = cat as SignalCategory; }
  }

  let urgency = 'low' as ClassifiedSignal['urgency'];
  const urgOrder: ClassifiedSignal['urgency'][] = ['low', 'medium', 'high', 'critical'];
  for (const [urg, kws] of Object.entries(URGENCY_KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) {
      const idx = urgOrder.indexOf(urg as any);
      if (idx > urgOrder.indexOf(urgency)) urgency = urg as any;
    }
  }

  // GDELT tone adjustment: very negative = higher urgency
  if (toneScore !== undefined && toneScore < -5) {
    const idx = urgOrder.indexOf(urgency);
    urgency = urgOrder[Math.min(idx + 1, urgOrder.length - 1)];
  }
  if (toneScore !== undefined && toneScore < -10) {
    const idx = urgOrder.indexOf(urgency);
    urgency = urgOrder[Math.min(idx + 1, urgOrder.length - 1)];
  }

  const toneConfidence = toneScore !== undefined ? Math.min(0.9, 0.5 + Math.abs(toneScore) / 100) : undefined;

  return {
    category, confidence: toneConfidence || (maxCatScore > 1 ? 0.85 : 0.6),
    isFirstResponder: false, urgency, summary: text.substring(0, 200),
  };
}

async function runNewsSentiment(): Promise<any> {
  try {
    const posts = await fetchAllPosts();
    if (!isSupabaseAdminConfigured()) return { status: 'skipped', reason: 'No supabase' };

    // Only process last 72h to avoid stale posts
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const recentPosts = posts.filter(p => p.timestamp >= cutoff);

    const { data: processedData } = await supabaseAdmin
      .from('osint_signals')
      .select('source_url')
      .not('source_url', 'is', null);

    const processedUrls = new Set(processedData?.map(d => d.source_url) || []);
    const newPosts = recentPosts.filter(p => !processedUrls.has(p.sourceUrl));

    // Cap at 20 to prevent timeout
    const toProcess = newPosts.slice(0, 20);

    const signals: any[] = [];
    for (const post of toProcess) {
      const isAuthoritative = post.source === 'gdacs' || post.source === 'usgs';
      let classification: ClassifiedSignal;
      let isFirstPerson = false;

      if (isAuthoritative) {
        const sev = post.severity;
        classification = {
          category: 'clima', confidence: 0.9, isFirstResponder: true,
          urgency: sev === 'red' ? 'critical' : sev === 'orange' ? 'high' : sev === 'green' ? 'medium' : 'low',
          summary: post.title,
        };
      } else if (post.source === 'gdelt' || post.source === 'rss') {
        // News sources: keyword classification + tone adjustment
        classification = classifyByKeywords(`${post.title} ${post.content}`, post.toneScore);
      } else {
        // Reddit: use Groq (first-person experience matters)
        try {
          classification = await classifySignal(post);
          isFirstPerson = classification?.isFirstResponder || detectFirstPerson(`${post.title} ${post.content}`);
        } catch {
          classification = classifyByKeywords(`${post.title} ${post.content}`, post.toneScore);
        }
      }

      signals.push({
        source: post.source, source_url: post.sourceUrl, title: post.title.substring(0, 500),
        content: post.content.substring(0, 2000), author: post.author, subreddit: post.subreddit,
        category: classification?.category || 'otro', confidence: classification?.confidence || 0.5,
        is_first_person: isFirstPerson, urgency: classification?.urgency || 'low',
        summary: classification?.summary || post.title, location_name: post.locationName,
        lat: post.lat, lng: post.lng, severity: post.severity, mag: post.mag,
        event_type: post.eventType, post_timestamp: post.timestamp.toISOString(),
        tone_score: post.toneScore,
      });
    }

    let inserted = 0;
    if (signals.length > 0) {
      const { error } = await supabaseAdmin.from('osint_signals').insert(signals);
      if (error) {
        log.error('Insert error:', { message: error.message, details: error.details, hint: error.hint });
        // Try one-by-one to skip duplicates
        for (const sig of signals) {
          try {
            const { error: e2 } = await supabaseAdmin.from('osint_signals').insert(sig);
            if (!e2) inserted++;
          } catch {}
        }
      } else {
        inserted = signals.length;
      }
    }

    return { status: 'ok', posts_fetched: posts.length, recent: recentPosts.length, new: newPosts.length, processed: toProcess.length, signals_inserted: inserted };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== OIL PRICE =====
async function runOilPrice(): Promise<any> {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?range=1d&interval=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 30 && price < 200) {
        const rounded = Math.round(price * 100) / 100;
        await supabase.from('oil_prices_history').upsert({
          date: new Date().toISOString().split('T')[0], price_usd: rounded, source: 'Yahoo',
        }, { onConflict: 'date' });
        return { status: 'ok', price: rounded };
      }
    }
    return { status: 'no_data' };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== DAILY DIGEST =====
async function runDailyDigest(results: any): Promise<any> {
  try {
    const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
    const { count: totalSubs } = await supabaseAdmin.from('newsletter_subscribers').select('*', { count: 'exact', head: true });
    const { count: alertsToday } = await supabaseAdmin.from('risk_alerts').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]);

    const summary = `📊 Daily Digest - Viaje con Inteligencia
🕐 ${new Date().toISOString().split('T')[0]}

📡 RESULTADOS HOY:
${Object.entries(results).filter(([k, v]) => v && (v as any).status !== 'skipped').map(([k, v]) => `├── ${k}: ${(v as any).status === 'ok' || (v as any).status === 'fired' ? 'OK' : 'ERROR'}`).join('\n')}

👤 USUARIOS: ${totalUsers || 0}
📧 NEWSLETTER: ${totalSubs || 0}
🔔 ALERTAS HOY: ${alertsToday || 0}
`;

    // Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHANNEL_ID, text: summary, parse_mode: 'Markdown' }),
        });
      } catch {}
    }

    // Email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Viaje con Inteligencia <daily@viajeinteligencia.com>',
          to: ADMIN_EMAIL,
          subject: `Daily Digest - ${new Date().toISOString().split('T')[0]}`,
          html: `<pre style="background:#1e293b;padding:16px;border-radius:8px;color:#cbd5e1;font-size:13px;">${summary}</pre>`,
        });
      } catch {}
    }

    return { status: 'ok' };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== SUBSCRIBERS =====
async function getSubscribers(): Promise<Array<{ email: string; name: string }>> {
  if (!isSupabaseAdminConfigured()) return [];
  const { data } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email, name')
    .eq('verified', true)
    .order('created_at', { ascending: true });
  return (data || []).map((d: any) => ({ email: d.email, name: d.name || 'Usuario' }));
}

// ===== WEEKLY DIGEST (only on Mondays) =====
async function runWeeklyDigest(): Promise<any> {
  const day = new Date().getDay();
  if (day !== 1) return { status: 'skipped', reason: 'Not Monday' };

  try {
    const { collectNewsletterData, buildWeeklyEmailHtml } = await import('@/lib/newsletter-generator');

    if (!resend) return { status: 'skipped', reason: 'No resend API key' };

    const subscribers = await getSubscribers();
    if (subscribers.length === 0) return { status: 'skipped', reason: 'No subscribers' };

    const issue = await collectNewsletterData();
    const baseHtml = await buildWeeklyEmailHtml(issue);

    let sent = 0, errors = 0;
    for (const sub of subscribers) {
      try {
        const html = baseHtml.replace('{{EMAIL}}', encodeURIComponent(sub.email));
        await resend.emails.send({
          from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
          to: sub.email,
          subject: `Briefing Semanal #${issue.edition} — ${issue.weekDate}`,
          html,
        });
        sent++;
        await new Promise(r => setTimeout(r, 300));
      } catch {
        errors++;
      }
    }

    return { status: 'ok', sent, errors, edition: issue.edition };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== EXPIRE TRIALS =====
async function expireTrials(): Promise<any> {
  try {
    const now = new Date().toISOString();

    const { data: expired, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username')
      .lt('trial_end', now)
      .eq('is_premium', true);

    if (error) return { status: 'error', message: error.message };
    if (!expired || expired.length === 0) return { status: 'ok', expired: 0 };

    const ids = expired.map(p => p.id);

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_premium: false, subscription_status: 'trial_expired' })
      .in('id', ids);

    if (updateError) return { status: 'error', message: updateError.message };

    return { status: 'ok', expired: expired.length };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== TRIAL NOTIFICATIONS =====
async function runTrialNotifications(): Promise<any> {
  try {
    if (!resend) return { status: 'skipped', reason: 'No resend API key' };

    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, trial_end, is_premium, username')
      .eq('is_premium', true)
      .not('trial_end', 'is', null)
      .filter('trial_end', 'gte', now.toISOString())
      .filter('trial_end', 'lte', twoDaysFromNow.toISOString());

    if (error) return { status: 'error', message: error.message };
    if (!profiles || profiles.length === 0) return { status: 'ok', sent: 0 };

    let sentCount = 0;
    const today = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const profile of profiles) {
      const trialEnd = new Date(profile.trial_end);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpiringToday = trialEnd <= today;

      try {
        await resend.emails.send({
          from: 'Viaje con Inteligencia <notificaciones@viajeinteligencia.com>',
          to: profile.email,
          subject: isExpiringToday
            ? 'Tu prueba gratuita termina HOY'
            : `Tu prueba gratuita termina en ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a);border-radius:16px;padding:32px;text-align:center;">
              <h1 style="color:#f59e0b;font-size:24px;margin:0 0 16px;">${isExpiringToday ? 'Tu prueba termina HOY!' : 'Tu prueba termina pronto'}</h1>
              <p style="color:#e2e8f0;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Tu prueba gratuita termina ${isExpiringToday ? 'hoy' : `en ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`}.
              </p>
              <a href="${BASE_URL}/premium" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#f97316);color:#0f172a;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
                Activar Premium
              </a>
            </div>
          </div>`,
        });
        sentCount++;
      } catch { /* skip */ }
    }

    return { status: 'ok', sent: sentCount, total: profiles.length };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== INSURANCE MONITOR (weekly, for all premium users) =====
async function runInsuranceMonitor(): Promise<any> {
  const day = new Date().getDay();
  if (day !== 1) return { status: 'skipped', reason: 'Not Monday' };

  try {
    const { data: premiumUsers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .or('is_premium.eq.true,subscription_status.eq.active');

    if (!premiumUsers || premiumUsers.length === 0) {
      return { status: 'ok', checked: 0 };
    }

    let totalAlerts = 0;
    for (const user of premiumUsers) {
      const alerts = await runMonitorForUser(user.id);
      totalAlerts += alerts;
    }

    return { status: 'ok', checked: premiumUsers.length, alerts_generated: totalAlerts };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== EVENTS FETCH (Wikidata + GDELT + Groq) =====
async function runEventsFetch(): Promise<any> {
  log.info('Events fetch + enrich...');
  try {
    const result = await fetchAndStoreEvents();
    return {
      status: 'ok',
      wikidata_events: result.wikidata,
      gdelt_events: result.gdelt,
      total_enriched: result.enriched,
      errors: result.errors.length > 0 ? result.errors.slice(0, 5) : [],
    };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== MODEL TRAINING (fire-and-forget to dedicated endpoint) =====
async function runModelTraining(): Promise<any> {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return { status: 'skipped', reason: 'No CRON_SECRET' };
    const baseUrl = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
    fetch(`${baseUrl}/api/cron/train-models`, {
      headers: { 'Authorization': `Bearer ${cronSecret}` },
    }).catch(() => {});
    return { status: 'fired', note: 'Training started asynchronously' };
  } catch {
    return { status: 'fired', note: 'Training triggered' };
  }
}

// ===== MASTER CRON =====
async function withTimeout<T>(fn: () => Promise<T>, ms: number, label: string): Promise<T | { status: 'error'; error: string }> {
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
    ]);
  } catch (e: any) {
    log.error(`${label} failed:`, e);
    return { status: 'error', error: e.message };
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Record<string, any> = {};

  log.info('Starting...');

  // Phase 1: Independent tasks (run in parallel)
  // MAEC scrape (90s), US State Dept (20s), Airspace OSINT (30s), Oil Price (15s), Events (90s)
  const [maecRes, usStateDeptRes, airspaceRes, oilRes, eventsRes, modelTrainingRes] = await Promise.all([
    withTimeout(() => runMaecScrape(), 90000, '1/8 MAEC scrape'),
    withTimeout(() => runUSStateDept(), 20000, '1b/8 US State Dept'),
    withTimeout(() => runAirspaceOsint(), 30000, '4/8 Airspace OSINT'),
    withTimeout(() => runOilPrice(), 15000, '6/8 Oil price'),
    withTimeout(() => runEventsFetch(), 120000, '6c/8 Events intelligence'),
    withTimeout(() => runModelTraining(), 5000, '6/8 Model training'),
  ]);
  results.maec = maecRes;
  results.us_state_dept = usStateDeptRes;
  results.airspace = airspaceRes;
  results.oil = oilRes;
  results.events = eventsRes;
  results.model_training = modelTrainingRes;

  // Phase 2: Depends on Phase 1 results
  // Risk check (needs MAEC data), Flight costs (needs oil price)
  const [riskRes, flightRes] = await Promise.all([
    withTimeout(() => runRiskCheck(), 30000, '2/8 Risk alerts'),
    withTimeout(() => runFlightCosts(), 60000, '3/8 Flight costs'),
  ]);
  results.risk_check = riskRes;
  results.flight_costs = flightRes;

  // Phase 3: News sentiment (most variable, isolated timeout)
  log.info('5/8 News sentiment...');
  results.news_sentiment = await withTimeout(() => runNewsSentiment(), 90000, '5/8 News sentiment');

  // Phase 3b: Incident detection (clusters signals → actionable incidents)
  log.info('5b/8 Incident detection...');
  results.incidents = await withTimeout(
    async () => detectAndCreateIncidents(),
    15000,
    '5b/8 Incident detection'
  );

  // Phase 4: Digests and notifications (always run last)
  log.info('7/8 Daily digest...');
  results.digest = await withTimeout(() => runDailyDigest(results), 30000, '7/8 Daily digest');

  log.info('7a/8 Expire trials...');
  results.expire_trials = await withTimeout(() => expireTrials(), 15000, '7a/8 Expire trials');

  log.info('7b/8 Trial notifications...');
  results.trial_notifications = await withTimeout(() => runTrialNotifications(), 15000, '7b/8 Trial notifications');

  log.info('8/8 Weekly digest...');
  results.weekly = await withTimeout(() => runWeeklyDigest(), 30000, '8/8 Weekly digest');

  log.info('8b/8 Insurance monitor...');
  results.insurance_monitor = await withTimeout(() => runInsuranceMonitor(), 30000, '8b/8 Insurance monitor');

  const elapsed = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    elapsed_ms: elapsed,
    steps: results,
    timestamp: new Date().toISOString(),
  });
}
