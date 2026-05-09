import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { paisesData, type NivelRiesgo } from '@/data/paises';

const COLORS = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  accent: '#6366f1',
  dark: '#0f172a',
  slate: '#1e293b',
  slateLight: '#475569',
  muted: '#94a3b8',
  white: '#f8fafc',
  amber: '#f59e0b',
  red: '#ef4444',
  green: '#22c55e',
  orange: '#f97316',
};

const RISK_COLORS: Record<NivelRiesgo, string> = {
  'sin-riesgo': COLORS.green,
  'bajo': COLORS.green,
  'medio': COLORS.amber,
  'alto': COLORS.orange,
  'muy-alto': COLORS.red,
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.white,
    backgroundColor: COLORS.dark,
  },
  coverPage: {
    padding: 0,
    backgroundColor: COLORS.dark,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: COLORS.primary,
    opacity: 0.12,
  },
  coverLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 16,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: COLORS.primaryLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  coverDesc: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 360,
    marginTop: 16,
    lineHeight: 1.5,
  },
  coverValidity: {
    position: 'absolute',
    bottom: 100,
    fontSize: 9,
    color: COLORS.slateLight,
    textAlign: 'center',
    maxWidth: 360,
  },
  coverVersion: {
    position: 'absolute',
    bottom: 70,
    fontSize: 9,
    color: COLORS.slateLight,
  },
  coverDate: {
    position: 'absolute',
    bottom: 50,
    fontSize: 9,
    color: COLORS.slateLight,
  },

  h1: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, marginBottom: 16, marginTop: 8 },
  h2: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryLight, marginBottom: 10, marginTop: 12 },
  h3: { fontSize: 12, fontWeight: 'bold', color: COLORS.white, marginBottom: 6, marginTop: 8 },
  p: { fontSize: 10, color: COLORS.muted, lineHeight: 1.5, marginBottom: 6 },
  small: { fontSize: 8, color: COLORS.slateLight },

  divider: { borderBottom: '1 solid ' + COLORS.slate, marginVertical: 12 },
  dividerLight: { borderBottom: '0.5 solid ' + COLORS.slate, marginVertical: 8 },

  tocItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '0.5 solid ' + COLORS.slate },
  tocPage: { color: COLORS.slateLight, fontSize: 10 },
  tocTitle: { color: COLORS.white, fontSize: 10 },
  tocSection: { color: COLORS.primaryLight, fontSize: 11, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },

  card: {
    backgroundColor: COLORS.slate,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { color: COLORS.white, fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  cardSub: { color: COLORS.muted, fontSize: 9 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },

  grid2: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  gridCol: { flex: 1 },

  table: { marginVertical: 6 },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid ' + COLORS.slate, paddingVertical: 4 },
  tableHeader: { backgroundColor: COLORS.primary, color: COLORS.white, fontWeight: 'bold', fontSize: 9, paddingVertical: 5 },
  tableCell: { flex: 1, fontSize: 8, paddingHorizontal: 4, color: COLORS.muted },
  tableCellBold: { flex: 1, fontSize: 9, paddingHorizontal: 4, color: COLORS.white, fontWeight: 'bold' },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryLight,
    marginBottom: 14,
    marginTop: 4,
    borderBottom: '2 solid ' + COLORS.primary,
    paddingBottom: 6,
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.slateLight,
    borderTop: '0.5 solid ' + COLORS.slate,
    paddingTop: 4,
  },

  pageNumber: { color: COLORS.slateLight },
  flexRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emergencyBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    border: '1 solid #dc2626',
  },
  emergencyTel: { fontSize: 16, fontWeight: 'bold', color: '#fca5a5', textAlign: 'center', marginVertical: 4 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.slate,
    borderRadius: 6,
    padding: 10,
  },
  featureName: { fontSize: 10, fontWeight: 'bold', color: COLORS.white, marginBottom: 2 },
  featureDesc: { fontSize: 8, color: COLORS.muted, lineHeight: 1.3 },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
    borderBottom: '0.5 solid ' + COLORS.slate,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskName: { fontSize: 9, color: COLORS.white, flex: 1 },
  riskLevel: { fontSize: 8, color: COLORS.muted, width: 60, textAlign: 'right' },

  updateBox: {
    backgroundColor: '#1e3a5f',
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    border: '1 solid ' + COLORS.primaryLight,
  },
  updateTitle: { fontSize: 10, fontWeight: 'bold', color: COLORS.primaryLight, marginBottom: 4 },
  updateText: { fontSize: 8, color: COLORS.muted, lineHeight: 1.4 },
});

