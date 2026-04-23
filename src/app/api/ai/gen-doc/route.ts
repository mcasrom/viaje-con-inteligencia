import { NextResponse } from 'next/server';
import { groqClient } from '@/lib/groq-ai';
import { paisesData } from '@/data/paises';

export const runtime = 'edge';

interface GenerateDocRequest {
  type: 'informe' | 'resumen' | 'comparativa';
  paises: string[];
  opciones?: {
    dias?: number;
    intereses?: string[];
    presupuesto?: string;
  };
}

const riesgoLabels: Record<string, string> = {
  'sin-riesgo': '🟢 Bajo/Sin riesgo',
  'bajo': '🟡 Riesgo bajo',
  'medio': '🟠 Riesgo medio',
  'alto': '🔴 Riesgo alto',
  'muy-alto': '🔴 Riesgo muy alto',
};

function getPaisData(codigo: string) {
  const pais = paisesData[codigo];
  if (!pais) return null;
  return {
    nombre: pais.nombre,
    codigo: pais.codigo,
    bandera: pais.bandera,
    nivelRiesgo: riesgoLabels[pais.nivelRiesgo] || pais.nivelRiesgo,
    capital: pais.capital,
    moneda: pais.moneda,
    idioma: pais.idioma,
    zonaHoraria: pais.zonaHoraria,
    voltaje: pais.voltaje,
    conduccion: pais.conduccion,
    tipoCambio: pais.tipoCambio,
    ultimoInforme: pais.ultimoInforme,
  };
}

async function generateInforme(pais: string) {
  const paisData = getPaisData(pais);
  if (!paisData) {
    return { error: `País ${pais} no encontrado` };
  }

  const prompt = `Genera un informe completo de viaje para ${paisData.nombre} ${paisData.bandera}

DATOS DEL PAÍS:
- Riesgo actual: ${paisData.nivelRiesgo}
- Capital: ${paisData.capital}
- Moneda: ${paisData.moneda}
- Idioma: ${paisData.idioma}
- Zona horaria: ${paisData.zonaHoraria}
- Voltaje: ${paisData.voltaje}
- Conducción: ${paisData.conduccion}
- Cambio aprox: ${paisData.tipoCambio}/EUR
- Última actualización: ${paisData.ultimoInforme}

Incluye:
1. **Resumen ejecutivo** (2-3 líneas)
2. **Nivel de riesgo** con explicación
3. **Requisitos de entrada** (visado, pasaporte, vacunas)
4. **Mejor época** para visitar
5. **Presupuesto diario** estimado
6. **Transporte interno**
7. **Seguridad** (consejos prácticos)
8. **Embajada de España** (dirección y tfno si disponible)
9. **Teléfonos de emergencia**
10. ** Checklist** de preparación

Formato: Markdown estructurado. Sé conciso pero útil.`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto asesor de viajes para españoles. Das informes prácticos y actualizados.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 2048,
    });

    return {
      pais: paisData,
      informe: chatCompletion.choices[0]?.message?.content,
      generado: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gen doc error:', error);
    return { error: 'Error al generar informe' };
  }
}

async function generateResumen(pais: string, opciones?: GenerateDocRequest['opciones']) {
  const paisData = getPaisData(pais);
  if (!paisData) {
    return { error: `País ${pais} no encontrado` };
  }

  const dias = opciones?.dias || 7;
  const intereses = opciones?.intereses?.join(', ') || 'turismo general';
  const presupuesto = opciones?.presupuesto || 'moderado';

  const prompt = `Genera un resumen de viaje para ${paisData.nombre} ${paisData.bandera} durante ${dias} días.

PERFIL VIAJERO:
- Intereses: ${intereses}
- Presupuesto: ${presupuesto}

DATOS RÁPIDOS:
- Riesgo: ${paisData.nivelRiesgo}
- Moneda: ${paisData.moneda}
- Idioma: ${paisData.idioma}
- Cambio: ${paisData.tipoCambio}/EUR

Incluye:
1. **Resumen** (3 líneas)
2. **Itinerario día por día** (${dias} días)
3. **Coste estimado** (${presupuesto})
4. **Alertas importantes** de seguridad
5. **Contacto emergencia** consular

Formato: Markdown. Sé muy conciso.`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un asesor de viajes conciso y práctico.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.6,
      max_tokens: 2048,
    });

    return {
      pais: paisData,
      dias,
      intereses,
      presupuesto,
      resumen: chatCompletion.choices[0]?.message?.content,
      generado: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gen doc error:', error);
    return { error: 'Error al generar resumen' };
  }
}

async function generateComparativa(paises: string[]) {
  const paisesDataList = paises
    .map((codigo) => getPaisData(codigo))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (paisesDataList.length < 2) {
    return { error: 'Se requieren al menos 2 países para comparar' };
  }

  const paisesInfo = paisesDataList
    .map(
      (p) => `${p.bandera} ${p.nombre}
- Riesgo: ${p.nivelRiesgo}
- Capital: ${p.capital}
- Moneda: ${p.moneda} (${p.tipoCambio}/día)
- Idioma: ${p.idioma}
- Conducción: ${p.conduccion}`
    )
    .join('\n\n');

  const prompt = `Compara estos destinos para un viajero español:

${paisesInfo}

Proporciona:
1. **Resumen ejecutivo** - ¿Cuál es mejor para ti?
2. **Tabla comparativa** por categorías:
   - Seguridad (basado en riesgo MAEC)
   - Coste diario
   - Facilidad (idioma, infraestructura)
   - Experiencia turística
3. **Recomendación final** personalizada

Formato: Markdown limpio. Responde en español.`;

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un analista de viajes objective y práctico.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.6,
      max_tokens: 2048,
    });

    return {
      paises: paisesDataList,
      comparativa: chatCompletion.choices[0]?.message?.content,
      generado: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Gen doc error:', error);
    return { error: 'Error al generar comparativa' };
  }
}

export async function POST(request: Request) {
  try {
    const body: GenerateDocRequest = await request.json();
    const { type, paises, opciones } = body;

    if (!type || !paises || paises.length === 0) {
      return NextResponse.json(
        { error: 'type y paises son requeridos' },
        { status: 400 }
      );
    }

    let result: any;

    switch (type) {
      case 'informe':
        if (paises.length === 1) {
          result = await generateInforme(paises[0]);
        } else {
          result = await generateComparativa(paises);
        }
        break;
      case 'resumen':
        result = await generateResumen(paises[0], opciones);
        break;
      case 'comparativa':
        result = await generateComparativa(paises);
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo no válido. Usa: informe, resumen o comparativa' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      data: result,
    });
  } catch (error) {
    console.error('Gen doc API error:', error);
    return NextResponse.json(
      { error: 'Error interno al generar documento' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/gen-doc',
    method: 'POST',
    types: ['informe', 'resumen', 'comparativa'],
    example: {
      type: 'informe',
      paises: ['ES', 'PT'],
    },
  });
}