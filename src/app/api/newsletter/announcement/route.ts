import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllPosts } from '@/lib/posts';
import { getRecentChanges } from '@/lib/alerts-system';
import { paisesData } from '@/data/paises';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recentPosts = getAllPosts({ sort: 'recent' }).slice(0, 5);
  const changes = getRecentChanges(7);
  const paises = Object.values(paisesData);
  const altoRiesgo = paises.filter((p: any) => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen Semanal - Viaje con Inteligencia</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✈️ Viaje con Inteligencia</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Resumen Semanal</p>
      </div>
      
      <div style="padding: 30px;">
        <p style="margin-top: 0;">¡Hola! Aquí tienes el resumen de esta semana:</p>
        
        <h2 style="color: #60a5fa; font-size: 18px; margin-top: 25px;">📝 Nuevos Artículos</h2>
        <ul style="line-height: 1.8;">
          ${recentPosts.map((post: any) => `
            <li style="margin-bottom: 10px;">
              <a href="https://viaje-con-inteligencia.vercel.app/blog/${post.slug}" style="color: #60a5fa; text-decoration: none;">
                ${post.title}
              </a>
              <span style="color: #94a3b8; font-size: 12px;"> - ${post.readTime || '5 min'}</span>
            </li>
          `).join('')}
        </ul>
        
        ${altoRiesgo.length > 0 ? `
        <h2 style="color: #f97316; font-size: 18px; margin-top: 25px;">⚠️ Países con Riesgo Alto</h2>
        <p style="color: #94a3b8; font-size: 14px;">${altoRiesgo.slice(0, 5).map((p: any) => `${p.bandera} ${p.nombre}`).join(', ')}</p>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; text-align: center;">
          <a href="https://viaje-con-inteligencia.vercel.app/blog" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver Todos los Artículos →
          </a>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">
          ¿No quieres recibir estos emails? <a href="https://viaje-con-inteligencia.vercel.app/api/newsletter/subscribe?action=unsubscribe&token=demo" style="color: #64748b;">Cancelar suscripción</a>
        </p>
      </div>
    </div>
  </body>
</html>
  `;

  const subject = `📬 Resumen Semanal - ${recentPosts.length} nuevos artículos`;

  if (supabase) {
    await supabase.from('newsletter_history').insert({
      subject,
      content: emailHtml,
      recipients_count: 0,
    });
  }

  return NextResponse.json({
    subject,
    preview: emailHtml.substring(0, 500),
    html: emailHtml,
    stats: {
      posts: recentPosts.length,
      high_risk_countries: altoRiesgo.length,
      changes: changes.length,
    }
  });
}