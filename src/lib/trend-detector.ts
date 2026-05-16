import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';

const log = createLogger('TrendDetector');

export interface CountryHeat {
  country: string;
  level: 0 | 1 | 2 | 3;
  label: string;
  signals24h: number;
  baseline: number;
  spike: number;
  keywords: string[];
  toneDrop: number | null;
  reasons: string[];
}

const STOP_WORDS = new Set([
  'que', 'para', 'con', 'las', 'los', 'una', 'por', 'del', 'como', 'más',
  'pero', 'sus', 'han', 'the', 'and', 'for', 'that', 'this', 'have', 'from',
  'dijo', 'según', 'sobre', 'entre', 'tiene', 'hace', 'todo', 'cada',
  'país', 'viaje', 'travel', 'viajar', 'turista', 'turismo',
]);

function extractKeywords(texts: string[], max = 5): string[] {
  const freq = new Map<string, number>();
  for (const t of texts) {
    const words = t.toLowerCase().split(/[\s,.;:!?()"']+/);
    for (const w of words) {
      if (w.length < 4 || STOP_WORDS.has(w) || /^\d+$/.test(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

function detectLocation(texts: string[]): string[] {
  const candidates = new Map<string, number>();
  for (const t of texts) {
    const parts = t.split(/[\s,]+/);
    for (const p of parts) {
      const word = p.replace(/^[A-Z]/, '').trim();
      if (word.length >= 4 && word[0] === word[0].toUpperCase()) {
        candidates.set(word, (candidates.get(word) || 0) + 1);
      }
    }
  }
  return [...candidates.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
}

export async function detectHeatmap(): Promise<CountryHeat[]> {
  if (!supabase) return [];

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data: recentSignals } = await supabase
    .from('osint_signals')
    .select('location_name, summary, tone_score, category, urgency, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(500);

  if (!recentSignals || recentSignals.length === 0) return [];

  const byCountry = new Map<string, {
    recent: typeof recentSignals;
    all: typeof recentSignals;
  }>();

  for (const s of recentSignals) {
    const text = `${s.location_name || ''} ${s.summary || ''}`;
    for (const country of extractLocationCandidates(text)) {
      if (!byCountry.has(country)) byCountry.set(country, { recent: [], all: [] });
      const entry = byCountry.get(country)!;
      entry.all.push(s);
      if (new Date(s.created_at) >= twentyFourHoursAgo) entry.recent.push(s);
    }
  }

  const baselineStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const baselineEnd = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const baselineDays = 6;

  const results: CountryHeat[] = [];

  for (const [country, data] of byCountry) {
    const signals24h = data.recent.length;
    if (signals24h < 2) continue;

    const baseline = Math.round(data.all.length / baselineDays);
    const spike = baseline > 0 ? Math.round((signals24h / baseline) * 100) / 100 : signals24h;

    const summaries = data.recent.map(s => `${s.location_name || ''} ${s.summary || ''}`);
    const keywords = extractKeywords(summaries);

    const toneScores = data.recent.map(s => s.tone_score).filter((t): t is number => t != null);
    const baselineTones = data.all
      .filter(s => new Date(s.created_at) < twentyFourHoursAgo)
      .map(s => s.tone_score)
      .filter((t): t is number => t != null);

    let toneDrop: number | null = null;
    if (toneScores.length >= 2 && baselineTones.length >= 3) {
      const avgRecent = toneScores.reduce((a, b) => a + b, 0) / toneScores.length;
      const avgBaseline = baselineTones.reduce((a, b) => a + b, 0) / baselineTones.length;
      toneDrop = Math.round((avgRecent - avgBaseline) * 10) / 10;
    }

    const reasons: string[] = [];
    let level: 0 | 1 | 2 | 3 = 0;

    if (spike >= 3) { level = 3; reasons.push(`Volumen x${spike} en 24h`); }
    else if (spike >= 2) { level = 2; reasons.push(`Volumen x${spike} en 24h`); }
    else if (spike >= 1.5) { level = 1; reasons.push(`Volumen x${spike} en 24h`); }

    if (toneDrop !== null && toneDrop < -5) {
      level = Math.max(level, 3) as 0|1|2|3;
      reasons.push(`Sentimiento cayó ${toneDrop}pts`);
    } else if (toneDrop !== null && toneDrop < -3) {
      level = Math.max(level, 2) as 0|1|2|3;
      reasons.push(`Sentimiento cayó ${toneDrop}pts`);
    } else if (toneDrop !== null && toneDrop < -1) {
      level = Math.max(level, 1) as 0|1|2|3;
      reasons.push(`Sentimiento cayó ${toneDrop}pts`);
    }

    const alertKeywords = ['huelga', 'protesta', 'golpe', 'crisis', 'aeropuerto',
      'hospital', 'saturado', 'colapsado', 'emergencia', 'conflicto',
      'manifestación', 'paro', 'bloqueo', 'huelga', 'disturbio',
      'strike', 'protest', 'coup', 'riot', 'collapse'];
    const foundAlerts = keywords.filter(k => alertKeywords.includes(k));
    if (foundAlerts.length > 0) {
      level = Math.max(level, 2) as 0|1|2|3;
      reasons.push(`Alert keywords: ${foundAlerts.join(', ')}`);
    }

    const urgencySignals = data.recent.filter(s => s.urgency === 'high' || s.urgency === 'critical');
    if (urgencySignals.length >= 2) {
      level = Math.max(level, 2) as 0|1|2|3;
      reasons.push(`${urgencySignals.length} señales de alta urgencia`);
    }

    if (level === 0) continue;

    const label = level === 3 ? 'Alerta temprana' : level === 2 ? 'Monitorizar' : 'Leve';

    results.push({
      country, level, label, signals24h, baseline, spike,
      keywords, toneDrop, reasons,
    });
  }

  return results.sort((a, b) => b.level - a.level || b.spike - a.spike);
}

function extractLocationCandidates(text: string): string[] {
  const knownCountries = [
    'españa', 'méxico', 'argentina', 'colombia', 'perú', 'chile', 'venezuela',
    'ecuador', 'guatemala', 'cuba', 'bolivia', 'república dominicana', 'honduras',
    'paraguay', 'nicaragua', 'el salvador', 'costa rica', 'panamá', 'uruguay',
    'brazil', 'mexico', 'spain', 'argentina', 'colombia', 'peru', 'chile',
    'france', 'germany', 'italy', 'uk', 'united kingdom', 'usa', 'united states',
    'china', 'russia', 'india', 'japan', 'australia', 'canada', 'turkey',
    'thailand', 'vietnam', 'indonesia', 'philippines', 'egypt', 'morocco',
    'south africa', 'nigeria', 'kenya', 'portugal', 'netherlands', 'greece',
    'sweden', 'norway', 'denmark', 'finland', 'poland', 'ukraine', 'romania',
    'czech', 'hungary', 'austria', 'switzerland', 'belgium', 'ireland',
    'new zealand', 'singapore', 'malaysia', 'taiwan', 'south korea',
  ];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const c of knownCountries) {
    if (lower.includes(c)) found.push(c.charAt(0).toUpperCase() + c.slice(1));
  }
  if (found.length === 0) found.push(...detectLocation([text]));
  return found;
}
