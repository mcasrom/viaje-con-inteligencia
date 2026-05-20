import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { paisesData } from '@/data/paises';

const log = createLogger('WordTrends');

const STOP_WORDS = new Set([
  'que', 'para', 'con', 'las', 'los', 'una', 'por', 'del', 'como', 'más',
  'pero', 'sus', 'han', 'the', 'and', 'for', 'that', 'this', 'have', 'from',
  'dijo', 'según', 'sobre', 'entre', 'tiene', 'hace', 'todo', 'cada',
  'país', 'viaje', 'travel', 'viajar', 'turista', 'turismo', 'not', 'are',
  'was', 'has', 'been', 'were', 'will', 'what', 'when', 'where', 'which',
  'their', 'they', 'them', 'also', 'after', 'before', 'than', 'then',
  'informó', 'reportó', 'señaló', 'confirmó', 'registró', 'nuevo',
  'report', 'said', 'according', 'could', 'would', 'should', 'about',
  'hospitales', 'hospital', 'gobierno', 'presidente', 'ministro',
  'authorities', 'officials', 'government', 'people', 'años', 'países',
]);

const MIN_WORD_LENGTH = 4;
const TOP_WORDS = 30;
const ANOMALY_Z_THRESHOLD = 2;
const ANOMALY_RATIO_THRESHOLD = 3;

const countryNames = new Map<string, string>();
for (const p of Object.values(paisesData)) {
  countryNames.set(p.nombre.toLowerCase(), p.codigo);
  countryNames.set(p.codigo, p.codigo);
}

function extractWords(text: string): string[] {
  if (!text) return [];
  const tokens = text.toLowerCase().split(/[\s,.;:!?()"'+¿¡–—/\\[\]{}<>]+/);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    if (t.length < MIN_WORD_LENGTH || STOP_WORDS.has(t) || /^\d+$/.test(t)) continue;
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_WORDS)
    .map(([w]) => w);
}

function detectCountryCodes(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [name, code] of countryNames) {
    if (name.length < 3) continue;
    if (lower.includes(name)) found.add(code);
  }
  return [...found];
}

export interface WordAnomaly {
  word: string;
  frequency: number;
  baseline_7d: number;
  stddev_7d: number;
  z_score: number;
  ratio: number;
  country_codes: string[];
}

export async function computeWordTrends(): Promise<WordAnomaly[]> {
  if (!supabase) return [];

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  // Get last 7 days of existing trends for baseline
  const { data: existingTrends } = await supabase
    .from('osint_word_trends')
    .select('*')
    .gte('date', eightDaysAgo)
    .lte('date', today);

  const { data: signals } = await supabase
    .from('osint_signals')
    .select('title, summary, content, location_name, created_at')
    .gte('created_at', yesterday)
    .limit(500);

  if (!signals || signals.length === 0) {
    log.info('No signals in last 24h');
    return [];
  }

  // Build today's word frequency vector
  const wordFreq = new Map<string, number>();
  const wordCountries = new Map<string, Set<string>>();

  for (const s of signals) {
    const text = [s.title, s.summary, s.content].filter(Boolean).join(' ');
    const words = extractWords(text);
    const codes = detectCountryCodes(text);
    for (const w of words) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
      if (codes.length > 0) {
        if (!wordCountries.has(w)) wordCountries.set(w, new Set());
        for (const c of codes) wordCountries.get(w)!.add(c);
      }
    }
  }

  if (wordFreq.size === 0) return [];

  // Build baseline from existing trends
  const baselineByWord = new Map<string, { days: number[]; total: number }>();
  if (existingTrends) {
    for (const row of existingTrends) {
      if (row.date === today) continue;
      if (!baselineByWord.has(row.word)) baselineByWord.set(row.word, { days: [], total: 0 });
      const b = baselineByWord.get(row.word)!;
      b.days.push(row.frequency);
      b.total += row.frequency;
    }
  }

  const anomalies: WordAnomaly[] = [];

  for (const [word, freq] of wordFreq) {
    const wordKey = word.slice(0, 100);
    const baseline = baselineByWord.get(wordKey);
    const days = baseline?.days || [];
    const n = days.length;
    const mean = n > 0 ? baseline!.total / n : 0;
    const variance = n > 1 ? days.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1) : 0;
    const stddev = Math.sqrt(variance);
    const zScore = stddev > 0 ? (freq - mean) / stddev : freq > 1 ? freq : 0;
    const ratio = mean > 0 ? freq / mean : freq;

    const isAnomaly = zScore >= ANOMALY_Z_THRESHOLD || ratio >= ANOMALY_RATIO_THRESHOLD;

    // Persist
    await supabase.from('osint_word_trends').upsert({
      word: wordKey,
      country_code: '_global',
      date: today,
      frequency: freq,
      baseline_7d: Math.round(mean * 100) / 100,
      stddev_7d: Math.round(stddev * 100) / 100,
      z_score: Math.round(zScore * 100) / 100,
      anomaly: isAnomaly,
    }, { onConflict: 'word,country_code,date' });

    if (isAnomaly) {
      anomalies.push({
        word,
        frequency: freq,
        baseline_7d: Math.round(mean * 100) / 100,
        stddev_7d: Math.round(stddev * 100) / 100,
        z_score: Math.round(zScore * 100) / 100,
        ratio: Math.round(ratio * 100) / 100,
        country_codes: [...(wordCountries.get(word) || [])],
      });
    }
  }

  anomalies.sort((a, b) => b.z_score - a.z_score);

  if (anomalies.length > 0) {
    log.info(`Found ${anomalies.length} word anomalies`);
  }

  return anomalies;
}
