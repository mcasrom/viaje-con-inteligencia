import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/groq-ai';

export const dynamic = 'force-dynamic';

const REGION_DATA: Record<string, {
  costes: { bajo: number; medio: number; alto: number };
  estanciaMedia: number;
  mejorEpoca: string[];
  clima: string;
  riesgoMAEC: string;
  transporte: string;
}> = {
  'Andalucia': { costes: { bajo: 60, medio: 90, alto: 180 }, estanciaMedia: 8, mejorEpoca: ['Marzo','Abril','Mayo','Septiembre','Octubre'], clima: 'Mediterraneo calido. Veranos muy calurosos +40C. Inviernos suaves.', riesgoMAEC: 'Bajo', transporte: 'AVE Madrid-Sevilla 2.5h, alquiler coche recomendado para pueblos' },
  'Aragon': { costes: { bajo: 55, medio: 80, alto: 150 }, estanciaMedia: 5, mejorEpoca: ['Junio','Julio','Agosto','Septiembre'], clima: 'Continental con Pirineos nevados en invierno. Veranos secos.', riesgoMAEC: 'Bajo', transporte: 'Coche imprescindible para Pirineos y pueblos medievales' },
  'Asturias': { costes: { bajo: 60, medio: 85, alto: 160 }, estanciaMedia: 6, mejorEpoca: ['Junio','Julio','Agosto','Septiembre'], clima: 'Oceanico. Lluvia frecuente. Veranos frescos 20-25C.', riesgoMAEC: 'Bajo', transporte: 'Coche recomendado. FEVE tren costero lento pero pintoresco' },
  'Baleares': { costes: { bajo: 80, medio: 130, alto: 300 }, estanciaMedia: 7, mejorEpoca: ['Mayo','Junio','Septiembre','Octubre'], clima: 'Mediterraneo. Julio-Agosto masificado y caro. Mayo-Junio ideal.', riesgoMAEC: 'Bajo', transporte: 'Ferries entre islas. Alquiler coche o bici en isla' },
  'Canarias': { costes: { bajo: 70, medio: 100, alto: 220 }, estanciaMedia: 10, mejorEpoca: ['Noviembre','Diciembre','Enero','Febrero','Marzo'], clima: 'Primavera eterna 20-25C todo el año. Ideal invierno europeo.', riesgoMAEC: 'Bajo', transporte: 'Vuelos inter-islas o ferries. Coche imprescindible en cada isla' },
  'Cantabria': { costes: { bajo: 60, medio: 85, alto: 160 }, estanciaMedia: 5, mejorEpoca: ['Junio','Julio','Agosto'], clima: 'Oceanico verde. Lluvia frecuente. Veranos agradables.', riesgoMAEC: 'Bajo', transporte: 'Coche recomendado para costa y Picos de Europa' },
  'Castilla-La Mancha': { costes: { bajo: 45, medio: 70, alto: 130 }, estanciaMedia: 4, mejorEpoca: ['Abril','Mayo','Octubre','Noviembre'], clima: 'Continental extremo. Veranos secos +38C. Inviernos frios.', riesgoMAEC: 'Bajo', transporte: 'Coche imprescindible. AVE pasa por Cuenca y Ciudad Real' },
  'Castilla y Leon': { costes: { bajo: 50, medio: 75, alto: 140 }, estanciaMedia: 5, mejorEpoca: ['Abril','Mayo','Junio','Septiembre','Octubre'], clima: 'Continental. Inviernos frios con heladas. Veranos secos.', riesgoMAEC: 'Bajo', transporte: 'Coche recomendado. AVE a Valladolid y Segovia' },
  'Cataluna': { costes: { bajo: 75, medio: 120, alto: 250 }, estanciaMedia: 6, mejorEpoca: ['Mayo','Junio','Septiembre','Octubre'], clima: 'Mediterraneo en costa, alpino en Pirineos. Barcelona cosmopolita.', riesgoMAEC: 'Bajo', transporte: 'Metro Barcelona excelente. Coche para Costa Brava y Pirineos' },
  'Extremadura': { costes: { bajo: 40, medio: 65, alto: 120 }, estanciaMedia: 4, mejorEpoca: ['Marzo','Abril','Mayo','Octubre','Noviembre'], clima: 'Continental extremo. Veranos muy calurosos. Primavera con flores espectacular.', riesgoMAEC: 'Bajo', transporte: 'Coche imprescindible. Sin AVE. Carreteras buenas y vacias.' },
  'Galicia': { costes: { bajo: 55, medio: 80, alto: 150 }, estanciaMedia: 6, mejorEpoca: ['Junio','Julio','Agosto','Septiembre'], clima: 'Oceanico atlantico. Verde y lluvioso. Veranos suaves.', riesgoMAEC: 'Bajo', transporte: 'AVE a Santiago y Vigo. Coche para Rias Baixas y costa' },
  'La Rioja': { costes: { bajo: 55, medio: 85, alto: 160 }, estanciaMedia: 3, mejorEpoca: ['Septiembre','Octubre','Abril','Mayo'], clima: 'Continental suave. Vendimia en septiembre espectacular.', riesgoMAEC: 'Bajo', transporte: 'Coche recomendado para bodegas y pueblos' },
  'Madrid': { costes: { bajo: 80, medio: 130, alto: 280 }, estanciaMedia: 4, mejorEpoca: ['Abril','Mayo','Junio','Septiembre','Octubre'], clima: 'Continental. Veranos calurosos 35C. Inviernos frios con nieve ocasional.', riesgoMAEC: 'Bajo', transporte: 'Metro excelente. Hub AVE para toda España' },
  'Murcia': { costes: { bajo: 45, medio: 70, alto: 130 }, estanciaMedia: 5, mejorEpoca: ['Marzo','Abril','Mayo','Octubre','Noviembre'], clima: 'Semiárido. Mas sol de España. Veranos calurosos. Inviernos muy suaves.', riesgoMAEC: 'Bajo', transporte: 'Coche recomendado. Mar Menor y Cartagena accesibles' },
  'Navarra': { costes: { bajo: 60, medio: 90, alto: 170 }, estanciaMedia: 4, mejorEpoca: ['Mayo','Junio','Septiembre','Octubre'], clima: 'Variado: Pirineos nevados al norte, semi-arido al sur.', riesgoMAEC: 'Bajo', transporte: 'Coche imprescindible. Pamplona bien conectada en bus' },
  'Pais Vasco': { costes: { bajo: 80, medio: 130, alto: 260 }, estanciaMedia: 4, mejorEpoca: ['Junio','Julio','Agosto','Septiembre'], clima: 'Oceanico. Verde y lluvioso. Veranos agradables.', riesgoMAEC: 'Bajo', transporte: 'Metro Bilbao. Tren costero pintoresco. Coche para interior' },
  'Valencia': { costes: { bajo: 65, medio: 95, alto: 180 }, estanciaMedia: 6, mejorEpoca: ['Abril','Mayo','Junio','Septiembre','Octubre'], clima: 'Mediterraneo ideal. Mas de 300 dias de sol. Veranos calurosos.', riesgoMAEC: 'Bajo', transporte: 'Metro Valencia. AVE a Madrid 1.5h. Coche para interior' },
  'Camino de Santiago': { costes: { bajo: 35, medio: 60, alto: 120 }, estanciaMedia: 30, mejorEpoca: ['Abril','Mayo','Junio','Septiembre'], clima: 'Variable segun etapa. Galicia lluviosa. Meseta seca y calurosa en verano.', riesgoMAEC: 'Bajo', transporte: 'A pie o bici. Etapas medias 25km/dia' },
  'Costa del Sol': { costes: { bajo: 70, medio: 110, alto: 250 }, estanciaMedia: 7, mejorEpoca: ['Mayo','Junio','Septiembre','Octubre'], clima: 'Mediterraneo calido. 320 dias de sol. Julio-Agosto masificado.', riesgoMAEC: 'Bajo', transporte: 'Coche o bus costero. Aeropuerto Malaga hub internacional' },
  'Picos de Europa': { costes: { bajo: 55, medio: 80, alto: 150 }, estanciaMedia: 5, mejorEpoca: ['Junio','Julio','Agosto','Septiembre'], clima: 'Montaña atlantica. Niebla frecuente. Nevado en invierno.', riesgoMAEC: 'Bajo', transporte: 'Coche imprescindible. Carreteras de montana estrechas' },
  'Sierra Nevada': { costes: { bajo: 60, medio: 90, alto: 170 }, estanciaMedia: 5, mejorEpoca: ['Diciembre','Enero','Febrero','Marzo','Junio','Septiembre'], clima: 'Alta montana. Esqui en invierno. Senderismo en verano.', riesgoMAEC: 'Bajo', transporte: 'Coche imprescindible. Bus desde Granada' },
  'Costa Brava': { costes: { bajo: 75, medio: 120, alto: 260 }, estanciaMedia: 7, mejorEpoca: ['Mayo','Junio','Septiembre','Octubre'], clima: 'Mediterraneo. Julio-Agosto masificado y caro. Tramuntana en primavera.', riesgoMAEC: 'Bajo', transporte: 'Coche recomendado para calas. Bus desde Barcelona' },
};