const RISK_LABELS: Record<NivelRiesgo, string> = {
  'sin-riesgo': 'Sin riesgo',
  'bajo': 'Bajo',
  'medio': 'Medio',
  'alto': 'Alto',
  'muy-alto': 'Muy alto',
};

const GROUPS: Record<string, { label: string; codes: string[] }> = {
  europa: {
    label: 'Europa',
    codes: ['es', 'fr', 'it', 'de', 'gb', 'pt', 'gr', 'hr', 'nl', 'be', 'at', 'ch', 'ie', 'dk', 'se', 'no', 'fi', 'pl', 'cz', 'hu', 'ro', 'bg', 'sk', 'si', 'lt', 'lv', 'ee', 'is', 'lu', 'mt', 'cy', 'al', 'ba', 'me', 'rs', 'mk', 'xk'],
  },
  america: {
    label: 'América',
    codes: ['us', 'ca', 'mx', 'br', 'ar', 'co', 'pe', 'cl', 'ec', 've', 'gt', 'cu', 'do', 'pa', 'cr', 'uy', 'bo', 'py', 'sv', 'hn', 'ni', 'pr'],
  },
  asia: {
    label: 'Asia',
    codes: ['jp', 'kr', 'cn', 'in', 'th', 'vn', 'id', 'my', 'ph', 'sg', 'tr', 'ae', 'sa', 'il', 'jo', 'qa', 'kw', 'om', 'bh', 'lb', 'np', 'lk', 'bd', 'kh', 'la', 'mm', 'mn'],
  },
  africa: {
    label: 'África',
    codes: ['za', 'eg', 'ma', 'ke', 'tn', 'dz', 'gh', 'ng', 'et', 'tz', 'ug', 'zm', 'zw', 'mz', 'na', 'bw', 'mg', 'mu', 'sc', 'cv', 'sn', 'ci'],
  },
  oceania: {
    label: 'Oceanía',
    codes: ['au', 'nz', 'fj', 'pg', 'sb', 'vu', 'ws', 'to', 'ki', 'fm', 'mh', 'pw', 'tv', 'nr'],
  },
};

function getPaisSafe(code: string) {
  const p = paisesData[code.toLowerCase() as keyof typeof paisesData];
  return p || null;
}

function genPage(pageNum: number, children: React.ReactNode) {
  return (
    <Page size="A4" style={styles.page}>
      {children}
      <View style={styles.footer} fixed>
        <Text>Viaje con Inteligencia — Manual de Viajero — Compilado M.Castillo</Text>
        <Text style={styles.pageNumber}>{pageNum}</Text>
      </View>
    </Page>
  );
}

