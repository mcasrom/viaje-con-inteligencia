import { groqClient } from './groq-ai';
import { createLogger } from '@/lib/logger';

const log = createLogger('OSINT');

export type SignalCategory = 'salud' | 'seguridad' | 'clima' | 'logistico' | 'geopolitico' | 'otro';

export interface RawPost {
  source: 'reddit' | 'gdacs' | 'usgs' | 'gdelt' | 'rss';
  sourceUrl: string;
  title: string;
  content: string;
  author: string;
  subreddit?: string;
  timestamp: Date;
  lat?: number;
  lng?: number;
  locationName?: string;
  severity?: 'green' | 'orange' | 'red';
  mag?: number;
  eventType?: string;
  toneScore?: number; // GDELT sentiment: -10 (neg) to +10 (pos)
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

const NEWS_RSS_FEEDS = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'BBC Breaking', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Reuters World', url: 'https://www.rssdss.com/feeds/worldNews' },
  { name: 'AP News', url: 'https://rsshub.app/apnews/topics/world-news' },
  { name: 'Sky News World', url: 'https://feeds.skynews.com/feeds/rss/world.xml' },
  { name: 'EFE Noticias', url: 'https://www.efe.com/feeds/rss/noticias/ultimas.xml' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'France24 EN', url: 'https://www.france24.com/en/rss' },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { name: 'WHO Outbreaks', url: 'https://www.who.int/feeds/entity/csr/don/en/rss.xml' },
  { name: 'ECDC Threats', url: 'https://ecdc.europa.eu/en/rss' },
  { name: 'CDC Travel', url: 'https://wwwnc.cdc.gov/travel/notices/rss' },
  { name: 'Aviation Herald', url: 'http://avherald.com/rss.xml' },
  { name: 'Cruise Law', url: 'https://www.cruiselawnews.com/feed/' },
];

const NEWS_KEYWORDS = [
  'cruise', 'ship', 'outbreak', 'evacuat', 'disaster', 'emergency',
  'travel', 'tourist', 'airport', 'flight', 'strike', 'protest',
  'earthquake', 'flood', 'fire', 'hurricane', 'cyclone', 'tsunami',
  'crisis', 'dead', 'killed', 'injured', 'hospital', 'disease',
  'crucero', 'barco', 'turista', 'evacuación', 'emergencia',
  'brotes', 'enfermedad', 'fallecido', 'herido', 'incendio',
  'inundación', 'terremoto', 'huelga', 'protesta', 'cierre',
  'aeropuerto', 'vuelo cancelado', 'frontera',
  'hantavirus', 'norovirus', 'dengue', 'mpox', 'quarantine',
  'containment', 'sanitary', 'biohazard', 'health notice',
  'travel advisory', 'disease outbreak', 'virus', 'infection',
  'contagio', 'brote', 'aislamiento', 'cuarentena', 'sanitario',
  'aviation accident', 'plane crash', 'runway', 'aircraft',
  'turbulence', 'emergency landing', 'bird strike', 'engine failure',
  'overbooked', 'tarmac delay', 'stranded passengers',
  'norovirus cruise', 'cruise ship sick', 'Princess Cruises',
  'Carnival', 'Royal Caribbean', 'MSC Cruises', 'Costa',
];

export async function fetchNewsRSS(limit = 50): Promise<RawPost[]> {
  const posts: RawPost[] = [];

  for (const feed of NEWS_RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'ViajeConInteligencia/1.0 (RSS Reader)' },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;

      const xmlText = await res.text();
      const entries = xmlText.split('<item>');

      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const descMatch = entry.match(/<description>([\s\S]*?)<\/description>/);
        const linkMatch = entry.match(/<link>([\s\S]*?)<\/link>/);
        const dateMatch = entry.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const sourceMatch = entry.match(/<source>([\s\S]*?)<\/source>/);

        if (!titleMatch) continue;

        const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '');
        const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '') : '';

        const text = `${title} ${desc}`.toLowerCase();
        const hasKeyword = NEWS_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));

        if (!hasKeyword) continue;

        posts.push({
          source: 'rss',
          sourceUrl: linkMatch ? linkMatch[1] : feed.url,
          title: `📰 ${title}`,
          content: `${desc} [Source: ${sourceMatch ? sourceMatch[1] : feed.name}]`,
          author: feed.name,
          timestamp: dateMatch ? new Date(dateMatch[1]) : new Date(),
          locationName: undefined,
        });

        if (posts.length >= limit) break;
      }
    } catch (e) {
      log.error(`News RSS error (${feed.name}):`, e);
    }
  }

  return posts;
}

export async function fetchAllPosts(): Promise<RawPost[]> {
  const results = await Promise.allSettled([
    fetchRedditPosts(),
    fetchGdacsAlerts(),
    fetchUsgsEarthquakes(),
    fetchGdeltEvents(),
    fetchNewsRSS(),
  ]);

  const posts: RawPost[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      posts.push(...result.value);
    } else {
      log.error('Source failed:', result.reason);
    }
  }
  return posts;
}

