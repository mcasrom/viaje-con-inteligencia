import { notFound } from 'next/navigation';
import { getPaisPorCodigo, getTodosLosPaises } from '@/data/paises';
import { calculateTCI, getCheapestDestinations, getMostExpensiveDestinations, getConflictImpact, analyzeTCITrend } from '@/data/tci-engine';
import ViajeCosteClient from '@/app/viaje-coste/[codigo]/ViajeCosteClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/schemas';
import { getLiveTCIData } from '@/lib/tci-db';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ codigo: string }>;
}

export async function generateStaticParams() {
  const paises = getTodosLosPaises().filter(p => p.codigo !== 'cu');
  return paises.map((pais) => ({ codigo: pais.codigo }));
}

export async function generateMetadata({ params }: PageProps) {
  const { codigo } = await params;

  if (codigo === 'cu') {
    return { title: 'No disponible | Viaje con Inteligencia' };
  }

  const pais = getPaisPorCodigo(codigo);

  if (!pais || pais.visible === false) {
    return { title: 'País no encontrado | Viaje con Inteligencia' };
  }

  const tci = calculateTCI(codigo);
  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  let costLabel: string;
  if (tci.tci < 85) costLabel = 'barato';
  else if (tci.tci < 95) costLabel = 'económico';
  else if (tci.tci < 105) costLabel = 'precio medio';
  else if (tci.tci < 115) costLabel = 'caro';
  else costLabel = 'muy caro';

  return {
    title: `Cuánto cuesta viajar a ${pais.nombre} en ${mesActual} | Índice TCI ${tci.tci}`,
    description: `Descubre cuánto cuesta viajar a ${pais.nombre}. Índice de coste TCI: ${tci.tci} (${costLabel}, tendencia ${tci.trend}). Presupuesto estimado, mes más barato y proyección ML.`,
    alternates: {
      canonical: `https://www.viajeinteligencia.com/coste/${codigo}`,
    },
  };
}

function getPresupuesto(tci: number, pais: any): {
  mochilero: { min: number; max: number };
  medio: { min: number; max: number };
  lujo: { min: number; max: number };
  notas: string[];
} {
  const factor = tci / 100;
  const region = pais.continente;

  let base: { mochilero: number; medio: number; lujo: number };

  switch (region) {
    case 'Europa': base = { mochilero: 35, medio: 70, lujo: 180 }; break;
    case 'América del Norte': base = { mochilero: 40, medio: 80, lujo: 200 }; break;
    case 'América del Sur': base = { mochilero: 20, medio: 45, lujo: 120 }; break;
    case 'América Central': case 'Caribe': base = { mochilero: 25, medio: 50, lujo: 130 }; break;
    case 'Asia': base = { mochilero: 15, medio: 35, lujo: 90 }; break;
    case 'África': base = { mochilero: 20, medio: 40, lujo: 100 }; break;
    case 'Oceanía': base = { mochilero: 35, medio: 70, lujo: 160 }; break;
    case 'Oriente Medio': base = { mochilero: 25, medio: 50, lujo: 130 }; break;
    default: base = { mochilero: 25, medio: 50, lujo: 120 };
  }

  const notas: string[] = [];
  const ipcNum = parseFloat(pais.indicadores?.ipc?.replace('%', '') || '2');
  if (ipcNum > 10) notas.push(`⚠️ IPC elevado (${ipcNum}%) — los precios locales suben rápido`);
  else if (ipcNum < 1) notas.push(`✅ IPC bajo (${ipcNum}%) — estabilidad de precios`);

  const riesgo = pais.nivelRiesgo;
  if (riesgo === 'alto' || riesgo === 'muy-alto') notas.push('⚠️ Seguro de viaje esencial por nivel de riesgo');
  if (tci > 115) notas.push('📈 Temporada alta — precios máximos');
  else if (tci < 85) notas.push('📉 Temporada baja — mejores precios del año');

  return {
    mochilero: { min: Math.round(base.mochilero * factor), max: Math.round(base.mochilero * factor * 1.5) },
    medio: { min: Math.round(base.medio * factor), max: Math.round(base.medio * factor * 1.5) },
    lujo: { min: Math.round(base.lujo * factor), max: Math.round(base.lujo * factor * 1.5) },
    notas,
  };
}

