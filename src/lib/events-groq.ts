const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

export interface EnrichedEvent {
  impact_traveler: 'high' | 'medium' | 'low' | 'positive';
  impact_note: string;
  category: string;
  subcategory: string;
}

export async function enrichEvent(title: string, description: string): Promise<EnrichedEvent> {
  if (!process.env.GROQ_API_KEY) {
    return { impact_traveler: 'low', impact_note: '', category: 'other', subcategory: 'other' };
  }

  try {
    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Eres un analizador de eventos para viajeros. Responde SOLO con JSON.

Clasifica el evento:
- impact_traveler: "high" (afecta directamente al viajero: protestas, huelgas, cierres), "medium" (puede afectar: festivales grandes, deportes masivos), "low" (irrelevante), "positive" (recomendable para el viajero)
- impact_note: texto breve explicando el impacto (máx 100 caracteres)
- category: festival, sports, protest, holiday, commemoration, conference, cultural, other
- subcategory: especificar (music, film, marathon, tournament, strike, demonstration, etc)

Ejemplo: {"impact_traveler":"high","impact_note":"Protestas pueden cerrar calles y afectar transporte","category":"protest","subcategory":"demonstration"}`,
          },
          {
            role: 'user',
            content: `Título: ${title}\nDescripción: ${description}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      return { impact_traveler: 'low', impact_note: '', category: 'other', subcategory: 'other' };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { impact_traveler: 'low', impact_note: '', category: 'other', subcategory: 'other' };
  } catch {
    return { impact_traveler: 'low', impact_note: '', category: 'other', subcategory: 'other' };
  }
}

export async function enrichMany(events: { title: string; description: string }[], batchSize = 5): Promise<EnrichedEvent[]> {
  const results: EnrichedEvent[] = [];
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    const enriched = await Promise.all(batch.map(e => enrichEvent(e.title, e.description)));
    results.push(...enriched);
  }
  return results;
}