export async function fetchGdacsAlerts(limit = 20): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  try {
    const res = await fetch('https://www.gdacs.org/contentdata/xml/rss_24h.xml', {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0 (OSINT Sensor)' },
      cache: 'no-store',
    });

    if (!res.ok) return posts;

    const xmlText = await res.text();
    const items = xmlText.split('<item>');

    for (let i = 1; i < items.length; i++) {
      const item = items[i];
      const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = item.match(/<description>([\s\S]*?)<\/description>/);
      const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const alertMatch = item.match(/<gdacs:alertlevel>([\s\S]*?)<\/gdacs:alertlevel>/);
      const typeMatch = item.match(/<gdacs:eventtype>([\s\S]*?)<\/gdacs:eventtype>/);
      
      if (!titleMatch) continue;

      const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const desc = descMatch ? descMatch[1].replace(/&amp;/g, '&').replace(/<[^>]+>/g, '') : '';
      const alertLevel = alertMatch ? alertMatch[1].toLowerCase() as 'green' | 'orange' | 'red' : 'green';
      const eventType = typeMatch ? typeMatch[1] : undefined;

      posts.push({
        source: 'gdacs',
        sourceUrl: linkMatch ? linkMatch[1] : 'https://www.gdacs.org',
        title: `⚠️ GDACS: ${title}`,
        content: `${desc} (Alert Level: ${alertLevel.toUpperCase()})`,
        author: 'GDACS',
        timestamp: dateMatch ? new Date(dateMatch[1]) : new Date(),
        severity: alertLevel,
        eventType,
        locationName: undefined,
      });

      if (posts.length >= limit) break;
    }
  } catch (e) {
    log.error('GDACS Feed error:', e);
  }

  return posts;
}

export async function fetchUsgsEarthquakes(limit = 15): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',
      { cache: 'no-store' }
    );

    if (!res.ok) return posts;

    const data = await res.json();
    if (!data.features) return posts;

    for (const feature of data.features.slice(0, limit)) {
      const { properties, geometry } = feature;
      if (!properties) continue;

      const alert = properties.alert?.toLowerCase();
      const severity: 'green' | 'orange' | 'red' | undefined = 
        alert === 'red' ? 'red' : alert === 'orange' ? 'orange' : 'green';

      const urgency = severity === 'red' ? 'critical' : severity === 'orange' ? 'high' : 'medium';

      posts.push({
        source: 'usgs',
        sourceUrl: properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${properties.id}`,
        title: `🌍 Terremoto M${properties.mag} - ${properties.place}`,
        content: `Magnitude ${properties.mag} at depth ${geometry?.coordinates?.[2] ?? 'unknown'}km. Felt by ${properties.felt ?? 'N/A'} people. ${properties.tsunami ? 'TSUNAMI WARNING issued.' : ''}`,
        author: 'USGS',
        timestamp: new Date(properties.time),
        lat: geometry?.coordinates?.[1],
        lng: geometry?.coordinates?.[0],
        locationName: properties.place,
        severity,
        mag: properties.mag,
        eventType: 'earthquake',
      });
    }
  } catch (e) {
    log.error('USGS Feed error:', e);
  }

  return posts;
}

export async function fetchGdeltEvents(limit = 30): Promise<RawPost[]> {
  const posts: RawPost[] = [];
  
  const TRAVEL_KEYWORDS = [
    'protest', 'riot', 'strike', 'earthquake', 'flood', 'hurricane',
    'cyclone', 'tsunami', 'volcano', 'outbreak', 'epidemic', 'bomb',
    'terrorist', 'attack', 'shooting', 'assassination', 'kidnap',
    'evacuation', 'border closure', 'airport closure', 'travel ban',
    'hantavirus', 'norovirus', 'dengue', 'mpox', 'quarantine',
    'containment', 'sanitary', 'biohazard', 'cruise outbreak',
    'norovirus cruise', 'containment zone', 'health emergency',
  ];

  const query = TRAVEL_KEYWORDS.join(' OR ');
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&format=json&maxrecords=${limit}&sort=datedesc`;

  try {
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) return posts;

    const data = await res.json();
    if (!data.articles) return posts;

    for (const article of data.articles) {
      const title = article.title || '';
      const url = article.url || '';
      const date = article.seendate || '';
      const source = article.source?.[0]?.name || 'GDELT';
      const tone = article.tone || 0;

      if (!title || !url) continue;

      const lowerTitle = title.toLowerCase();
      const matchedCategory = TRAVEL_KEYWORDS.find(kw => lowerTitle.includes(kw));

      posts.push({
        source: 'gdelt',
        sourceUrl: url,
        title: `📡 GDELT: ${title}`,
        content: `Source: ${source}. Sentiment: ${tone > 0 ? '+' : ''}${tone}. Keyword: ${matchedCategory || 'general'}.`,
        author: source,
        timestamp: date ? new Date(date.slice(0, 14)) : new Date(),
        eventType: matchedCategory,
        locationName: undefined,
        toneScore: tone,
      });
    }
  } catch (e) {
    log.error('GDELT Feed error:', e);
  }

  return posts;
}

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
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const contentMatch = entry.match(/<content type="html">([\s\S]*?)<\/content>/);
        const authorMatch = entry.match(/<name>([\s\S]*?)<\/name>/);
        const updatedMatch = entry.match(/<updated>([\s\S]*?)<\/updated>/);
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
      log.error('RSS Feed error:', e);
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
    log.error('Classification error:', e);
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
