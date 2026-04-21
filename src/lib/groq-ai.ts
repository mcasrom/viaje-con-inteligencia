import Groq from 'groq-sdk';
import { paisesData } from '@/data/paises';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const groqClient = groq;

const riesgoLabels: Record<string, string> = {
  'sin-riesgo': '🟢 Bajo/Sin riesgo',
  'bajo': '🟡 Riesgo bajo',
  'medio': '🟠 Riesgo medio',
  'alto': '🔴 Riesgo alto',
  'muy-alto': '🔴 Riesgo muy alto',
};

function getCountryRiskInfo(countryCode: string): string {
  const pais = paisesData[countryCode];
  if (!pais) return '';
  return `
DATOS DEL PAÍS (actualizados):
- País: ${pais.nombre}
- Riesgo actual: ${riesgoLabels[pais.nivelRiesgo] || pais.nivelRiesgo}
- Capital: ${pais.capital}
- Moneda: ${pais.moneda}
- Idioma: ${pais.idioma}
- Último informe: ${pais.ultimoInforme}
`.trim();
}

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
      model: 'llama-3.1-8b-instant',
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
      model: 'llama-3.1-8b-instant',
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

export interface CountryComparisonData {
  codigo: string;
  nombre: string;
  bandera: string;
  nivelRiesgo: string;
  capital: string;
  moneda: string;
  tipoCambio: string;
  idioma: string;
  zonaHoraria: string;
  voltaje: string;
  conduccion: 'derecha' | 'izquierda';
  ultimoInforme?: string;
}

export async function compareCountries(countries: CountryComparisonData[]): Promise<string> {
  const countriesInfo = countries
    .map(
      (p) => `- ${p.bandera} ${p.nombre}
  Riesgo: ${riesgoLabels[p.nivelRiesgo] || p.nivelRiesgo}
  Capital: ${p.capital}
  Moneda: ${p.moneda} (${p.tipoCambio}/día)
  Idioma: ${p.idioma}
  Zona horaria: ${p.zonaHoraria}
  Voltaje: ${p.voltaje}
  Conducción: ${p.conduccion === 'derecha' ? 'Derecha' : 'Izquierda'}
  Última info: ${p.ultimoInforme || 'N/A'}`
    )
    .join('\n\n');

  const prompt = `Compara estos países para un viajero español y crea un análisis útil:

${countriesInfo}

Proporciona:
1. **Resumen ejecutivo**: ¿Cuál es mejor para viajar según el perfil?
2. **Comparativa por categorías** (tabla):
   - Seguridad (basado en riesgo MAEC)
   - Coste diario
   - Facilidad de viaje (idioma, infraestructura)
   - Experiencia turística
3. **Recomendación final** personalizada
4. **Consejos prácticos** para cada uno

Usa un formato limpio y práctico. Responde en español.`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Eres un asesor de viajes experto. Analizas datos objetivos y das recomendaciones prácticas y personalizadas.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || 'No pude completar la comparación.';
  } catch (error) {
    console.error('Groq API error:', error);
    return 'Error al comparar. Intenta de nuevo.';
  }
}

export async function chatWithAI(
  message: string,
  context: { country?: string; previousMessages?: string[] }
): Promise<string> {
  const countryCode = context.country?.toLowerCase();
  const countryData = countryCode ? getCountryRiskInfo(countryCode) : '';
  const countryContext = countryData
    ? `El usuario pregunta sobre ${context.country}.\n${countryData}`
    : context.country
    ? `El usuario está preguntando sobre viajes a/desde ${context.country}. (Datos no disponibles en cache)`
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
          content: `Eres un asistente de viajes experto para viajeros españoles.

FUENTE PRINCIPAL: MAEC (Ministerio de Asuntos Exteriores) - https://www.exteriores.gob.es/es/servicios/alertas
INFORMACIÓN: Usa los niveles del MAEC: 1-Verde, 2-Amarillo, 3-Naranja, 4-Rojo

IMPORTANTE:
- NO des fechas específicas de actualización
- Si no tienes datos actuales, dice "Consulta alertas.maec.es para información actualizada"
- Sé CAUTELOSO con países en conflicto activo (Ucrania, Gaza, Israel/Irán, etc.)
- Para España: indica siempre consular más reciente

${countryContext}

Ayudas con:
- Recomendaciones de destinos
- Requisitos de visado para españoles
- Consejos de seguridad
- Embajadas y konsulados
- Vaccunas y salud
- Moneda y presupuesto

Responde en español, de forma clara y útil. Sugiere consultar la web del MAEC.`,
        },
        ...(history ? [{ role: 'user' as const, content: history }] : []),
        { role: 'user', content: message },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || 'No pude procesar tu mensaje.';
  } catch (error: any) {
    console.error('Groq API error:', error?.message || error?.error || error);
    return `Error de conexión: ${error?.message || 'verifica GROQ_API_KEY'}`;
  }
}
