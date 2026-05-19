import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { extractCountryCodes, getCountryName } from '@/lib/country-name-map';
import { publishToTelegramChannel } from '@/lib/social-publisher';

const log = createLogger('SentimentAlert');

const SEVERITY_THRESHOLDS = [
  { max: -10, severity: 'critical', label: '🔴 Crítico' },
  { max: -7, severity: 'high', label: '🟠 Alto' },
  { max: -5, severity: 'medium', label: '🟡 Medio' },
  { max: -3, severity: 'low', label: '🔵 Leve' },
];

const DEDUP_HOURS = 48;

const OBSERVATION_COUNTRIES = [
  'ir', 'il', 'ru', 'ua', 've', 'lb', 'mm', 'af', 'sd', 'ye',
  'es', 'mx', 'co', 'ar',
];
const WAKEUP_DEDUP_DAYS = 14;

export interface SentimentAlert {
  countryCode: string;
  countryName: string;
  avgTone: number;
  signalCount: number;
  severity: string;
  severityLabel: string;
  message: string;
}

export async function detectSentimentAlerts(): Promise<{
  alerts: SentimentAlert[];
  notified: number;
}> {
  if (!supabase) return { alerts: [], notified: 0 };

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dedupWindow = new Date(now.getTime() - DEDUP_HOURS * 60 * 60 * 1000);

  const { data: signals, error } = await supabase
    .from('osint_signals')
    .select('tone_score, location_name, summary, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('tone_score', 'is', null)
    .limit(2000);

  if (error || !signals) {
    log.error('Error fetching signals', error);
    return { alerts: [], notified: 0 };
  }

  const byCountry = new Map<string, number[]>();
  for (const s of signals) {
    if (s.tone_score == null) continue;
    const text = `${s.location_name || ''} ${s.summary || ''}`;
    const codes = extractCountryCodes(text);
    for (const code of codes) {
      if (!byCountry.has(code)) byCountry.set(code, []);
      byCountry.get(code)!.push(s.tone_score);
    }
  }

  const newAlerts: SentimentAlert[] = [];

  for (const [code, tones] of byCountry) {
    if (tones.length < 3) continue;
    const avgTone = Math.round((tones.reduce((a, b) => a + b, 0) / tones.length) * 10) / 10;
    if (avgTone >= -3) continue;

    const threshold = SEVERITY_THRESHOLDS.find(t => avgTone <= t.max);
    if (!threshold) continue;

    const { data: existing } = await supabase
      .from('sentiment_alerts')
      .select('id')
      .eq('country_code', code)
      .gte('created_at', dedupWindow.toISOString())
      .limit(1);

    if (existing && existing.length > 0) continue;

    const countryName = getCountryName(code) || code.toUpperCase();
    const message = `${threshold.label} sentimiento en ${countryName}: ${avgTone > 0 ? '+' : ''}${avgTone} (${tones.length} señales en 7d)`;

    newAlerts.push({
      countryCode: code,
      countryName,
      avgTone,
      signalCount: tones.length,
      severity: threshold.severity,
      severityLabel: threshold.label,
      message,
    });
  }

  // === Observation countries: wake-up detection ===
  for (const code of OBSERVATION_COUNTRIES) {
    if (newAlerts.some(a => a.countryCode === code)) continue;
    const tones = byCountry.get(code);
    if (!tones || tones.length === 0) continue;

    const wakeupWindow = new Date(now.getTime() - WAKEUP_DEDUP_DAYS * 24 * 60 * 60 * 1000);
    const { data: recentWakeup } = await supabase
      .from('sentiment_alerts')
      .select('id')
      .eq('country_code', code)
      .eq('severity', 'info')
      .gte('created_at', wakeupWindow.toISOString())
      .limit(1);

    if (recentWakeup && recentWakeup.length > 0) continue;

    const avgTone = Math.round((tones.reduce((a, b) => a + b, 0) / tones.length) * 10) / 10;
    const countryName = getCountryName(code) || code.toUpperCase();
    newAlerts.push({
      countryCode: code,
      countryName,
      avgTone,
      signalCount: tones.length,
      severity: 'info',
      severityLabel: '🔔 Nueva señal',
      message: `🔔 Señales detectadas en ${countryName}: ${avgTone > 0 ? '+' : ''}${avgTone} medio (${tones.length} señales en 7d) — país en observación ahora tiene datos`,
    });
  }

  if (newAlerts.length === 0) return { alerts: [], notified: 0 };

  const { data: prevAlerts } = await supabase
    .from('sentiment_alerts')
    .select('country_code, avg_tone')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const prevMap = new Map<string, number>();
  if (prevAlerts) {
    for (const a of prevAlerts) {
      if (!prevMap.has(a.country_code)) prevMap.set(a.country_code, Number(a.avg_tone));
    }
  }

  let notified = 0;
  const toInsert: any[] = [];

  for (const alert of newAlerts) {
    toInsert.push({
      country_code: alert.countryCode,
      country_name: alert.countryName,
      avg_tone: alert.avgTone,
      previous_avg_tone: prevMap.get(alert.countryCode) ?? null,
      signal_count: alert.signalCount,
      severity: alert.severity,
      message: alert.message,
      notified: true,
    });
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('sentiment_alerts')
      .insert(toInsert);

    if (insertError) {
      log.error('Insert error', insertError);
    } else {
      notified = toInsert.length;
    }
  }

  if (notified > 0) {
    let tgMessage = `🚨 *Alertas de Sentimiento*\n\n`;
    for (const alert of newAlerts) {
      tgMessage += `${alert.severityLabel} *${alert.countryName}*: ${alert.avgTone > 0 ? '+' : ''}${alert.avgTone}\n`;
      tgMessage += `_${alert.signalCount} señales en 7d_\n\n`;
    }
    tgMessage += `Fuente: GDELT · ${new Date().toLocaleDateString('es-ES')}`;

    try {
      await publishToTelegramChannel(tgMessage);
    } catch (e) {
      log.error('Telegram publish error', e);
    }
  }

  return { alerts: newAlerts, notified };
}
