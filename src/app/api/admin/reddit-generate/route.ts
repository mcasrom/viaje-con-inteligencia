import { NextRequest, NextResponse } from 'next/server';
import { groqClient } from '@/lib/groq-ai';
import { createLogger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { extractCountryCodes, getCountryName } from '@/lib/country-name-map';

export const dynamic = 'force-dynamic';
const log = createLogger('RedditGenerate');

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get('mode') || 'general';
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: signals } = await supabase!
      .from('osint_signals')
      .select('tone_score, category, urgency, summary, location_name, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: alerts } = await supabase!
      .from('sentiment_alerts')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    let contextData = '';

    if (alerts && alerts.length > 0) {
      contextData += '🔴 Alertas de sentimiento activas:\n';
      alerts.forEach((a: any) => {
        contextData += `- ${a.country_name}: tone ${a.avg_tone} (${a.signal_count} señales, severidad ${a.severity})\n`;
      });
      contextData += '\n';
    }

    if (signals && signals.length > 0) {
      const byCountry = new Map<string, { total: number; urgent: number; categories: Set<string> }>();
      for (const s of signals) {
        const codes = extractCountryCodes(`${s.location_name || ''} ${s.summary || ''}`);
        for (const code of codes) {
          if (!byCountry.has(code)) byCountry.set(code, { total: 0, urgent: 0, categories: new Set() });
          const entry = byCountry.get(code)!;
          entry.total++;
          if (s.urgency === 'high' || s.urgency === 'critical') entry.urgent++;
          if (s.category) entry.categories.add(s.category);
        }
      }

      const sorted = [...byCountry.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 8);
      if (sorted.length > 0) {
        contextData += '📊 Países con más actividad (7 días):\n';
        sorted.forEach(([code, data]) => {
          const name = getCountryName(code) || code.toUpperCase();
          contextData += `- ${name}: ${data.total} señales (${data.urgent} urgentes) - ${[...data.categories].join(', ')}\n`;
        });
        contextData += '\n';
      }

      const urgent = signals.filter(s => s.urgency === 'critical' || s.urgency === 'high').slice(0, 5);
      if (urgent.length > 0) {
        contextData += '⚠️ Últimas alertas urgentes:\n';
        urgent.forEach((s: any) => {
          const loc = s.location_name || s.summary?.substring(0, 60) || 'N/A';
          contextData += `- [${s.urgency}] ${loc}\n`;
        });
        contextData += '\n';
      }

      const toneMap = new Map<string, number[]>();
      for (const s of signals) {
        if (s.tone_score == null) continue;
        const codes = extractCountryCodes(`${s.location_name || ''} ${s.summary || ''}`);
        for (const code of codes) {
          if (!toneMap.has(code)) toneMap.set(code, []);
          toneMap.get(code)!.push(s.tone_score);
        }
      }
      const worst = [...toneMap.entries()]
        .map(([code, scores]) => ({ code, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 5);
      if (worst.length > 0) {
        contextData += '😟 Países con peor sentimiento:\n';
        worst.forEach(({ code, avg }) => {
          contextData += `- ${getCountryName(code) || code.toUpperCase()}: ${Math.round(avg * 10) / 10}\n`;
        });
        contextData += '\n';
      }
    }

    const isRv = mode === 'rv';
    const systemPrompt = isRv
      ? `Eres un viajero experto en autocaravanas (RV) que comparte datos útiles en Reddit.

Genera un post para el subreddit r/RVLiving en español o inglés (usa español si predominan países hispanos en los datos, inglés si son mayormente US/Canadá).

ENFOQUE RV:
- Clima extremo: huracanes, incendios, tormentas, inundaciones que afectan rutas y campamentos
- Cortes de carretera, cierres de fronteras, protestas que bloquean paso
- Disponibilidad de combustible, propano, áreas de servicio
- Seguridad en áreas de boondocking, robos en campamentos
- Alertas de salud: brotes, calidad del aire, agua potable

REGLAS:
- Tono natural, como un fellow RVer compartiendo experiencia.
- NO menciones "Viaje con Inteligencia" ni URLs directas.
- Máximo 3 párrafos (200-350 palabras).
- Termina con una pregunta abierta tipo "¿Alguna experiencia similar?".
- Título atractivo pero realista (máx 120 chars), sin emojis.

Responde SOLO con JSON:
{
  "title": "título del post",
  "body": "cuerpo del post en markdown"
}`
      : `Eres un viajero experto en seguridad que comparte datos útiles en Reddit.

Genera un post para Reddit (r/travel o r/digitalnomad) en español.

REGLAS:
- Tono natural, útil, sin clickbait. Como un consejo de viajero experimentado.
- NO menciones "Viaje con Inteligencia" ni URLs directas.
- Máximo 3 párrafos (200-350 palabras).
- Termina con una pregunta abierta tipo "¿Alguna experiencia similar?".
- Título atractivo pero realista (máx 120 chars), sin emojis.

Responde SOLO con JSON:
{
  "title": "título del post",
  "body": "cuerpo del post en markdown"
}`;

    const userPrompt = contextData
      ? `Genera un post para Reddit basado en estos datos actuales de seguridad${isRv ? ' para viajeros en autocaravana (RV)' : ' global para viajeros'}:\n\n${contextData}`
      : isRv
        ? 'Genera un post sobre cómo mantenerse informado de riesgos climáticos y de seguridad durante un viaje en autocaravana (RV).'
        : 'Genera un post general sobre cómo mantenerse informado de riesgos al viajar, con consejos prácticos.';

    const response = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 600,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return NextResponse.json({
      title: parsed.title || 'Consejos de seguridad para viajeros',
      body: parsed.body || '',
      contextData,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    log.error('Generate error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
