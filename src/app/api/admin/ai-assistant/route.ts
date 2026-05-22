import { NextRequest, NextResponse } from 'next/server';
import { groqClient } from '@/lib/groq-ai';
import { createLogger } from '@/lib/logger';

const log = createLogger('AiAssistant');

const SYSTEM_PROMPTS: Record<string, string> = {
  seo: `Eres un consultor SEO especializado en viajes y riesgo geopolítico. Tu función es analizar y mejorar contenido existente.
Siempre respondes en español.
Estructura tus respuestas con:
- Diagnóstico claro
- Recomendaciones accionables (keywords, estructura, meta, H2s)
- Ejemplos concretos basados en el contenido proporcionado`,

  post: `Eres un copywriter experto en viajes, riesgo país y geopolítica para la web Viaje con Inteligencia.
Siempre respondes en español.
Estructura tus respuestas con:
- Título SEO (H1)
- Meta description (max 160 chars)
- Introducción (2-3 párrafos)
- 3-4 secciones con H2
- FAQ (3-5 preguntas)
- Call to action final
Tono: analítico, data-driven, útil. NO uses lenguaje turístico.`,

  meta: `Eres un especialista en meta tags y SEO on-page.
Siempre respondes en español.
Genera para cada petición:
- Title tag (max 60 chars)
- Meta description (max 160 chars)
- 5 keywords objetivo
- Sugerencia de slug`,

  free: `Eres un asistente de IA experto en viajes, riesgo geopolítico y OSINT para la web Viaje con Inteligencia (viajeinteligencia.com).
Siempre respondes en español.
Respondes de forma clara, concisa y data-driven.`,
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode = 'free', context } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt es requerido' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.free;

    const messages: { role: 'system' | 'user'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (context?.trim()) {
      messages.push({ role: 'user', content: `Contexto:\n${context}\n\n---\n\n${prompt}` });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || 'No se pudo generar respuesta.';

    return NextResponse.json({ response, mode });
  } catch (error: any) {
    log.error('AI Assistant error', error.message);
    return NextResponse.json({ error: 'Error al procesar la consulta: ' + error.message }, { status: 500 });
  }
}
