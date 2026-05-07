import { supabaseAdmin } from './supabase-admin';

const TYPE_CONFIG: Record<string, { label: string; verb: string; icon: string }> = {
  terrorism: { label: 'Terrorismo', verb: 'evitar', icon: '⚠️' },
  airspace_closure: { label: 'Cierre espacio aéreo', verb: 'monitorizar', icon: '✈️' },
  conflict: { label: 'Conflicto activo', verb: 'evitar', icon: '💥' },
  natural_disaster: { label: 'Desastre natural', verb: 'monitorizar', icon: '🌍' },
  flight_disruption: { label: 'Disrupción vuelos', verb: 'preparar', icon: '🛫' },
  health_outbreak: { label: 'Brote sanitario', verb: 'preparar', icon: '🏥' },
  protest: { label: 'Protestas / Huelgas', verb: 'monitorizar', icon: '📢' },
  travel_advisory: { label: 'Aviso de viaje', verb: 'preparar', icon: '📋' },
  security_threat: { label: 'Amenaza seguridad', verb: 'evitar', icon: '🔒' },
  infrastructure: { label: 'Infraestructura dañada', verb: 'evitar', icon: '🏗️' },
};

const CATEGORY_TO_TYPE: Record<string, string> = {
  salud: 'health_outbreak',
  seguridad: 'security_threat',
  clima: 'natural_disaster',
  logistico: 'flight_disruption',
  geopolitico: 'conflict',
  otro: 'travel_advisory',
};

const URGENCY_TO_SEVERITY: Record<string, string> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const RECOMMENDATIONS: Record<string, Record<string, string>> = {
  terrorism: {
    critical: 'NO viajar a la zona. Contacta con embajada si estás allí. Registra tu viaje en consulado.',
    high: 'Evitar la zona afectada. Extremar precauciones. Seguro de viaje imprescindible.',
    medium: 'Monitorizar situación. Evitar aglomeraciones. Tener plan de salida.',
    low: 'Situación bajo control. Mantenerse informado de fuentes oficiales.',
  },
  conflict: {
    critical: 'NO viajar. Evacuar si estás en la zona. Contactar con embajada urgente.',
    high: 'Evitar la zona. Si viajas, tener plan de evacuación. Seguro obligatorio.',
    medium: 'Monitorizar evolución. Considerar posponer viaje. Registra viaje en consulado.',
    low: 'Zona estable pero monitorizar. Seguro de viaje recomendado.',
  },
  flight_disruption: {
    critical: 'Posible cancelación. Contacta con aerolínea ANTES de ir al aeropuerto. Considera alternativas.',
    high: 'Alta probabilidad de retrasos. Llega 3h antes al aeropuerto. Monitoriza tu vuelo.',
    medium: 'Posibles retrasos. Verifica estado de vuelo antes de salir. Seguro de viaje cubre.',
    low: 'Situación normal pero puede afectar a algunas rutas. Verifica con tu aerolínea.',
  },
  natural_disaster: {
    critical: 'NO viajar a la zona. Emergencia activa. Sigue instrucciones autoridades locales.',
    high: 'Zona afectada. Si estás allí, sigue protocolos de emergencia. Evacuar si es necesario.',
    medium: 'Monitorizar alertas. Tener kit emergencia. Seguro con cobertura desastres.',
    low: 'Situación controlada. Mantenerse informado. Seguro básico recomendado.',
  },
  health_outbreak: {
    critical: 'NO viajar. Brote activo. Vacunación obligatoria si disponible.',
    high: 'Evitar zona. Vacunarse antes de viajar. Seguro médico con cobertura amplia.',
    medium: 'Precauciones extra. Botiquín básico. Agua embotellada solo. Seguro médico.',
    low: 'Situación estable. Higiene reforzada. Seguro médico básico.',
  },
  protest: {
    critical: 'Evitar zona de protestas. Posibles disturbios. Tener plan alternativo.',
    high: 'Evitar manifestaciones. Transportes afectados. Monitorizar redes locales.',
    medium: 'Posibles afectaciones puntuales. Rutas alternativas disponibles.',
    low: 'Protestas pacíficas planificadas. Sin impacto significativo en turismo.',
  },
  airspace_closure: {
    critical: 'Espacio aéreo cerrado. NO intentar volar. Buscar alternativas terrestres.',
    high: 'Rutas desviadas. Vuelos cancelados/retrasados. Contactar aerolínea.',
    medium: 'Posibles desvíos. Monitorizar estado de vuelos. Plan B recomendado.',
    low: 'Restricciones menores. Impacto mínimo en vuelos comerciales.',
  },
};

