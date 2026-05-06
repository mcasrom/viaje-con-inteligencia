import { NextResponse } from 'next/server';
import { getAllMAECAlerts, getMAECData } from '@/lib/scraper/maec';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { paisesData } from '@/data/paises';
import { calculateTCI } from '@/data/tci-engine';
import { generateRiskChangeAlert } from '@/lib/alerts-system';
import { fetchAllPosts, classifySignal, detectFirstPerson } from '@/lib/osint-sensor';
import { Resend } from 'resend';

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
    let ok = 0, errors = 0;

    for (const [code] of Object.entries(paisesData)) {
      try {
        await getMAECData(code);
        ok++;
      } catch {
        errors++;
      }
    }

    await supabase.from('scraper_logs').insert({
      source: 'maec_full_scrape', status: errors > 0 ? 'partial' : 'success',
      items_scraped: ok, errors, completed_at: new Date().toISOString(),
    });

    return { status: 'ok', alerts: alerts.length, countries_ok: ok, countries_error: errors };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== RISK ALERTS CHECK =====
async function runRiskCheck(): Promise<any> {
  try {
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
      await supabase.from('oil_price_history').upsert({
        date: new Date().toISOString().split('T')[0], price_usd: oilPrice, source: 'Yahoo',
      }, { onConflict: 'date' });
    }

    const today = new Date().toISOString().split('T')[0];
    let calculated = 0;
    const countries = Object.values(paisesData).filter(p => p.visible !== false);

    for (const pais of countries) {
      const tci = calculateTCI(pais.codigo);
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

    return { status: 'ok', countries_calculated: calculated, oil_price: oilPrice };
  } catch (e: any) {
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

// ===== NEWS SENTIMENT (GDELT + RSS + Groq) =====
async function runNewsSentiment(): Promise<any> {
  try {
    const posts = await fetchAllPosts();
    if (!supabaseAdmin) return { status: 'skipped', reason: 'No supabase' };

    const { data: processedData } = await supabaseAdmin
      .from('osint_signals')
      .select('source_url')
      .not('source_url', 'is', null);

    const processedUrls = new Set(processedData?.map(d => d.source_url) || []);
    const newPosts = posts.filter(p => !processedUrls.has(p.sourceUrl));

    const signals: any[] = [];
    for (const post of newPosts) {
      const isAuthoritative = post.source === 'gdacs' || post.source === 'usgs';
      let classification: any;
      let isFirstPerson = false;

      if (isAuthoritative) {
        const sev = post.severity;
        classification = {
          category: 'clima', confidence: 0.9, isFirstResponder: true,
          urgency: sev === 'red' ? 'critical' : sev === 'orange' ? 'high' : sev === 'green' ? 'medium' : 'low',
          summary: post.title,
        };
      } else {
        classification = await classifySignal(post);
        isFirstPerson = classification?.isFirstResponder || detectFirstPerson(`${post.title} ${post.content}`);
      }

      signals.push({
        source: post.source, source_url: post.sourceUrl, title: post.title.substring(0, 500),
        content: post.content.substring(0, 2000), author: post.author, subreddit: post.subreddit,
        category: classification?.category || 'otro', confidence: classification?.confidence || 0.5,
        is_first_person: isFirstPerson, urgency: classification?.urgency || 'low',
        summary: classification?.summary || post.title, location_name: post.locationName,
        lat: post.lat, lng: post.lng, severity: post.severity, mag: post.mag,
        event_type: post.eventType, post_timestamp: post.timestamp.toISOString(),
      });

      if (!isAuthoritative) await new Promise(r => setTimeout(r, 200));
    }

    let inserted = 0;
    if (signals.length > 0) {
      const { error } = await supabaseAdmin.from('osint_signals').insert(signals);
      if (!error) inserted = signals.length;
    }

    return { status: 'ok', posts_fetched: posts.length, new_posts: newPosts.length, signals_inserted: inserted };
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
${Object.entries(results).filter(([k, v]) => v && (v as any).status !== 'skipped').map(([k, v]) => `├── ${k}: ${(v as any).status === 'ok' ? 'OK' : 'ERROR'}`).join('\n')}

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

// ===== WEEKLY DIGEST (only on Mondays) =====
async function runWeeklyDigest(): Promise<any> {
  const day = new Date().getDay();
  if (day !== 1) return { status: 'skipped', reason: 'Not Monday' };

  try {
    const { data: subs } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('verified', true)
      .is('unsubscribed_at', null);

    if (!subs || subs.length === 0) return { status: 'skipped', reason: 'No subscribers' };

    const { data: alerts } = await supabaseAdmin
      .from('risk_alerts')
      .select('country_code, old_risk, new_risk, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const alertLines = alerts?.map(a => `• ${a.country_code}: ${a.old_risk} → ${a.new_risk}`).join('\n') || 'Sin cambios';

    const digest = `📬 Resumen Semanal - Viaje con Inteligencia
${new Date().toISOString().split('T')[0]}

🔔 Cambios de riesgo esta semana:
${alertLines}

Síguenos: https://t.me/ViajeConInteligencia`;

    if (resend) {
      for (const sub of subs) {
        try {
          await resend.emails.send({
            from: 'Viaje con Inteligencia <newsletter@viajeinteligencia.com>',
            to: sub.email,
            subject: 'Resumen Semanal - Viaje con Inteligencia',
            html: `<pre style="background:#1e293b;padding:16px;border-radius:8px;color:#cbd5e1;font-size:13px;white-space:pre-wrap;">${digest}</pre>`,
          });
        } catch {}
      }
    }

    return { status: 'ok', sent_to: subs.length };
  } catch (e: any) {
    return { status: 'error', error: e.message };
  }
}

// ===== MASTER CRON =====
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Record<string, any> = {};

  console.log('[Master Cron] Starting...');

  // 1. MAEC Scrape
  console.log('[Master] 1/8 MAEC scrape...');
  results.maec = await runMaecScrape();

  // 2. Risk Alerts Check
  console.log('[Master] 2/8 Risk alerts...');
  results.risk_check = await runRiskCheck();

  // 3. Flight Costs / TCI
  console.log('[Master] 3/8 Flight costs...');
  results.flight_costs = await runFlightCosts();

  // 4. Airspace OSINT
  console.log('[Master] 4/8 Airspace OSINT...');
  results.airspace = await runAirspaceOsint();

  // 5. News Sentiment (GDELT + RSS + Groq)
  console.log('[Master] 5/8 News sentiment...');
  results.news_sentiment = await runNewsSentiment();

  // 6. Oil Price
  console.log('[Master] 6/8 Oil price...');
  results.oil = await runOilPrice();

  // 7. Daily Digest
  console.log('[Master] 7/8 Daily digest...');
  results.digest = await runDailyDigest(results);

  // 8. Weekly Digest (Mondays only)
  console.log('[Master] 8/8 Weekly digest...');
  results.weekly = await runWeeklyDigest();

  const elapsed = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    elapsed_ms: elapsed,
    steps: results,
    timestamp: new Date().toISOString(),
  });
}