function getMesIdeal(codigo: string): { mejor: string; evitar: string } {
  const pais = getPaisPorCodigo(codigo);
  if (!pais) return { mejor: 'Mayo', evitar: 'Agosto' };

  const hemisNorte = ['Europa', 'América del Norte', 'Asia', 'Oriente Medio'].includes(pais.continente);
  const hemisSur = ['América del Sur', 'Oceanía'].includes(pais.continente);
  const tropical = ['América Central', 'Caribe', 'África'].includes(pais.continente);

  if (hemisSur) return { mejor: 'Marzo - Abril', evitar: 'Diciembre - Enero' };
  if (tropical) return { mejor: 'Noviembre - Febrero', evitar: 'Junio - Septiembre' };
  return { mejor: 'Mayo - Junio', evitar: 'Julio - Agosto' };
}

function generateFAQ(countryName: string, tci: number, presupuesto: any, mesIdeal: { mejor: string; evitar: string }, pais: any): { question: string; answer: string }[] {
  let costLabel: string;
  if (tci < 85) costLabel = 'económico';
  else if (tci < 105) costLabel = 'moderado';
  else costLabel = 'elevado';

  return [
    { question: `¿Cuánto cuesta viajar a ${countryName}?`, answer: `El índice de coste de viaje (TCI) para ${countryName} es ${tci}, lo que indica un coste ${costLabel}. Presupuesto diario: ${presupuesto.mochilero.min}-${presupuesto.mochilero.max}€ (mochilero) hasta ${presupuesto.medio.min}-${presupuesto.medio.max}€ (viajero medio).` },
    { question: `¿Cuál es el mejor mes para viajar a ${countryName}?`, answer: `El mejor momento para visitar ${countryName} es ${mesIdeal.mejor}. Se recomienda evitar ${mesIdeal.evitar} por ser la temporada más cara.` },
    { question: `¿Cuánto dinero necesito por día en ${countryName}?`, answer: `Para un viaje económico, calcula ${presupuesto.mochilero.min}-${presupuesto.mochilero.max}€/día. Para un viaje cómodo, ${presupuesto.medio.min}-${presupuesto.medio.max}€/día.` },
    { question: `¿Es ${countryName} un destino caro?`, answer: `${countryName} tiene un TCI de ${tci} (base 100 = media). ${tci < 100 ? 'Más barato que la media.' : tci < 115 ? 'En línea con la media.' : 'Por encima de la media — busca ofertas.'}` },
    { question: `¿Qué moneda se usa en ${countryName}?`, answer: `La moneda oficial es ${pais.moneda}. ${pais.tipoCambio ? `Tipo de cambio: ${pais.tipoCambio}.` : ''} Usa tarjeta sin comisiones.` },
  ];
}

export default async function CosteDetailPage({ params }: PageProps) {
  const { codigo } = await params;

  if (codigo === 'cu') notFound();

  const pais = getPaisPorCodigo(codigo);
  if (!pais || pais.visible === false) notFound();

  const live = await getLiveTCIData();
  const tci = calculateTCI(codigo, live.seasonality || undefined);
  const mlAnalysis = analyzeTCITrend(codigo);
  const conflict = getConflictImpact(codigo, live.closures || undefined, live.routes || undefined);
  const presupuesto = getPresupuesto(tci.tci, pais);
  const mesIdeal = getMesIdeal(codigo);

  const alternativas = getCheapestDestinations(5).filter(d => d.code !== codigo && d.region === pais.continente);
  if (alternativas.length === 0) {
    alternativas.push(...getCheapestDestinations(5).filter(d => d.code !== codigo));
  }
  const masCaros = getMostExpensiveDestinations(5).filter(d => d.code !== codigo);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: 'Inicio', url: 'https://www.viajeinteligencia.com' },
    { name: 'Coste de Viaje', url: 'https://www.viajeinteligencia.com/coste' },
    { name: pais.nombre, url: `https://www.viajeinteligencia.com/coste/${codigo}` },
  ]);

  const faqSchema = generateFAQSchema(generateFAQ(pais.nombre, tci.tci, presupuesto, mesIdeal, pais));
  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <>
      <JsonLd data={[breadcrumbs, faqSchema]} />
      <ViajeCosteClient
        pais={pais}
        tci={tci}
        mlAnalysis={mlAnalysis}
        conflict={conflict}
        budget={presupuesto}
        mesIdeal={mesIdeal}
        alternativas={alternativas.slice(0, 3)}
        masCaros={masCaros.slice(0, 3)}
        mesActual={mesActual}
      />
    </>
  );
}
