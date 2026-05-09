import { supabaseAdmin } from './supabase-admin';
import { createLogger } from './logger';

const log = createLogger('Alerts');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@viajeinteligencia.com';

export interface AlertEvent {
  type: 'scraper_error' | 'circuit_open' | 'api_failure' | 'risk_change' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  message: string;
  details?: string;
  consecutiveFailures?: number;
}

const CONSECUTIVE_THRESHOLD = 3;
const failureCounts = new Map<string, { count: number; lastNotified: number }>();
const NOTIFY_COOLDOWN = 30 * 60 * 1000;

function shouldNotify(source: string): boolean {
  const entry = failureCounts.get(source);
  if (!entry) return true;
  return Date.now() - entry.lastNotified > NOTIFY_COOLDOWN;
}

export function trackFailure(source: string, message: string): void {
  const entry = failureCounts.get(source) || { count: 0, lastNotified: 0 };
  entry.count++;
  failureCounts.set(source, entry);

  log.warn(`[${source}] failure ${entry.count}/${CONSECUTIVE_THRESHOLD}: ${message}`);

  if (entry.count >= CONSECUTIVE_THRESHOLD && shouldNotify(source)) {
    entry.lastNotified = Date.now();
    fireAlert({
      type: 'scraper_error',
      severity: 'high',
      source,
      message: `Fallo ${entry.count} veces consecutivas`,
      details: message,
      consecutiveFailures: entry.count,
    });
  }
}

export function trackSuccess(source: string): void {
  const entry = failureCounts.get(source);
  if (entry && entry.count >= CONSECUTIVE_THRESHOLD) {
    fireAlert({
      type: 'scraper_error',
      severity: 'low',
      source,
      message: `Recuperado tras ${entry.count} fallos`,
    });
  }
  failureCounts.delete(source);
}

export function trackError(type: AlertEvent['type'], source: string, message: string, details?: string): void {
  fireAlert({ type, severity: 'medium', source, message, details });
}

export function getAllFailureCounts(): Record<string, { count: number }> {
  const result: Record<string, { count: number }> = {};
  for (const [source, entry] of failureCounts) {
    result[source] = { count: entry.count };
  }
  return result;
}

async function fireAlert(event: AlertEvent): Promise<void> {
  try {
    if (supabaseAdmin) {
      await supabaseAdmin.from('alert_events').insert({
        type: event.type,
        severity: event.severity,
        source: event.source,
        message: event.message,
        details: event.details,
        consecutive_failures: event.consecutiveFailures,
        notified: true,
      });
    }
  } catch (err) {
    log.error('Failed to store alert:', err);
  }

  const emoji = event.severity === 'critical' ? '🚨' : event.severity === 'high' ? '⚠️' : event.severity === 'medium' ? '🔶' : '🔵';
  const text = `${emoji} [${event.source}] ${event.message}${event.details ? `\n${event.details}` : ''}`;

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID) {
    try {
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHANNEL_ID,
          text,
          parse_mode: 'HTML',
        }),
      });
    } catch (err) {
      log.error('Failed to send Telegram alert:', err);
    }
  }

  if (event.severity === 'high' || event.severity === 'critical') {
    try {
      if (process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Alertas <sistema@viajeinteligencia.com>',
            to: [ADMIN_EMAIL],
            subject: `[${event.severity.toUpperCase()}] ${event.source}: ${event.message}`,
            text,
          }),
        });
      }
    } catch (err) {
      log.error('Failed to send email alert:', err);
    }
  }

  log.info(`Alert sent: ${event.type} / ${event.source} / ${event.message}`);
}
