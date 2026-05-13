import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';

const TYPE_CONFIG: Record<string, { label: string; verb: string; icon: string }> = {
  terrorism: { label: 'Terrorismo', verb: 'evitar', icon: '⚠️' },
  airspace_closure: { label: 'Cierre espacio aereo', verb: 'monitorizar', icon: '✈️' },
  conflict: { label: 'Conflicto activo', verb: 'evitar', icon: '💥' },
  natural_disaster: { label: 'Desastre natural', verb: 'monitorizar', icon: '🌍' },
  flight_disruption: { label: 'Disrupcion vuelos', verb: 'preparar', icon: '🛫' },
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
    critical: 'NO viajar a la zona. Contacta con embajada si estas alli. Registra tu viaje en consulado.',
    high: 'Evitar la zona afectada. Extremar precauciones. Seguro de viaje imprescindible.',
    medium: 'Monitorizar situacion. Evitar aglomeraciones. Tener plan de salida.',
    low: 'Situacion bajo control. Mantenerse informado de fuentes oficiales.',
  },
  conflict: {
    critical: 'NO viajar. Evacuar si estas en la zona. Contactar con embajada urgente.',
    high: 'Evitar la zona. Si viajas, tener plan de evacuacion. Seguro obligatorio.',
    medium: 'Monitorizar evolucion. Considerar posponer viaje. Registra viaje en consulado.',
    low: 'Zona estable pero monitorizar. Seguro de viaje recomendado.',
  },
  flight_disruption: {
    critical: 'Posible cancelacion. Contacta con aerolinea ANTES de ir al aeropuerto. Considera alternativas.',
    high: 'Alta probabilidad de retrasos. Llega 3h antes al aeropuerto. Monitoriza tu vuelo.',
    medium: 'Posibles retrasos. Verifica estado de vuelo antes de salir. Seguro de viaje cubre.',
    low: 'Situacion normal pero puede afectar a algunas rutas. Verifica con tu aerolinea.',
  },
  natural_disaster: {
    critical: 'NO viajar a la zona. Emergencia activa. Sigue instrucciones autoridades locales.',
    high: 'Zona afectada. Si estas alli, sigue protocolos de emergencia. Evacuar si es necesario.',
    medium: 'Monitorizar alertas. Tener kit emergencia. Seguro con cobertura desastres.',
    low: 'Situacion controlada. Mantenerse informado. Seguro basico recomendado.',
  },
  health_outbreak: {
    critical: 'NO viajar. Brote activo. Vacunacion obligatoria si disponible.',
    high: 'Evitar zona. Vacunarse antes de viajar. Seguro medico con cobertura amplia.',
    medium: 'Precauciones extra. Botiquin basico. Agua embotellada solo. Seguro medico.',
    low: 'Situacion estable. Higiene reforzada. Seguro medico basico.',
  },
  protest: {
    critical: 'Evitar zona de protestas. Posibles disturbios. Tener plan alternativo.',
    high: 'Evitar manifestaciones. Transportes afectados. Monitorizar redes locales.',
    medium: 'Posibles afectaciones puntuales. Rutas alternativas disponibles.',
    low: 'Protestas pacificas planificadas. Sin impacto significativo en turismo.',
  },
  airspace_closure: {
    critical: 'Espacio aereo cerrado. NO intentar volar. Buscar alternativas terrestres.',
    high: 'Rutas desviadas. Vuelos cancelados/retrasados. Contactar aerolinea.',
    medium: 'Posibles desvios. Monitorizar estado de vuelos. Plan B recomendado.',
    low: 'Restricciones menores. Impacto minimo en vuelos comerciales.',
  },
  travel_advisory: {
    critical: 'NO viajar. Emergencia activa. Contacta con embajada si estas en el pais.',
    high: 'Evitar viajes no esenciales. Revisar requisitos de entrada. Seguro obligatorio.',
    medium: 'Precauciones adicionales. Verificar requisitos actualizados antes de viajar.',
    low: 'Mantenerse informado. Requisitos de entrada estandar aplican.',
  },
  security_threat: {
    critical: 'Amenaza activa. Evacuar si es posible. Contactar con autoridades locales.',
    high: 'Evitar zonas concurridas y eventos publicos. Extremar vigilancia.',
    medium: 'Aumento de medidas de seguridad. Posibles restricciones temporales.',
    low: 'Nivel de alerta normal. Medidas de seguridad rutinarias.',
  },
};