const EXPIRY_HOURS: Record<string, number> = {
  terrorism: 72,
  conflict: 48,
  flight_disruption: 24,
  natural_disaster: 36,
  health_outbreak: 168,
  protest: 12,
  airspace_closure: 24,
  travel_advisory: 168,
  security_threat: 72,
  infrastructure: 168,
};

export interface SignalForClustering {
  category: string;
  urgency: string;
  location_name: string | null;
  country_code: string | null;
  summary: string;
  source: string;
  source_url: string | null;
  created_at: Date;
  is_first_person: boolean;
}

function extractCountryCode(text: string): string | null {
  const countryMap: Record<string, string> = {
    'france': 'fr', 'paris': 'fr', 'lyon': 'fr', 'marseille': 'fr',
    'spain': 'es', 'madrid': 'es', 'barcelona': 'es',
    'uk': 'gb', 'united kingdom': 'gb', 'london': 'gb',
    'germany': 'de', 'berlin': 'de', 'frankfurt': 'de', 'munich': 'de',
    'italy': 'it', 'rome': 'it', 'milan': 'it',
    'usa': 'us', 'united states': 'us', 'new york': 'us', 'los angeles': 'us',
    'japan': 'jp', 'tokyo': 'jp', 'osaka': 'jp',
    'mexico': 'mx', 'cancun': 'mx',
    'brazil': 'br', 'rio': 'br',
    'india': 'in', 'delhi': 'in',
    'china': 'cn', 'beijing': 'cn',
    'russia': 'ru', 'moscow': 'ru',
    'ukraine': 'ua', 'kyiv': 'ua',
    'israel': 'il', 'tel aviv': 'il',
    'turkey': 'tr', 'istanbul': 'tr',
    'egypt': 'eg', 'cairo': 'eg',
    'thailand': 'th', 'bangkok': 'th',
    'portugal': 'pt', 'lisbon': 'pt',
    'greece': 'gr', 'athens': 'gr',
    'morocco': 'ma', 'casablanca': 'ma',
    'argentina': 'ar', 'buenos aires': 'ar',
    'colombia': 'co', 'bogota': 'co',
  };
  
  const lower = text.toLowerCase();
  for (const [key, code] of Object.entries(countryMap)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

function getIncidentType(category: string, title: string): string {
  const lower = title.toLowerCase();
  
  if (lower.includes('terror') || lower.includes('bomb') || lower.includes('shooting') || lower.includes('attack')) return 'terrorism';
  if (lower.includes('airspace') || lower.includes('no-fly') || lower.includes('closed airspace')) return 'airspace_closure';
  if (lower.includes('conflict') || lower.includes('war') || lower.includes('military') || lower.includes('escalat')) return 'conflict';
  if (lower.includes('earthquake') || lower.includes('flood') || lower.includes('hurricane') || lower.includes('tsunami') || lower.includes('volcano')) return 'natural_disaster';
  if (lower.includes('flight') || lower.includes('cancel') || lower.includes('airline') || lower.includes('delay') || lower.includes('strike')) return 'flight_disruption';
  if (lower.includes('outbreak') || lower.includes('disease') || lower.includes('epidemic') || lower.includes('virus') || lower.includes('cholera')) return 'health_outbreak';
  if (lower.includes('protest') || lower.includes('strike') || lower.includes('riot') || lower.includes('demonstrat')) return 'protest';
  if (lower.includes('advisory') || lower.includes('warning') || lower.includes('alert') || lower.includes('risk')) return 'travel_advisory';
  
  return CATEGORY_TO_TYPE[category] || 'travel_advisory';
}

function getRecommendation(type: string, severity: string): string {
  return RECOMMENDATIONS[type]?.[severity] || RECOMMENDATIONS.travel_advisory[severity] || 'Monitorizar situación y seguir fuentes oficiales.';
}

function getExpiryDate(type: string): Date {
  const hours = EXPIRY_HOURS[type] || 48;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function detectAndCreateIncidents(): Promise<{ created: number; updated: number }> {
  if (!supabaseAdmin) return { created: 0, updated: 0 };

  const now = new Date();
  const windowStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const { data: signals } = await supabaseAdmin
    .from('osint_signals')
    .select('*')
    .gte('created_at', windowStart.toISOString())
    .order('created_at', { ascending: false });

  if (!signals || signals.length === 0) return { created: 0, updated: 0 };

  const { data: existing } = await supabaseAdmin
    .from('incidents')
    .select('id, entity_id, type, country_code, signal_count')
    .eq('is_active', true);

  const existingMap = new Map<string, any>();
  for (const inc of existing || []) {
    existingMap.set(inc.entity_id, inc);
  }

  const clusterKey = (signal: any): string => {
    const type = getIncidentType(signal.category || 'otro', signal.title || signal.summary || '');
    const location = (signal.location_name || '').toLowerCase().trim();
    const country = signal.country_code || extractCountryCode(signal.title + ' ' + signal.summary + ' ' + location) || 'unknown';
    const dateStr = signal.created_at ? new Date(signal.created_at).toISOString().split('T')[0] : now.toISOString().split('T')[0];
    return `${type}-${country}-${location}-${dateStr}`;
  };

  const clusters: Record<string, typeof signals> = {};
  for (const signal of signals) {
    const key = clusterKey(signal);
    if (!clusters[key]) clusters[key] = [];
    clusters[key].push(signal);
  }

  let created = 0;
  let updated = 0;

  for (const [key, clusterSignals] of Object.entries(clusters)) {
    const topSignal = clusterSignals[0];
    const type = getIncidentType(topSignal.category || 'otro', topSignal.title || topSignal.summary || '');
    const country = topSignal.country_code || extractCountryCode(topSignal.title + ' ' + topSignal.summary + ' ' + (topSignal.location_name || '')) || 'unknown';
    const location = topSignal.location_name || '';
    const maxUrgency = clusterSignals.reduce((max, s) => {
      const order = ['low', 'medium', 'high', 'critical'];
      return order.indexOf(s.urgency) > order.indexOf(max) ? s.urgency : max;
    }, 'low');
    const severity = URGENCY_TO_SEVERITY[maxUrgency];
    const title = topSignal.title || topSignal.summary || 'Incidente detectado';
    const cleanTitle = title.replace(/^📡\s*GDELT:\s*/i, '').replace(/^⚠️\s*GDACS:\s*/i, '').replace(/^🌍\s*/i, '').replace(/^📰\s*/i, '');
    
    const firstPersonCount = clusterSignals.filter(s => s.is_first_person).length;
    const sources = [...new Set(clusterSignals.map(s => s.source))];
    const source = sources.length > 1 ? 'combined' : sources[0];
    const description = clusterSignals.slice(0, 3).map(s => s.summary || s.title).join('\n');
    const recommendation = getRecommendation(type, severity);
    const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.travel_advisory;
    const expiresAt = getExpiryDate(type);

    if (existingMap.has(key)) {
      const existingInc = existingMap.get(key);
      await supabaseAdmin
        .from('incidents')
        .update({
          signal_count: existingInc.signal_count + clusterSignals.length,
          severity,
          recommendation,
          expires_at: expiresAt.toISOString(),
          source,
        })
        .eq('entity_id', key);
      updated++;
    } else {
      await supabaseAdmin
        .from('incidents')
        .insert({
          type,
          entity_id: key,
          title: cleanTitle,
          description,
          country_code: country === 'unknown' ? null : country,
          location: location || null,
          severity,
          recommendation,
          action_verb: typeConfig.verb,
          source,
          signal_count: clusterSignals.length,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });
      created++;
    }
  }

  const { data: expiredIncidents } = await supabaseAdmin
    .from('incidents')
    .select('id')
    .eq('is_active', true)
    .lt('expires_at', now.toISOString());

  if (expiredIncidents && expiredIncidents.length > 0) {
    await supabaseAdmin
      .from('incidents')
      .update({ is_active: false, resolved_at: now.toISOString() })
      .in('id', expiredIncidents.map(i => i.id));
  }

  return { created, updated };
}
