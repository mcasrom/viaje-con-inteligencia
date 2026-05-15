import type { Metadata } from 'next';
import AlertasClient from './AlertasClient';

const MAEC_URL = 'https://www.exteriores.gob.es/es/Paginas/index.aspx';

interface MAECAlert {
  pais: string;
  codigo: string;
  nivelRiesgo: string;
  url: string;
  bandera: string;
}

async function fetchMAECAlerts(): Promise<MAECAlert[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'https://www.viajeinteligencia.com'}/api/maec?alerts=true`, {
      next: { revalidate: 600 },
    });
    const data = await res.json();
    const rawAlerts: any[] = data.alerts || [];
    if (res.ok && rawAlerts.length > 0 && !data.error) {
      const flagMap: Record<string, string> = {
        ua: '🇺🇦', ru: '🇷🇺', il: '🇮🇱', af: '🇦🇫', sy: '🇸🇾', ye: '🇾🇪',
        iq: '🇮🇶', so: '🇸🇴', ly: '🇱🇾', ve: '🇻🇪', ht: '🇭🇹', mm: '🇲🇲', ir: '🇮🇷',
      };
      const apiAlerts = rawAlerts.map((a: any) => ({
        pais: a.pais,
        codigo: a.codigo || '',
        nivelRiesgo: a.nivelRiesgo,
        url: a.url || MAEC_URL,
        bandera: flagMap[a.codigo] || flagMap[a.codigo?.toLowerCase()] || '🌍',
      }));
      const apiCodes = new Set(apiAlerts.map(a => a.codigo));
      return [...apiAlerts, ...FALLBACK_ALERTS.filter(f => !apiCodes.has(f.codigo))];
    }
  } catch {
    /* fallback */
  }
  return [];
}

const FALLBACK_ALERTS: MAECAlert[] = [
  { pais: 'Ucrania', codigo: 'ua', nivelRiesgo: 'muy-alto', url: MAEC_URL, bandera: '🇺🇦' },
  { pais: 'Rusia', codigo: 'ru', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇷🇺' },
  { pais: 'Israel', codigo: 'il', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇮🇱' },
  { pais: 'Afganistán', codigo: 'af', nivelRiesgo: 'muy-alto', url: MAEC_URL, bandera: '🇦🇫' },
  { pais: 'Siria', codigo: 'sy', nivelRiesgo: 'muy-alto', url: MAEC_URL, bandera: '🇸🇾' },
  { pais: 'Yemen', codigo: 'ye', nivelRiesgo: 'muy-alto', url: MAEC_URL, bandera: '🇾🇪' },
  { pais: 'Irak', codigo: 'iq', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇮🇶' },
  { pais: 'Somalia', codigo: 'so', nivelRiesgo: 'muy-alto', url: MAEC_URL, bandera: '🇸🇴' },
  { pais: 'Libia', codigo: 'ly', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇱🇾' },
  { pais: 'Venezuela', codigo: 've', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇻🇪' },
  { pais: 'Myanmar', codigo: 'mm', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇲🇲' },
  { pais: 'Haití', codigo: 'ht', nivelRiesgo: 'alto', url: MAEC_URL, bandera: '🇭🇹' },
  { pais: 'Irán', codigo: 'ir', nivelRiesgo: 'muy-alto', url: MAEC_URL, bandera: '🇮🇷' },
];

export const metadata: Metadata = {
  title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
  description: 'Alertas de riesgo en tiempo real del Ministerio de Asuntos Exteriores. Conflictos, desastres naturales y recomendaciones de viaje.',
  keywords: 'alertas viaje MAEC, riesgos viaje tiempo real, alertas seguridad viajeros, conflictos armados turismo, desastres naturales viaje, recomendaciones ministerio exteriores',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/alertas',
  },
  openGraph: {
    title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
    description: 'Alertas de riesgo en tiempo real del Ministerio de Asuntos Exteriores. Conflictos, desastres naturales y recomendaciones de viaje.',
    url: 'https://www.viajeinteligencia.com/alertas',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alertas MAEC en Vivo | Riesgos de Viaje - Viaje con Inteligencia',
    description: 'Alertas de riesgo en tiempo real del MAEC. Conflictos, desastres naturales y recomendaciones de viaje.',
    creator: '@ViajeIntel2026',
  },
};

export default async function AlertasPage() {
  const alerts = await fetchMAECAlerts();
  const initialAlerts = alerts.length > 0 ? alerts : FALLBACK_ALERTS;

  const alertCount = {
    muyAlto: initialAlerts.filter(a => a.nivelRiesgo === 'muy-alto').length,
    alto: initialAlerts.filter(a => a.nivelRiesgo === 'alto').length,
    medio: initialAlerts.filter(a => a.nivelRiesgo === 'medio').length,
  };

  return <AlertasClient initialAlerts={initialAlerts} initialCounts={alertCount} />;
}
