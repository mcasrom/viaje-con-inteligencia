import { groqClient } from './groq-ai';

export type SignalCategory = 'salud' | 'seguridad' | 'clima' | 'logistico' | 'geopolitico' | 'otro';

export interface RawPost {
  source: 'reddit' | 'telegram' | 'rss';
  sourceUrl: string;
  title: string;
  content: string;
  author: string;
  subreddit?: string;
  timestamp: Date;
  lat?: number;
  lng?: number;
  locationName?: string;
}

export interface ClassifiedSignal {
  category: SignalCategory;
  confidence: number;
  isFirstResponder: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

const FIRST_PERSON_PATTERNS = [
  /\b(estoy|estamos|vi|vimos|siento|sentimos|me pasa|nos pasa|me siento|nos sentimos)\b/i,
  /\b(seeing|watching|experiencing|i am|i'm|we are|we're|feel|felt)\b/i,
  /\b(acabo de|acabamos de|me acaban|nos acaban)\b/i,
];

export function detectFirstPerson(text: string): boolean {
  return FIRST_PERSON_PATTERNS.some(p => p.test(text));
}

const SUBREDDITS = [
  'travel', 'solotravel', 'expats', 'digitalnomad',
  'backpacking', 'shoestring', 'shutupandtakemypicture',
];

const KEYWORDS = [
  'cancel', 'stuck', 'evacuat', 'protest', 'flood', 'fire', 'sick',
  'food poison', 'scam', 'danger', 'unsafe', 'riot', 'strike', 'blocked',
  'closed', 'shutdown', 'warning', 'emergency', 'hospital', 'disease',
  'earthquake', 'tsunami', 'hurricane', 'storm', 'wildfire', 'outbreak',
  'detained', 'arrested', 'robbed', 'attacked', 'shooting', 'bomb',
  'atentado', 'manifestacion', 'huelga', 'inundacion', 'incendio',
  'terremoto', 'enfermo', 'intoxicacion', 'estafa', 'peligro',
  'evacuacion', 'corte de calle', 'bloqueado', 'cancelado',
];

export async function fetchRedditPosts(limit = 50): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  const RSS_FEEDS = [
    'https://www.reddit.com/r/travel/new/.rss',
    'https://www.reddit.com/r/solotravel/new/.rss',
    'https://www.reddit.com/r/digitalnomad/new/.rss',
  ];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 
          'User-Agent': 'ViajeConInteligencia/1.0 (Linux; RSS Reader)',
          'Accept': 'application/xml, text/xml'
        },
        cache: 'no-store',
      });

      if (!res.ok) continue;

      const xmlText = await res.text();
      const entries = xmlText.split('<entry>');

      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        const titleMatch = entry.match(/<title>(.*?)<\/title>/s);
        const contentMatch = entry.match(/<content type="html">(.*?)<\/content>/s);
        const authorMatch = entry.match(/<name>(.*?)<\/name>/s);
        const updatedMatch = entry.match(/<updated>(.*?)<\/updated>/s);
        const linkMatch = entry.match(/<link href="(.*?)"/);
        const subredditMatch = entry.match(/reddit\.com\/r\/(.*?)\//);

        if (!titleMatch) continue;

        const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const content = contentMatch ? contentMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '') : '';
        
        const text = `${title} ${content}`.toLowerCase();
        const hasKeyword = KEYWORDS.some(kw => text.includes(kw.toLowerCase()));

        if (!hasKeyword) continue;

        posts.push({
          source: 'reddit',
          sourceUrl: linkMatch ? linkMatch[1] : feedUrl,
          title,
          content,
          author: authorMatch ? authorMatch[1] : 'unknown',
          subreddit: subredditMatch ? subredditMatch[1] : 'unknown',
          timestamp: updatedMatch ? new Date(updatedMatch[1]) : new Date(),
          locationName: undefined,
        });
      }
    } catch (e) {
      console.error(`[OSINT] RSS Feed error:`, e);
    }
  }

  return posts;
}

const CLASSIFICATION_PROMPT = `Clasifica el siguiente mensaje de redes sociales sobre un incidente de viaje.

Responde SOLO con JSON válido en este formato:
{
  "category": "salud|seguridad|clima|logistico|geopolitico|otro",
  "confidence": 0.0-1.0,
  "isFirstResponder": true/false (si el autor parece estar en el lugar del incidente),
  "urgency": "low|medium|high|critical",
  "summary": "resumen conciso en español del incidente"
}

Categorías:
- salud: Enfermedades, brotes, intoxicaciones, problemas médicos
- seguridad: Robos, ataques, violencia, estafas
- clima: Inundaciones, incendios, tormentas, terremotos
- logistico: Cancelaciones de vuelos/trenes, huelgas de transporte, colas
- geopolitico: Protestas, disturbios, conflictos, cierres de fronteras
- otro: No encaja en las anteriores

Mensaje:`;

export async function classifySignal(post: RawPost): Promise<ClassifiedSignal> {
  try {
    const text = `${post.title} ${post.content}`.substring(0, 2000);
    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `${CLASSIFICATION_PROMPT}`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 256,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    return {
      category: parsed.category || 'otro',
      confidence: parsed.confidence || 0.5,
      isFirstResponder: parsed.isFirstResponder || detectFirstPerson(text),
      urgency: parsed.urgency || 'low',
      summary: parsed.summary || post.title,
    };
  } catch (e) {
    console.error('[OSINT] Classification error:', e);
    return {
      category: 'otro',
      confidence: 0.3,
      isFirstResponder: detectFirstPerson(`${post.title} ${post.content}`),
      urgency: 'low',
      summary: post.title,
    };
  }
}

export interface SignalCluster {
  category: SignalCategory;
  location: string;
  signalCount: number;
  firstPersonCount: number;
  maxUrgency: string;
  signals: Array<{ sourceUrl: string; summary: string; timestamp: Date }>;
  isNew: boolean;
}

const CLUSTER_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const CLUSTER_MIN_SIGNALS = 2;

export function detectClusters(
  signals: Array<{ category: string; locationName?: string; timestamp: Date; isFirstResponder: boolean; urgency: string; sourceUrl: string; summary: string }>
): SignalCluster[] {
  const clusters: Record<string, SignalCluster> = {};

  for (const s of signals) {
    const key = `${s.category}-${(s.locationName || 'unknown').toLowerCase()}`;

    if (!clusters[key]) {
      clusters[key] = {
        category: s.category as SignalCategory,
        location: s.locationName || 'Desconocida',
        signalCount: 0,
        firstPersonCount: 0,
        maxUrgency: 'low',
        signals: [],
        isNew: false,
      };
    }

    const cluster = clusters[key];
    const age = Date.now() - s.timestamp.getTime();

    if (age > CLUSTER_WINDOW_MS) continue;

    cluster.signalCount++;
    if (s.isFirstResponder) cluster.firstPersonCount++;

    const urgencyOrder = ['low', 'medium', 'high', 'critical'];
    if (urgencyOrder.indexOf(s.urgency) > urgencyOrder.indexOf(cluster.maxUrgency)) {
      cluster.maxUrgency = s.urgency;
    }

    cluster.signals.push({
      sourceUrl: s.sourceUrl,
      summary: s.summary,
      timestamp: s.timestamp,
    });
  }

  return Object.values(clusters)
    .filter(c => c.signalCount >= CLUSTER_MIN_SIGNALS)
    .sort((a, b) => b.signalCount - a.signalCount);
}