const EXPIRY_HOURS: Record<string, number> = {
  terrorism: 72,
  conflict: 48,
  flight_disruption: 24,
  natural_disaster: 36,
  health_outbreak: 168,
  protest: 24,
  airspace_closure: 24,
  travel_advisory: 168,
  security_threat: 72,
  infrastructure: 168,
};

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
    'cambodia': 'kh', 'phnom penh': 'kh',
    'myanmar': 'mm', 'yangon': 'mm',
    'venezuela': 've', 'caracas': 've',
    'cuba': 'cu', 'havana': 'cu',
    'iran': 'ir', 'tehran': 'ir',
    'iraq': 'iq', 'baghdad': 'iq',
    'afghanistan': 'af', 'kabul': 'af',
    'syria': 'sy', 'damascus': 'sy',
    'lebanon': 'lb', 'beirut': 'lb',
    'pakistan': 'pk', 'islamabad': 'pk',
    'nigeria': 'ng', 'abuja': 'ng',
    'ethiopia': 'et', 'addis ababa': 'et',
    'south africa': 'za', 'johannesburg': 'za', 'cape town': 'za',
    'kenya': 'ke', 'nairobi': 'ke',
    'peru': 'pe', 'lima': 'pe',
    'chile': 'cl', 'santiago': 'cl',
    'costa rica': 'cr', 'san jose': 'cr',
    'panama': 'pa', 'panama city': 'pa',
    'dominican republic': 'do', 'santo domingo': 'do',
    'philippines': 'ph', 'manila': 'ph',
    'indonesia': 'id', 'jakarta': 'id', 'bali': 'id',
    'vietnam': 'vn', 'hanoi': 'vn', 'ho chi minh': 'vn',
    'malaysia': 'my', 'kuala lumpur': 'my',
    'singapore': 'sg',
    'south korea': 'kr', 'seoul': 'kr',
    'taiwan': 'tw', 'taipei': 'tw',
    'australia': 'au', 'sydney': 'au', 'melbourne': 'au',
    'new zealand': 'nz', 'auckland': 'nz',
    'netherlands': 'nl', 'amsterdam': 'nl',
    'belgium': 'be', 'brussels': 'be',
    'switzerland': 'ch', 'zurich': 'ch',
    'sweden': 'se', 'stockholm': 'se',
    'norway': 'no', 'oslo': 'no',
    'poland': 'pl', 'warsaw': 'pl',
    'czech republic': 'cz', 'prague': 'cz',
    'hungary': 'hu', 'budapest': 'hu',
    'romania': 'ro', 'bucharest': 'ro',
    'austria': 'at', 'vienna': 'at',
    'denmark': 'dk', 'copenhagen': 'dk',
    'finland': 'fi', 'helsinki': 'fi',
    'ireland': 'ie', 'dublin': 'ie',
  };
  
  const lower = text.toLowerCase();
  for (const [key, code] of Object.entries(countryMap)) {
    if (lower.includes(key)) return code;
  }
  return null;
}

function getIncidentType(category: string, title: string): string {
  const lower = title ? title.toLowerCase() : '';
  
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
  const sev = severity || 'low';
  const typeRecs = RECOMMENDATIONS[type];
  if (typeRecs && typeRecs[sev]) return typeRecs[sev];
  const travelRecs = RECOMMENDATIONS.travel_advisory;
  if (travelRecs && travelRecs[sev]) return travelRecs[sev];
  return 'Monitorizar situacion y seguir fuentes oficiales.';
}

function getExpiryDate(type: string): Date {
  const hours = EXPIRY_HOURS[type] || 48;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export async function detectAndCreateIncidents(): Promise<{ created: number; updated: number }> {
  if (!isSupabaseAdminConfigured()) return { created: 0, updated: 0 };

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
    const textForCountry = (signal.title || '') + ' ' + (signal.summary || '') + ' ' + location;
    const country = signal.country_code || extractCountryCode(textForCountry) || 'unknown';
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
    if (clusterSignals.length === 0) continue;
    
    const topSignal = clusterSignals[0];
    const type = getIncidentType(topSignal.category || 'otro', topSignal.title || topSignal.summary || '');
    const textForCountry = (topSignal.title || '') + ' ' + (topSignal.summary || '') + ' ' + (topSignal.location_name || '');
    const country = topSignal.country_code || extractCountryCode(textForCountry) || 'unknown';
    const location = topSignal.location_name || '';
    
    const urgencyOrder = ['low', 'medium', 'high', 'critical'];
    const maxUrgency = clusterSignals.reduce((max, s) => {
      const urgency = s.urgency || 'low';
      return urgencyOrder.indexOf(urgency) > urgencyOrder.indexOf(max) ? urgency : max;
    }, 'low');
    
    const severity = URGENCY_TO_SEVERITY[maxUrgency] || 'low';
    const title = topSignal.title || topSignal.summary || 'Incidente detectado';
    const cleanTitle = title.replace(/^📡\s*GDELT:\s*/i, '').replace(/^⚠️\s*GDACS:\s*/i, '').replace(/^🌍\s*/i, '').replace(/^📰\s*/i, '');
    
    const firstPersonCount = clusterSignals.filter(s => s.is_first_person).length;
    const sources = [...new Set(clusterSignals.map(s => s.source))];
    const source = sources.length > 1 ? 'combined' : (sources[0] || 'osint');
    const description = clusterSignals.slice(0, 3).map(s => s.summary || s.title).filter(Boolean).join('\n');
    const recommendation = getRecommendation(type, severity);
    const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.travel_advisory;
    const expiresAt = getExpiryDate(type);

    if (existingMap.has(key)) {
      const existingInc = existingMap.get(key);
      await supabaseAdmin
        .from('incidents')
        .update({
          signal_count: (existingInc.signal_count || 0) + clusterSignals.length,
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
          description: description || null,
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