export default function ManualDocument({ lang = 'es' }: { lang?: string }) {
  const t = (es: string, en: string) => lang === 'en' ? en : es;
  const today = new Date();
  const todayStr = today.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const validUntil = new Date(today.getTime() + 90 * 86400000);
  const validUntilStr = validUntil.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
  const copyrightYear = today.getFullYear();

  const countries = Object.entries(paisesData).map(([code, p]) => ({ code, ...p }));
  const riesgoCount: Record<NivelRiesgo, number> = { 'sin-riesgo': 0, 'bajo': 0, 'medio': 0, 'alto': 0, 'muy-alto': 0 };
  for (const p of countries) { riesgoCount[p.nivelRiesgo]++; }

  return (
    <Document title={t('Manual de Viajero - Viaje con Inteligencia', 'Traveler Manual - Viaje con Inteligencia')} author="Viaje con Inteligencia - M.Castillo" subject={t('Guía completa de viajes', 'Complete travel guide')}>
      {/* === Cover === */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverGradient} />
        <Image style={styles.coverLogo} src="/logo.png" />
        <Text style={styles.coverTitle}>{t('Manual de', 'Traveler')}</Text>
        <Text style={styles.coverTitle}>{t('Viajero', 'Manual')}</Text>
        <Text style={styles.coverSubtitle}>Viaje con Inteligencia</Text>
        <Text style={styles.coverDesc}>
          {t('Guía completa con niveles de riesgo, contactos de emergencia, herramientas IA, comparativa de seguros y eventos globales para viajeros.', 'Complete guide with risk levels, emergency contacts, AI tools, insurance comparison and global events for travelers.')}
        </Text>
        <Text style={styles.coverValidity}>
          {t('Válido desde', 'Valid from')} {todayStr} {t('hasta', 'until')} {validUntilStr}
        </Text>
        <Text style={styles.coverVersion}>v{version}</Text>
        <Text style={styles.coverDate}>© {copyrightYear} Viaje con Inteligencia — Compilado M.Castillo</Text>
      </Page>

      {/* === TOC === */}
      {genPage(2,
        <>
          <Text style={styles.sectionTitle}>{t('Índice', 'Table of Contents')}</Text>

          <View style={styles.updateBox}>
            <Text style={styles.updateTitle}>{t('📅 Acerca de esta guía', '📅 About this guide')}</Text>
            <Text style={styles.updateText}>
              {t(
                `Este manual se generó el ${todayStr} con datos actualizados del Ministerio de Asuntos Exteriores (MAEC), fuentes OSINT y calendario de eventos globales. Los niveles de riesgo pueden cambiar. Descarga una nueva versión en cualquier momento desde viajeinteligencia.com/dashboard o fuerza la actualización con ?auth=false en la URL.`,
                `This manual was generated on ${todayStr} with updated data from the Ministry of Foreign Affairs (MAEC), OSINT sources and global events calendar. Risk levels may change. Download a new version anytime at viajeinteligencia.com/en/dashboard or force refresh with ?auth=false in the URL.`
              )}
            </Text>
          </View>

          <View style={styles.dividerLight} />
          <Text style={styles.tocSection}>1</Text>
          <View style={styles.tocItem}><Text style={styles.tocTitle}>{t('Resumen de Riesgos por País', 'Country Risk Summary')}</Text><Text style={styles.tocPage}>3</Text></View>
          <Text style={styles.tocSection}>2</Text>
          <View style={styles.tocItem}><Text style={styles.tocTitle}>{t('Países Detallados', 'Detailed Countries')}</Text><Text style={styles.tocPage}>4</Text></View>
          <Text style={styles.tocSection}>3</Text>
          <View style={styles.tocItem}><Text style={styles.tocTitle}>{t('Herramientas del Viajero', 'Traveler Tools')}</Text><Text style={styles.tocPage}>6</Text></View>
          <Text style={styles.tocSection}>4</Text>
          <View style={styles.tocItem}><Text style={styles.tocTitle}>{t('Comparativa de Seguros', 'Insurance Comparison')}</Text><Text style={styles.tocPage}>8</Text></View>
          <Text style={styles.tocSection}>5</Text>
          <View style={styles.tocItem}><Text style={styles.tocTitle}>{t('Eventos Globales', 'Global Events')}</Text><Text style={styles.tocPage}>9</Text></View>
          <Text style={styles.tocSection}>6</Text>
          <View style={styles.tocItem}><Text style={styles.tocTitle}>{t('Teléfonos de Emergencia', 'Emergency Numbers')}</Text><Text style={styles.tocPage}>10</Text></View>
        </>
      )}

      {/* === 1. Risk Summary === */}
      {genPage(3,
        <>
          <Text style={styles.sectionTitle}>{t('Resumen de Riesgos por País', 'Country Risk Summary')}</Text>
          <Text style={styles.p}>
            {t('Distribución de países según su nivel de riesgo según el Ministerio de Asuntos Exteriores (MAEC):', 'Country distribution by risk level according to the Ministry of Foreign Affairs:')}
          </Text>

          <View style={styles.card}>
            <View style={styles.flexRow}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.green }]} />
              <Text style={[styles.cardTitle, { flex: 1 }]}>{t('Sin riesgo', 'No risk')}</Text>
              <Text style={styles.badge}>{riesgoCount['sin-riesgo']} {t('países', 'countries')}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.flexRow}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.green }]} />
              <Text style={[styles.cardTitle, { flex: 1 }]}>{t('Bajo', 'Low')}</Text>
              <Text style={styles.badge}>{riesgoCount['bajo']} {t('países', 'countries')}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.flexRow}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.amber }]} />
              <Text style={[styles.cardTitle, { flex: 1 }]}>{t('Medio', 'Medium')}</Text>
              <Text style={styles.badge}>{riesgoCount['medio']} {t('países', 'countries')}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.flexRow}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.orange }]} />
              <Text style={[styles.cardTitle, { flex: 1 }]}>{t('Alto', 'High')}</Text>
              <Text style={styles.badge}>{riesgoCount['alto']} {t('países', 'countries')}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.flexRow}>
              <View style={[styles.riskDot, { backgroundColor: COLORS.red }]} />
              <Text style={[styles.cardTitle, { flex: 1 }]}>{t('Muy alto', 'Very high')}</Text>
              <Text style={styles.badge}>{riesgoCount['muy-alto']} {t('países', 'countries')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.h3}>{t('Top 10 países con riesgo más bajo', 'Top 10 lowest risk countries')}</Text>
          {countries.sort((a, b) => {
            const order: NivelRiesgo[] = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];
            return order.indexOf(a.nivelRiesgo) - order.indexOf(b.nivelRiesgo);
          }).slice(0, 10).map((c, i) => (
            <View key={i} style={styles.riskRow}>
              <View style={[styles.riskDot, { backgroundColor: RISK_COLORS[c.nivelRiesgo] }]} />
              <Text style={styles.riskName}>{c.nombre}</Text>
              <Text style={styles.riskLevel}>{RISK_LABELS[c.nivelRiesgo]}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.h3}>{t('Países con riesgo alto o muy alto', 'High/Very high risk countries')}</Text>
          {countries.filter(c => c.nivelRiesgo === 'alto' || c.nivelRiesgo === 'muy-alto').map((c, i) => (
            <View key={i} style={styles.riskRow}>
              <View style={[styles.riskDot, { backgroundColor: RISK_COLORS[c.nivelRiesgo] }]} />
              <Text style={styles.riskName}>{c.nombre}</Text>
              <Text style={styles.riskLevel}>{RISK_LABELS[c.nivelRiesgo]}</Text>
            </View>
          ))}
        </>
      )}

      {/* === 2. Countries by Region === */}
      {Object.entries(GROUPS).map(([regionKey, region]) => {
        const regionCountries = region.codes.map(code => getPaisSafe(code)).filter(Boolean);
        const pages = Math.ceil(regionCountries.length / 20);
        return Array.from({ length: pages }, (_, pi) => {
          const slice = regionCountries.slice(pi * 20, (pi + 1) * 20);
          const pageNum = 4 + Object.keys(GROUPS).indexOf(regionKey) + pi;
          return genPage(pageNum,
            <>
              <Text style={styles.sectionTitle}>{t('Países: ', 'Countries: ')}{region.label}</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{t('País', 'Country')}</Text>
                  <Text style={styles.tableCell}>{t('Capital', 'Capital')}</Text>
                  <Text style={styles.tableCell}>{t('Riesgo', 'Risk')}</Text>
                  <Text style={styles.tableCell}>{t('Continente', 'Continent')}</Text>
                </View>
                {slice.map((c: any, i: number) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.tableCellBold, { flex: 2 }]}>{c.nombre}</Text>
                    <Text style={styles.tableCell}>{c.capital || '-'}</Text>
                    <Text style={[styles.tableCell, { color: RISK_COLORS[c.nivelRiesgo as NivelRiesgo] }]}>
                      {RISK_LABELS[c.nivelRiesgo as NivelRiesgo]}
                    </Text>
                    <Text style={styles.tableCell}>{c.continente}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.small}>
                {t('Fuente: MAEC. Actualizado: ', 'Source: MAEC. Updated: ')}{todayStr}
              </Text>
            </>
          );
        });
      })}

      {/* === 3. Traveler Tools === */}
      {genPage(6,
        <>
          <Text style={styles.sectionTitle}>{t('Herramientas del Viajero', 'Traveler Tools')}</Text>
          <Text style={styles.p}>
            {t('Viaje con Inteligencia ofrece las siguientes herramientas para planificar tu viaje:', 'Viaje con Inteligencia offers the following tools to plan your trip:')}
          </Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>🌍</Text>
              <Text style={styles.featureName}>{t('Mapa Interactivo', 'Interactive Map')}</Text>
              <Text style={styles.featureDesc}>{t('Mapa mundial con niveles de riesgo MAEC, alertas en tiempo real y POIs.', 'World map with MAEC risk levels, real-time alerts and POIs.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>🤖</Text>
              <Text style={styles.featureName}>Chat IA</Text>
              <Text style={styles.featureDesc}>{t('Asistente IA para resolver dudas sobre viajes y destinos.', 'AI assistant for travel questions.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>📋</Text>
              <Text style={styles.featureName}>{t('Itinerario IA', 'AI Itinerary')}</Text>
              <Text style={styles.featureDesc}>{t('Genera itinerarios personalizados según tu perfil viajero.', 'Generate personalized AI itineraries.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>🛡️</Text>
              <Text style={styles.featureName}>{t('Comparador Seguros', 'Insurance Compare')}</Text>
              <Text style={styles.featureDesc}>{t('Compara 9 seguros de viaje por cobertura, precio y riesgo del destino.', 'Compare 9 travel insurance plans.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>📊</Text>
              <Text style={styles.featureName}>TCI</Text>
              <Text style={styles.featureDesc}>{t('Índice de coste de viaje con petróleo, estacionalidad y demanda.', 'Travel cost index with oil and demand.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>🔔</Text>
              <Text style={styles.featureName}>{t('Alertas OSINT', 'OSINT Alerts')}</Text>
              <Text style={styles.featureDesc}>{t('Alertas en tiempo real: terremotos, protestas, clima extremo.', 'Real-time alerts: earthquakes, protests, weather.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>⛽</Text>
              <Text style={styles.featureName}>{t('Petróleo y Vuelos', 'Oil & Flights')}</Text>
              <Text style={styles.featureDesc}>{t('Precio Brent y su impacto en coste de vuelos.', 'Brent oil price impact on flights.')}</Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={[styles.featureName, { fontSize: 16 }]}>📰</Text>
              <Text style={styles.featureName}>Blog</Text>
              <Text style={styles.featureDesc}>{t('Artículos, análisis y consejos sobre destinos.', 'Articles, analysis and tips.')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.updateBox}>
            <Text style={styles.updateTitle}>{t('🔄 ¿Necesitas una versión más reciente?', '🔄 Need a newer version?')}</Text>
            <Text style={styles.updateText}>
              {t(
                `Este documento expira el ${validUntilStr}. Los niveles de riesgo MAEC, eventos globales y alertas OSINT se actualizan diariamente. Descarga la guía actualizada en cualquier momento desde www.viajeinteligencia.com/dashboard.`,
                `This document expires on ${validUntilStr}. MAEC risk levels, global events and OSINT alerts are updated daily. Download the updated guide anytime at www.viajeinteligencia.com/en/dashboard.`
              )}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.h3}>{t('Perfiles de Viajero', 'Traveler Profiles')}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{t('Perfil', 'Profile')}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Descripción', 'Description')}</Text>
              <Text style={styles.tableCell}>{t('Presupuesto', 'Budget')}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>{t('Mochilero', 'Backpacker')}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Viajes largos, albergues, transp. público', 'Long trips, hostels, public transport')}</Text>
              <Text style={styles.tableCell}>€</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>{t('Lujo', 'Luxury')}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Hoteles 5*, gastronomía, premium', '5* hotels, gastronomy, premium')}</Text>
              <Text style={styles.tableCell}>€€€</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>{t('Familiar', 'Family')}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Seguridad, actividades infantiles', 'Safety, kids activities')}</Text>
              <Text style={styles.tableCell}>€€</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>{t('Aventura', 'Adventure')}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Deportes extremos, naturaleza', 'Extreme sports, nature')}</Text>
              <Text style={styles.tableCell}>€€</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellBold}>{t('Negocios', 'Business')}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Conectividad, centros negocios', 'Connectivity, business hubs')}</Text>
              <Text style={styles.tableCell}>€€€</Text>
            </View>
          </View>
        </>
      )}

      {/* === 4. Insurance Comparison === */}
      {genPage(8,
        <>
          <Text style={styles.sectionTitle}>{t('Comparativa de Seguros de Viaje', 'Travel Insurance Comparison')}</Text>
          <Text style={styles.p}>
            {t('Viaje con Inteligencia compara 9 aseguradoras analizando coberturas médicas, de evacuación, cancelación, equipaje y más. El sistema IRV ajusta las recomendaciones según el destino.', 'Viaje con Inteligencia compares 9 insurers analyzing medical, evacuation, cancellation, baggage coverage and more. The IRV system adjusts recommendations by destination.')}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.h3}>{t('Tipos de Cobertura', 'Coverage Types')}</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Cobertura', 'Coverage')}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{t('Descripción', 'Description')}</Text>
            </View>
            {[
              { name: t('Médica', 'Medical'), desc: t('Hospitalización, consultas, medicamentos', 'Hospitalization, consultations, medication') },
              { name: t('Evacuación', 'Evacuation'), desc: t('Repatriación o traslado a centro médico', 'Repatriation or medical transfer') },
              { name: t('Cancelación', 'Cancellation'), desc: t('Reembolso por cancelación del viaje', 'Trip cancellation refund') },
              { name: t('Equipaje', 'Baggage'), desc: t('Pérdida, robo o daño del equipaje', 'Lost, stolen or damaged baggage') },
              { name: t('RC', 'Liability'), desc: t('Responsabilidad civil a terceros', 'Third-party liability') },
              { name: t('Deportes', 'Sports'), desc: t('Deportes básicos o de aventura', 'Basic or adventure sports') },
              { name: 'Covid', desc: t('Gastos médicos COVID-19', 'COVID-19 medical expenses') },
            ].map((row, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCellBold}>{row.name}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>{row.desc}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('Recomendación por nivel de riesgo', 'Recommendation by risk level')}</Text>
            <Text style={styles.cardSub}>
              {t('Bajo: ≥300.000€ • Medio: ≥500.000€ • Alto: ≥1.000.000€ con evacuación ≥2.000.000€', 'Low: ≥€300K • Medium: ≥€500K • High: ≥€1M with evacuation ≥€2M')}
            </Text>
          </View>

          <Text style={[styles.small, { marginTop: 12 }]}>
            {t('Calcula tu seguro en viajeinteligencia.com/coste/seguros', 'Calculate at viajeinteligencia.com/en/cost/insurance')}
          </Text>
        </>
      )}

      {/* === 5. Global Events === */}
      {genPage(9,
        <>
          <Text style={styles.sectionTitle}>{t('Eventos Globales', 'Global Events')}</Text>
          <Text style={styles.p}>
            {t('Calendario de eventos que pueden afectar tu viaje (precios, disponibilidad, seguridad).', 'Calendar of events that may affect your trip (prices, availability, security).')}
          </Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{t('Evento', 'Event')}</Text>
              <Text style={styles.tableCell}>{t('País', 'Country')}</Text>
              <Text style={styles.tableCell}>{t('Mes', 'Month')}</Text>
              <Text style={styles.tableCell}>{t('Impacto', 'Impact')}</Text>
            </View>
            {[
              { name: t('Davos (Foro Económico)', 'Davos (World Economic Forum)'), country: t('Suiza', 'Switzerland'), month: t('Enero', 'January'), impact: t('Alto', 'High') },
              { name: t('Año Nuevo Chino', 'Chinese New Year'), country: t('China', 'China'), month: t('Ene/Feb', 'Jan/Feb'), impact: t('Alto', 'High') },
              { name: t('Carnaval de Río', 'Rio Carnival'), country: t('Brasil', 'Brazil'), month: t('Febrero', 'February'), impact: t('Alto', 'High') },
              { name: 'MWC Barcelona', country: t('España', 'Spain'), month: t('Febrero', 'February'), impact: t('Alto', 'High') },
              { name: t('Fallas de Valencia', 'Fallas Valencia'), country: t('España', 'Spain'), month: t('Marzo', 'March'), impact: t('Alto', 'High') },
              { name: t('Ramadán', 'Ramadan'), country: t('Mundial', 'Worldwide'), month: t('Marzo', 'March'), impact: t('Alto', 'High') },
              { name: t('Semana Santa', 'Easter Week'), country: t('España/México', 'Spain/Mexico'), month: t('Mar/Abr', 'Mar/Apr'), impact: t('Alto', 'High') },
              { name: t('Songkran', 'Songkran'), country: t('Tailandia', 'Thailand'), month: t('Abril', 'April'), impact: t('Alto', 'High') },
              { name: t('F1 Gran Premio Mónaco', 'F1 Monaco Grand Prix'), country: t('Mónaco', 'Monaco'), month: t('Mayo', 'May'), impact: t('Extremo', 'Extreme') },
              { name: t('Mundial Fútbol 2026', 'FIFA World Cup 2026'), country: 'EE.UU./MX/CA', month: t('Jun-Jul', 'Jun-Jul'), impact: t('Extremo', 'Extreme') },
              { name: 'Tomorrowland', country: t('Bélgica', 'Belgium'), month: t('Julio', 'July'), impact: t('Alto', 'High') },
              { name: t('San Fermín', 'San Fermin'), country: t('España', 'Spain'), month: t('Julio', 'July'), impact: t('Alto', 'High') },
              { name: 'Oktoberfest', country: t('Alemania', 'Germany'), month: t('Septiembre', 'September'), impact: t('Extremo', 'Extreme') },
              { name: 'Web Summit', country: t('Portugal', 'Portugal'), month: t('Octubre', 'October'), impact: t('Alto', 'High') },
              { name: 'Diwali', country: t('India', 'India'), month: t('Noviembre', 'November'), impact: t('Alto', 'High') },
              { name: t('Mercados Navideños', 'Christmas Markets'), country: t('Alemania', 'Germany'), month: t('Diciembre', 'December'), impact: t('Alto', 'High') },
            ].map((ev, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCellBold, { flex: 2 }]}>{ev.name}</Text>
                <Text style={styles.tableCell}>{ev.country}</Text>
                <Text style={styles.tableCell}>{ev.month}</Text>
                <Text style={[styles.tableCell, { color: ev.impact === t('Extremo', 'Extreme') ? COLORS.red : COLORS.amber }]}>{ev.impact}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.small, { marginTop: 12 }]}>
            {t('Calendario completo con 85+ eventos en viajeinteligencia.com/eventos', 'Full calendar with 85+ events at viajeinteligencia.com/en/events')}
          </Text>
        </>
      )}

      {/* === 6. Emergency Numbers === */}
      {genPage(10,
        <>
          <Text style={styles.sectionTitle}>{t('Teléfonos de Emergencia', 'Emergency Numbers')}</Text>
          <Text style={styles.p}>
            {t('Números de emergencia generales por región. El 112 funciona en toda la UE.', 'General emergency numbers by region. 112 works across the EU.')}
          </Text>

          <View style={styles.emergencyBox}>
            <Text style={{ color: '#fca5a5', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
              {t('EMERGENCIA EN EL EXTRANJERO', 'EMERGENCY ABROAD')}
            </Text>
            <Text style={styles.emergencyTel}>+34 91 394 89 00</Text>
            <Text style={{ color: '#fca5a5', fontSize: 9, textAlign: 'center' }}>
              {t('MAEC - Protección Consular (24h)', 'MAEC - Consular Protection (24h)')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{t('Región', 'Region')}</Text>
              <Text style={styles.tableCell}>{t('General', 'General')}</Text>
              <Text style={styles.tableCell}>{t('Policía', 'Police')}</Text>
              <Text style={styles.tableCell}>{t('Ambulancia', 'Ambulance')}</Text>
              <Text style={styles.tableCell}>{t('Bomberos', 'Fire')}</Text>
            </View>
            {[
              { region: 'Europa', general: '112', policia: '112', ambulancia: '112', bomberos: '112' },
              { region: t('América', 'Americas'), general: '911', policia: '911', ambulancia: '911', bomberos: '911' },
              { region: 'Asia', general: '112', policia: '110', ambulancia: '120', bomberos: '119' },
              { region: 'África', general: '112', policia: '112', ambulancia: '112', bomberos: '112' },
              { region: 'Oceanía', general: '112', policia: '112', ambulancia: '112', bomberos: '112' },
            ].map((row, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCellBold, { flex: 1.5 }]}>{row.region}</Text>
                <Text style={styles.tableCell}>{row.general}</Text>
                <Text style={styles.tableCell}>{row.policia}</Text>
                <Text style={styles.tableCell}>{row.ambulancia}</Text>
                <Text style={styles.tableCell}>{row.bomberos}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.h3}>{t('Recomendaciones', 'Recommendations')}</Text>
          <View style={styles.card}>
            <Text style={styles.cardSub}>• {t('Regístrate en el Registro de Viajeros del MAEC', 'Register in the MAEC Traveler Registry')}</Text>
            <Text style={styles.cardSub}>• {t('Lleva copia del pasaporte y documentación', 'Carry a copy of your passport and documents')}</Text>
            <Text style={styles.cardSub}>• {t('Contrata seguro de viaje con cobertura suficiente', 'Get travel insurance with adequate coverage')}</Text>
            <Text style={styles.cardSub}>• {t('Activa notificaciones para alertas en tiempo real', 'Enable notifications for real-time alerts')}</Text>
            <Text style={styles.cardSub}>• {t('Comparte tu itinerario con familiares', 'Share your itinerary with family')}</Text>
          </View>
        </>
      )}

      {/* === Back Cover === */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverGradient} />
        <Image style={styles.coverLogo} src="/logo.png" />
        <Text style={styles.coverTitle}>{t('Buen viaje', 'Safe travels')}</Text>
        <Text style={{ fontSize: 40, marginVertical: 16 }}>🌍✈️</Text>
        <Text style={styles.coverDesc}>
          {t('Viaje con Inteligencia — Tu compañero de viaje inteligente', 'Viaje con Inteligencia — Your intelligent travel companion')}
        </Text>
        <Text style={styles.coverVersion}>www.viajeinteligencia.com</Text>
        <Text style={{ position: 'absolute', bottom: 30, fontSize: 8, color: COLORS.slateLight }}>
          © {copyrightYear} Viaje con Inteligencia — Compilado M.Castillo
        </Text>
      </Page>
    </Document>
  );
}
