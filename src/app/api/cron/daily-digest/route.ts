import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const BASE_URL = process.env.APP_BASE_URL || 'https://www.viajeinteligencia.com';
const TO_EMAIL = 'info@viajeinteligencia.com';

async function getUptimeStatus(): Promise<{ status: string; latency: number }> {
  const start = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/`, { 
      method: 'HEAD',
      cache: 'no-store'
    });
    const latency = Date.now() - start;
    return { status: response.ok ? 'online' : 'error', latency };
  } catch {
    return { status: 'offline', latency: Date.now() - start };
  }
}

async function getUserStats() {
  if (!isSupabaseAdminConfigured()) return { total: 0, newToday: 0 };
  
  const today = new Date().toISOString().split('T')[0];
  
  const { count: total } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true });
    
  const { count: newToday } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`);
    
  return { total: total || 0, newToday: newToday || 0 };
}

async function getNewsletterStats() {
  if (!isSupabaseAdminConfigured()) return { total: 0, pending: 0 };
  
  try {
    const { data: all } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('verified, unsubscribed_at');
    
    const verified = all?.filter(s => s.verified && !s.unsubscribed_at).length || 0;
    const pending = all?.filter(s => !s.verified).length || 0;
    
    return { total: verified, pending };
  } catch (e) {
    return { total: 0, pending: 0 };
  }
}

