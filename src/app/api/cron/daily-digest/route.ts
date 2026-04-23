import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
  if (!supabaseAdmin) return { total: 0, newToday: 0 };
  
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
  if (!supabaseAdmin) return { total: 0, pending: 0 };
  
  try {
    const { data: all, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('verified, unsubscribed_at');
    
    console.log('[Newsletter] Query result:', { count: all?.length, error });
    
    const verified = all?.filter(s => s.verified && !s.unsubscribed_at).length || 0;
    const pending = all?.filter(s => !s.verified).length || 0;
    
    return { total: verified, pending };
  } catch (e) {
    console.error('[Newsletter] Error:', e);
    return { total: 0, pending: 0 };
  }
}

async function getAlertsStats() {
  if (!supabaseAdmin) return { newToday: 0, total: 0 };
  
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
  if (!supabaseAdmin) return { runs: 0, errors: 0 };
  
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
  if (!supabaseAdmin) return { users: 0, messages: 0 };
  
  const { count: users } = await supabaseAdmin
    .from('bot_users')
    .select('*', { count: 'exact', head: true });
    
  const { count: messages } = await supabaseAdmin
    .from('bot_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00Z`);
    
  return { users: users || 0, messages: messages || 0 };
}

async function generateDigest() {
  const [uptime, userStats, newsletter, alerts, scraper, bot] = await Promise.all([
    getUptimeStatus(),
    getUserStats(),
    getNewsletterStats(),
    getAlertsStats(),
    getScraperStats(),
    getBotStats(),
  ]);
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].split(':').slice(0,2).join(':');
  
  const digest = `📊 Daily Digest - Viaje con Inteligencia
=====================================
🕐 ${dateStr} ${timeStr} UTC

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
  
  return digest;
}

async function sendDailyEmail(digest: string) {
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
    <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 16px 0; white-space: pre-wrap; font-size: 13px; color: #cbd5e1; line-height: 1.5; font-family: monospace;">${digest}</div>
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
    console.log('[DailyDigest] Generando digest...');
    console.log('[DailyDigest] supabaseAdmin:', !!supabaseAdmin);
    console.log('[DailyDigest] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[DailyDigest] SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('[DailyDigest] SERVICE_KEY first10:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10));
    console.log('[DailyDigest] Using placeholder?:', process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('placeholder') || process.env.SUPABASE_SERVICE_KEY?.includes('placeholder'));
    
    const digest = await generateDigest();
    const emailSent = await sendDailyEmail(digest);
    
    return NextResponse.json({
      success: true,
      email: emailSent ? 'enviado' : 'error',
      debug: {
        supabaseAdmin: !!supabaseAdmin,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      digest: digest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DailyDigest] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}