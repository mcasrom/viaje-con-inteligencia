import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const groqClient = groq;

export async function generateItinerary(
  destination: string,
  days: number,
  interests: string[],
  budget: string
): Promise<string> {
  const prompt = `Eres un experto asesor de viajes. Crea un itinerario detallado para ${days} días en ${destination}.

Intereses del viajero: ${interests.join(', ') || 'general'}
Presupuesto: ${budget || 'moderado'}

Incluye:
- Un resumen del viaje
- Itinerario día por día con:
  - Actividades recomendadas
  - Horarios sugeridos
  - Consejos de seguridad específicos
  - Restaurantes o comida local recomendada
  - Enlaces a recursos útiles

Responde en español, en formato markdown. Sé conciso pero útil.`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente de viajes experto, amable y detallado.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 4096,
    });

    return chatCompletion.choices[0]?.message?.content || 'No pude generar el itinerario.';
  } catch (error) {
    console.error('Groq API error:', error);
    return 'Error al generar el itinerario. Por favor, intenta de nuevo.';
  }
}

export async function analyzeRisk(
  country: string,
  recentEvents: string[]
): Promise<{ level: string; factors: string[]; recommendations: string[] }> {
  const prompt = `Analiza el nivel de riesgo para viajar a ${country}.

Eventos recientes conocidos:
${recentEvents.length > 0 ? recentEvents.join('\n') : 'No hay eventos recientes específicos registrados.'}

Proporciona en formato JSON:
{
  "level": "bajo|medio|alto|muy alto",
  "factors": ["factor1", "factor2", ...],
  "recommendations": ["recomendacion1", "recomendacion2", ...]
}

Responde SOLO con el JSON, sin explicaciones adicionales.`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un analista de riesgos de viaje. Respondes SOLO en JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(response);
  } catch (error) {
    console.error('Groq API error:', error);
    return {
      level: 'desconocido',
      factors: ['No se pudo analizar'],
      recommendations: ['Verifica fuentes oficiales'],
    };
  }
}

export async function chatWithAI(
  message: string,
  context: { country?: string; previousMessages?: string[] }
): Promise<string> {
  const countryContext = context.country
    ? `El usuario está preguntando sobre viajes a/desde ${context.country}.`
    : '';

  const history = context.previousMessages
    ?.slice(-6)
    ?.map((msg, i) => (i % 2 === 0 ? `Usuario: ${msg}` : `Asistente: ${msg}`))
    .join('\n');

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un asistente de viajes experto y amigable. ${countryContext}

Ayudas con:
- Recomendaciones de destinos
- Consejos de seguridad
- Planificación de viajes
- Información sobre países
- Requisitos de visado
- Vacunas y salud
- Moneda y presupuesto

Responde en español, de forma clara y útil. Si no sabes algo, dilo honestamente y sugiere fuentes oficiales.`,
        },
        ...(history ? [{ role: 'user' as const, content: history }] : []),
        { role: 'user', content: message },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || 'No pude procesar tu mensaje.';
  } catch (error) {
    console.error('Groq API error:', error);
    return 'Error de conexión. Por favor, intenta de nuevo.';
  }
}