async function getAlertsStats() {
  if (!isSupabaseAdminConfigured()) return { newToday: 0, total: 0 };
  
  const today = new Date().toISOString().split('T')[0];
  
  const { count: newToday } = await supabaseAdmin
    .from('risk_alerts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`);
    
  const { count: total } = await supabaseAdmin
    .from('risk_alerts')
    .select('*', { count: 'exact', head: true });
    
  return { newToday: newToday || 0, total: total || 0 };
}

async function getScraperStats() {
  if (!isSupabaseAdminConfigured()) return { runs: 0, errors: 0 };
  
  const today = new Date().toISOString().split('T')[0];
  
  const { count: runs } = await supabaseAdmin
    .from('scraper_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`);
    
  const { count: errors } = await supabaseAdmin
    .from('scraper_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`)
    .eq('status', 'error');
    
  return { runs: runs || 0, errors: errors || 0 };
}

async function getBotStats() {
  if (!isSupabaseAdminConfigured()) return { users: 0, messages: 0 };
  
  const { count: users } = await supabaseAdmin
    .from('bot_users')
    .select('*', { count: 'exact', head: true });
    
  const { count: messages } = await supabaseAdmin
    .from('bot_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00Z`);
    
  return { users: users || 0, messages: messages || 0 };
}

async function getTravelAlerts() {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/travel?type=summary`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('[TravelAlerts] Error:', e);
    return null;
  }
}

function formatTravelAlertsForTelegram(data: any): string {
  if (!data?.summary) return '';
  
  const { summary, grouped } = data;
  const lines = ['✈️🚂🌧️ *ALERTAS DE VIAJE*', '────────────────'];
  
  if (summary.critical > 0) {
    lines.push(`🔴 CRÍTICAS: ${summary.critical}`);
  }
  if (summary.warning > 0) {
    lines.push(`⚠️ AVISOS: ${summary.warning}`);
  }
  if (summary.ok > 0 && summary.warning === 0 && summary.critical === 0) {
    lines.push('✅ Sin alertas activas');
  }
  
  lines.push('────────────────');
  lines.push(`📊 Total: ${summary.total} | 🟢 OK: ${summary.ok}`);
  
  return lines.join('\n');
}

function formatTravelAlertsForEmail(data: any): string {
  if (!data?.summary) return '';
  
  const { summary, allAlerts } = data;
  const critical = (allAlerts || []).filter((a: any) => a.status === 'critical' || a.level === 'critical');
  const warning = (allAlerts || []).filter((a: any) => a.status === 'warning' || a.level === 'warning');
  
  let html = `<h3>✈️🚂🌧️ Alertas de Viaje</h3>`;
  
  if (summary.critical > 0) {
    html += `<p style="color:#dc2626;font-weight:bold">🔴 Críticas: ${summary.critical}</p>`;
  }
  if (summary.warning > 0) {
    html += `<p style="color:#f59e0b;font-weight:bold">⚠️ Avisos: ${summary.warning}</p>`;
  }
  if (summary.warning === 0 && summary.critical === 0) {
    html += `<p style="color:#22c55e">✅ Sin alertas activas</p>`;
  }
  
  if (critical.length > 0 || warning.length > 0) {
    html += `<ul style="font-size:12px;color:#4b5563">`;
    [...critical, ...warning].slice(0, 10).forEach((a: any) => {
      const emoji = a.status === 'critical' || a.level === 'critical' ? '🔴' : '⚠️';
      const name = a.name || a.code || a.location || 'N/A';
      const delay = a.delay || a.delayMin || '-';
      html += `<li>${emoji} ${name} (${delay}min)</li>`;
    });
    html += `</ul>`;
  }
  
  return html;
}

async function generateDigest() {
  const [uptime, userStats, newsletter, alerts, scraper, bot, travelAlerts] = await Promise.all([
    getUptimeStatus(),
    getUserStats(),
    getNewsletterStats(),
    getAlertsStats(),
    getScraperStats(),
    getBotStats(),
    getTravelAlerts(),
  ]);
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].split(':').slice(0,2).join(':');
  
  const travelAlertsStr = travelAlerts ? formatTravelAlertsForTelegram(travelAlerts) : '';
  
  const digest = `📊 Daily Digest - Viaje con Inteligencia
====================================
🕐 ${dateStr} ${timeStr} UTC

${travelAlertsStr}

✅ SISTEMA
├── Estado: ${uptime.status === 'online' ? '🟢 ONLINE' : '🔴 OFFLINE'}
├── Latencia: ${uptime.latency}ms

👤 USUARIOS
├── Registrados: ${userStats.total}
├── Nuevos hoy: ${userStats.newToday}

📧 NEWSLETTER
├── Suscriptores: ${newsletter.total}
├── Pendientes verificación: ${newsletter.pending}

🔔 ALERTAS
├── Nuevas hoy: ${alerts.newToday}
├── Total: ${alerts.total}

📡 SCRAPER
├── Ejecuciones hoy: ${scraper.runs}
├── Errores: ${scraper.errors}

📱 BOT TELEGRAM
├── Usuarios: ${bot.users}
├── Mensajes hoy: ${bot.messages}

---
Generado: ${now.toISOString()}`;
  
  return { text: digest, html: travelAlerts ? formatTravelAlertsForEmail(travelAlerts) : '' };
}

async function sendDailyEmail(digest: { text: string; html: string }) {
  if (!resend) {
    console.log('[DailyDigest] Resend no configurado');
    return false;
  }
  
  try {
    await resend.emails.send({
      from: 'Viaje con Inteligencia <daily@viajeinteligencia.com>',
      to: TO_EMAIL,
      subject: `📊 Daily Digest - ${new Date().toISOString().split('T')[0]}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0f172a; color: #f8fafc;">
  <div style="background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
    <h1 style="color: #60a5fa; margin: 0 0 16px;">📊 Daily Digest</h1>
    ${digest.html ? `<div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 3px solid #f59e0b;">${digest.html}</div>` : ''}
    <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0; white-space: pre-wrap; font-size: 13px; color: #cbd5e1; line-height: 1.5; font-family: monospace;">${digest.text}</div>
    <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
      Viaje con Inteligencia • <a href="${BASE_URL}" style="color: #60a5fa;">${BASE_URL}</a>
    </p>
  </div>
</body>
</html>
      `,
    });
    return true;
  } catch (error) {
    console.error('[DailyDigest] Error send:', error);
    return false;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const digest = await generateDigest();
    const emailSent = await sendDailyEmail(digest);
    
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
    let telegramSent = false;
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHANNEL_ID) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHANNEL_ID,
            text: digest.text,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        });
        telegramSent = tgRes.ok;
      } catch (e) {
        console.error('[DailyDigest] Telegram error:', e);
      }
    }
    
    return NextResponse.json({
      success: true,
      email: emailSent ? 'enviado' : 'error',
      telegram: telegramSent ? 'enviado' : 'no_configurado',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DailyDigest] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}