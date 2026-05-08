import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export function generateStaticParams() {
  const TOP_DESTINOS = [
    'es', 'fr', 'it', 'de', 'gb', 'pt', 'gr', 'hr', 'mx', 'ar', 'co', 'pe',
    'cl', 'br', 'us', 'ca', 'jp', 'th', 'vn', 'id', 'my', 'ph', 'in', 'tr',
    'ma', 'tn', 'eg', 'ae', 'za', 'nl', 'be', 'at', 'ch', 'se', 'no',
    'dk', 'fi', 'ie', 'pl', 'cz', 'hu', 'ro', 'bg', 'rs', 'sk', 'si',
  ];
  return TOP_DESTINOS.map(pais => ({ pais }));
}

export async function generateMetadata({ params }: { params: Promise<{ pais: string }> }): Promise<Metadata> {
  const { pais } = await params;
  const nombrePais = NOMBRES[pais.toUpperCase()] || pais.toUpperCase();
  return {
    title: `Comparador de seguros de viaje a ${nombrePais} | Viaje con Inteligencia`,
    description: `Compara los mejores seguros de viaje para ${nombrePais} según el riesgo real del destino (IRV), tu perfil y las actividades planeadas. IATI, Chapka, AXA y más.`,
    openGraph: {
      title: `Seguro de viaje para ${nombrePais} — Comparativa OSINT`,
      description: `Encuentra el seguro ideal para ${nombrePais} con nuestro comparador basado en datos de riesgo en tiempo real.`,
    },
  };
}

export default async function SegurosPaisPage({ params }: { params: Promise<{ pais: string }> }) {
  const { pais } = await params;
  redirect(`/coste/seguros?destino=${pais.toUpperCase()}`);
}

const NOMBRES: Record<string, string> = {
  ES: 'España', FR: 'Francia', IT: 'Italia', DE: 'Alemania', GB: 'Reino Unido',
  PT: 'Portugal', GR: 'Grecia', HR: 'Croacia', MX: 'México', AR: 'Argentina',
  CO: 'Colombia', PE: 'Perú', CL: 'Chile', BR: 'Brasil', US: 'Estados Unidos',
  CA: 'Canadá', JP: 'Japón', TH: 'Tailandia', VN: 'Vietnam', ID: 'Indonesia',
  MY: 'Malasia', PH: 'Filipinas', IN: 'India', TR: 'Turquía', MA: 'Marruecos',
  TN: 'Túnez', EG: 'Egipto', AE: 'EAU', ZA: 'Sudáfrica', NL: 'Países Bajos',
  BE: 'Bélgica', AT: 'Austria', CH: 'Suiza', SE: 'Suecia', NO: 'Noruega',
  DK: 'Dinamarca', FI: 'Finlandia', IE: 'Irlanda', PL: 'Polonia', CZ: 'República Checa',
  HU: 'Hungría', RO: 'Rumanía', BG: 'Bulgaria', RS: 'Serbia', SK: 'Eslovaquia',
  SI: 'Eslovenia',
};