const DEFAULT_REGION = {
  costes: { bajo: 60, medio: 90, alto: 170 },
  estanciaMedia: 5,
  mejorEpoca: ['Abril','Mayo','Septiembre','Octubre'],
  clima: 'Mediterraneo o continental segun zona.',
  riesgoMAEC: 'Bajo',
  transporte: 'Consultar opciones locales',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, days, interests, budget, travelerProfile } = body;

    if (!region || !days) {
      return NextResponse.json({ error: 'Faltan region y days' }, { status: 400 });
    }

    const datos = REGION_DATA[region] || DEFAULT_REGION;
    const costes = datos.costes[budget as 'bajo'|'medio'|'alto'] || datos.costes.medio;
    const mejorEpoca = datos.mejorEpoca.join(', ');

    const enrichedDestination = `${region}, España`;
    const enrichedInterests = [
      ...(interests || []),
      `smart traveller`,
      `seguridad riesgo ${datos.riesgoMAEC}`,
      `presupuesto real ${costes} euros por dia`,
      `mejor epoca: ${mejorEpoca}`,
      `clima: ${datos.clima}`,
      `transporte: ${datos.transporte}`,
    ];

    const itinerary = await generateItinerary(
      enrichedDestination,
      days,
      enrichedInterests,
      budget || 'moderate',
      travelerProfile || 'pareja',
      ['smart traveller', 'seguridad', 'cultura local'],
      300,
    );

    return NextResponse.json({
      itinerary,
      meta: {
        region,
        costes,
        mejorEpoca: datos.mejorEpoca,
        riesgoMAEC: datos.riesgoMAEC,
        transporte: datos.transporte,
      }
    });
  } catch (error) {
    console.error('Itinerarios España API error:', error);
    return NextResponse.json({ error: 'Error al generar itinerario' }, { status: 500 });
  }
}
