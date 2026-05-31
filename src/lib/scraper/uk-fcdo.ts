import { createLogger } from '@/lib/logger';
import { logScraperSuccess, logScraperWarning, logScraperError } from './audit';
import { supabaseAdmin } from '@/lib/supabase-admin';

const log = createLogger('UKFCDO');

const FCDO_API = 'https://www.gov.uk/api/content/foreign-travel-advice';
const SCRAPER_NAME = 'uk_fcdo';

// UK FCDO uses a summary-based system: "Safety concerns", "Terrorism", etc.
// We map their advisory categories to our risk levels
const FCDO_RISK_KEYWORDS: Record<string, string[]> = {
  'muy-alto': ['do not travel', 'avoid all travel', 'evacuate', 'war', 'conflict zone'],
  'alto': ['avoid non-essential travel', 'high risk', 'terrorism', 'kidnap', 'civil unrest'],
  'medio': ['political instability', 'demonstrations', 'crime', 'petty crime'],
  'bajo': ['normal precautions', 'low threat', 'stable'],
  'sin-riesgo': [],
};

// Country name to ISO code mapping (UK uses slightly different names)
const UK_COUNTRY_TO_CODE: Record<string, string> = {
  'afghanistan': 'af', 'albania': 'al', 'algeria': 'dz', 'andorra': 'ad',
  'angola': 'ao', 'antigua and barbuda': 'ag', 'argentina': 'ar', 'armenia': 'am',
  'australia': 'au', 'austria': 'at', 'azerbaijan': 'az', 'bahrain': 'bh',
  'bangladesh': 'bd', 'barbados': 'bb', 'belarus': 'by', 'belgium': 'be',
  'belize': 'bz', 'benin': 'bj', 'bhutan': 'bt', 'bolivia': 'bo',
  'bosnia and herzegovina': 'ba', 'botswana': 'bw', 'brazil': 'br',
  'brunei': 'bn', 'bulgaria': 'bg', 'burkina faso': 'bf', 'burma': 'mm',
  'burundi': 'bi', 'cabo verde': 'cv', 'cambodia': 'kh', 'cameroon': 'cm',
  'canada': 'ca', 'central african republic': 'cf', 'chad': 'td', 'chile': 'cl',
  'china': 'cn', 'colombia': 'co', 'comoros': 'km', 'costa rica': 'cr',
  "cote d'ivoire": 'ci', 'croatia': 'hr', 'cuba': 'cu', 'cyprus': 'cy',
  'czechia': 'cz', 'czech republic': 'cz', 'democratic republic of the congo': 'cd',
  'denmark': 'dk', 'djibouti': 'dj', 'dominica': 'dm', 'dominican republic': 'do',
  'ecuador': 'ec', 'egypt': 'eg', 'el salvador': 'sv', 'equatorial guinea': 'gq',
  'eritrea': 'er', 'estonia': 'ee', 'eswatini': 'sz', 'ethiopia': 'et',
  'fiji': 'fj', 'finland': 'fi', 'france': 'fr', 'gabon': 'ga', 'gambia': 'gm',
  'georgia': 'ge', 'germany': 'de', 'ghana': 'gh', 'greece': 'gr',
  'grenada': 'gd', 'guatemala': 'gt', 'guinea': 'gn', 'guinea-bissau': 'gw',
  'guyana': 'gy', 'haiti': 'ht', 'honduras': 'hn', 'hungary': 'hu',
  'iceland': 'is', 'india': 'in', 'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq',
  'ireland': 'ie', 'israel': 'il', 'italy': 'it', 'jamaica': 'jm', 'japan': 'jp',
  'jordan': 'jo', 'kazakhstan': 'kz', 'kenya': 'ke', 'kiribati': 'ki',
  'kosovo': 'xk', 'kuwait': 'kw', 'kyrgyzstan': 'kg', 'laos': 'la',
  'latvia': 'lv', 'lebanon': 'lb', 'lesotho': 'ls', 'liberia': 'lr',
  'libya': 'ly', 'liechtenstein': 'li', 'lithuania': 'lt', 'luxembourg': 'lu',
  'madagascar': 'mg', 'malawi': 'mw', 'malaysia': 'my', 'maldives': 'mv',
  'mali': 'ml', 'malta': 'mt', 'marshall islands': 'mh', 'mauritania': 'mr',
  'mauritius': 'mu', 'mexico': 'mx', 'micronesia': 'fm', 'moldova': 'md',
  'monaco': 'mc', 'mongolia': 'mn', 'montenegro': 'me', 'morocco': 'ma',
  'mozambique': 'mz', 'namibia': 'na', 'nepal': 'np', 'netherlands': 'nl',
  'new zealand': 'nz', 'nicaragua': 'ni', 'niger': 'ne', 'nigeria': 'ng',
  'north korea': 'kp', 'north macedonia': 'mk', 'norway': 'no', 'oman': 'om',
  'pakistan': 'pk', 'palau': 'pw', 'palestinian territories': 'ps', 'panama': 'pa',
  'papua new guinea': 'pg', 'paraguay': 'py', 'peru': 'pe', 'philippines': 'ph',
  'poland': 'pl', 'portugal': 'pt', 'qatar': 'qa', 'republic of the congo': 'cg',
  'romania': 'ro', 'russia': 'ru', 'rwanda': 'rw', 'saint kitts and nevis': 'kn',
  'saint lucia': 'lc', 'saint vincent and the grenadines': 'vc', 'samoa': 'ws',
  'san marino': 'sm', 'sao tome and principe': 'st', 'saudi arabia': 'sa',
  'senegal': 'sn', 'serbia': 'rs', 'seychelles': 'sc', 'sierra leone': 'sl',
  'singapore': 'sg', 'slovakia': 'sk', 'slovenia': 'si',
  'solomon islands': 'sb', 'somalia': 'so', 'south africa': 'za',
  'south korea': 'kr', 'south sudan': 'ss', 'spain': 'es', 'sri lanka': 'lk',
  'sudan': 'sd', 'suriname': 'sr', 'sweden': 'se', 'switzerland': 'ch',
  'syria': 'sy', 'taiwan': 'tw', 'tajikistan': 'tj', 'tanzania': 'tz',
  'thailand': 'th', 'timor-leste': 'tl', 'togo': 'tg', 'tonga': 'to',
  'trinidad and tobago': 'tt', 'tunisia': 'tn', 'turkey': 'tr',
  'turkmenistan': 'tm', 'tuvalu': 'tv', 'uganda': 'ug', 'ukraine': 'ua',
  'united arab emirates': 'ae', 'united kingdom': 'gb', 'united states': 'us',
  'uruguay': 'uy', 'uzbekistan': 'uz', 'vanuatu': 'vu', 'vatican city': 'va',
  'venezuela': 've', 'vietnam': 'vn', 'yemen': 'ye', 'zambia': 'zm',
  'zimbabwe': 'zw',
};

// FCDO uses URL slugs that differ from country names
const FCDO_SLUG_TO_CODE: Record<string, string> = {
  'afghanistan': 'af', 'albania': 'al', 'algeria': 'dz', 'andorra': 'ad',
  'angola': 'ao', 'argentina': 'ar', 'armenia': 'am', 'australia': 'au',
  'austria': 'at', 'azerbaijan': 'az', 'bahamas': 'bs', 'bahrain': 'bh',
  'bangladesh': 'bd', 'barbados': 'bb', 'belarus': 'by', 'belgium': 'be',
  'belize': 'bz', 'benin': 'bj', 'bhutan': 'bt', 'bolivia': 'bo',
  'bosnia-and-herzegovina': 'ba', 'botswana': 'bw', 'brazil': 'br',
  'brunei': 'bn', 'bulgaria': 'bg', 'burkina-faso': 'bf', 'burma': 'mm',
  'burundi': 'bi', 'cambodia': 'kh', 'cameroon': 'cm', 'canada': 'ca',
  'cape-verde': 'cv', 'central-african-republic': 'cf', 'chad': 'td', 'chile': 'cl',
  'china': 'cn', 'colombia': 'co', 'comoros': 'km', 'congo': 'cg',
  'costa-rica': 'cr', "cote-d-ivoire": 'ci', 'croatia': 'hr', 'cuba': 'cu',
  'cyprus': 'cy', 'czech-republic': 'cz', 'democratic-republic-of-the-congo': 'cd',
  'denmark': 'dk', 'djibouti': 'dj', 'dominica': 'dm', 'dominican-republic': 'do',
  'ecuador': 'ec', 'egypt': 'eg', 'el-salvador': 'sv', 'equatorial-guinea': 'gq',
  'eritrea': 'er', 'estonia': 'ee', 'eswatini': 'sz', 'ethiopia': 'et',
  'fiji': 'fj', 'finland': 'fi', 'france': 'fr', 'gabon': 'ga', 'gambia': 'gm',
  'georgia': 'ge', 'germany': 'de', 'ghana': 'gh', 'greece': 'gr',
  'grenada': 'gd', 'guatemala': 'gt', 'guinea': 'gn', 'guinea-bissau': 'gw',
  'guyana': 'gy', 'haiti': 'ht', 'honduras': 'hn', 'hungary': 'hu',
  'iceland': 'is', 'india': 'in', 'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq',
  'ireland': 'ie', 'israel-and-the-palestinian-territories': 'il', 'italy': 'it',
  'jamaica': 'jm', 'japan': 'jp', 'jordan': 'jo', 'kazakhstan': 'kz',
  'kenya': 'ke', 'kiribati': 'ki', 'kosovo': 'xk', 'kuwait': 'kw',
  'kyrgyzstan': 'kg', 'laos': 'la', 'latvia': 'lv', 'lebanon': 'lb',
  'lesotho': 'ls', 'liberia': 'lr', 'libya': 'ly', 'liechtenstein': 'li',
  'lithuania': 'lt', 'luxembourg': 'lu', 'madagascar': 'mg', 'malawi': 'mw',
  'malaysia': 'my', 'maldives': 'mv', 'mali': 'ml', 'malta': 'mt',
  'marshall-islands': 'mh', 'mauritania': 'mr', 'mauritius': 'mu', 'mexico': 'mx',
  'micronesia': 'fm', 'moldova': 'md', 'monaco': 'mc', 'mongolia': 'mn',
  'montenegro': 'me', 'morocco': 'ma', 'mozambique': 'mz', 'myanmar': 'mm',
  'namibia': 'na', 'nauru': 'nr', 'nepal': 'np', 'netherlands': 'nl',
  'new-zealand': 'nz', 'nicaragua': 'ni', 'niger': 'ne', 'nigeria': 'ng',
  'north-korea': 'kp', 'north-macedonia': 'mk', 'norway': 'no', 'oman': 'om',
  'pakistan': 'pk', 'palau': 'pw', 'panama': 'pa', 'papua-new-guinea': 'pg',
  'paraguay': 'py', 'peru': 'pe', 'philippines': 'ph', 'poland': 'pl',
  'portugal': 'pt', 'qatar': 'qa', 'romania': 'ro', 'russia': 'ru',
  'rwanda': 'rw', 'saint-lucia': 'lc', 'samoa': 'ws', 'san-marino': 'sm',
  'sao-tome-and-principe': 'st', 'saudi-arabia': 'sa', 'senegal': 'sn',
  'serbia': 'rs', 'seychelles': 'sc', 'sierra-leone': 'sl', 'singapore': 'sg',
  'slovakia': 'sk', 'slovenia': 'si', 'solomon-islands': 'sb', 'somalia': 'so',
  'south-africa': 'za', 'south-korea': 'kr', 'south-sudan': 'ss', 'spain': 'es',
  'sri-lanka': 'lk', 'sudan': 'sd', 'suriname': 'sr', 'sweden': 'se',
  'switzerland': 'ch', 'syria': 'sy', 'taiwan': 'tw', 'tajikistan': 'tj',
  'tanzania': 'tz', 'thailand': 'th', 'the-gambia': 'gm', 'timor-leste': 'tl',
  'togo': 'tg', 'tonga': 'to', 'trinidad-and-tobago': 'tt', 'tunisia': 'tn',
  'turkey': 'tr', 'turkmenistan': 'tm', 'tuvalu': 'tv', 'uganda': 'ug',
  'ukraine': 'ua', 'united-arab-emirates': 'ae', 'united-states-of-america': 'us',
  'uruguay': 'uy', 'uzbekistan': 'uz', 'vanuatu': 'vu', 'venezuela': 've',
  'vietnam': 'vn', 'yemen': 'ye', 'zambia': 'zm', 'zimbabwe': 'zw',
};

export interface FCDOAdvisory {
  countryCode: string;
  countryName: string;
  riskLevel: number; // 1-4 matching external_risk schema
  riskLabel: string;
  summary: string;
  updated: string;
  url: string;
}

function determineRiskLevel(summary: string): { level: number; label: string } {
  const text = summary.toLowerCase();
  if (text.includes('do not travel') || text.includes('avoid all travel') || text.includes('evacuate') || text.includes('war') || text.includes('conflict zone')) {
    return { level: 4, label: 'Do not travel' };
  }
  if (text.includes('avoid non-essential travel') || text.includes('high risk') || text.includes('terrorism') || text.includes('kidnap') || text.includes('civil unrest')) {
    return { level: 3, label: 'Avoid non-essential travel' };
  }
  if (text.includes('political instability') || text.includes('demonstrations') || text.includes('crime') || text.includes('petty crime')) {
    return { level: 2, label: 'Exercise increased caution' };
  }
  return { level: 1, label: 'Exercise normal precautions' };
}

function slugToCode(slug: string): string | null {
  return FCDO_SLUG_TO_CODE[slug] || null;
}

export async function scrapeFCDOAdvisories(): Promise<{
  stored: number;
  errors: number;
  total: number;
}> {
  try {
    log.info('Fetching FCDO country list...');

    // FCDO has a listing endpoint that returns all countries
    const listRes = await fetch('https://www.gov.uk/api/content/foreign-travel-advice.json', {
      headers: { 'User-Agent': 'ViajeConInteligencia/1.0' },
    });

    if (!listRes.ok) {
      throw new Error(`FCDO list API returned ${listRes.status}`);
    }

    const listData = await listRes.json();
    const links = listData.links?.child || [];

    log.info(`Found ${links.length} FCDO travel advisories`);

    const advisories: FCDOAdvisory[] = [];
    let errors = 0;

    // Fetch details for each country (batch in parallel)
    const batchSize = 10;
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (link: any) => {
          try {
            const slug = link.base_path.replace('/foreign-travel-advice/', '');
            const countryCode = slugToCode(slug);
            if (!countryCode) return null;

            const res = await fetch(
              `https://www.gov.uk/api/content/foreign-travel-advice/${slug}`,
              { headers: { 'User-Agent': 'ViajeConInteligencia/1.0' } },
            );
            if (!res.ok) return null;

            const data = await res.json();
            const summary = data.details?.summary || data.title || '';
            const updated = data.public_updated_at || new Date().toISOString();

            const risk = determineRiskLevel(summary);

            return {
              countryCode,
              countryName: data.title || slug,
              riskLevel: risk.level,
              riskLabel: risk.label,
              summary: summary.substring(0, 500),
              updated,
              url: `https://www.gov.uk/foreign-travel-advice/${slug}`,
            } as FCDOAdvisory;
          } catch {
            return null;
          }
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          advisories.push(result.value);
        } else {
          errors++;
        }
      }

      // Rate limit: 100ms between batches
      if (i + batchSize < links.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    log.info(`Parsed ${advisories.length} FCDO advisories, ${errors} errors`);

    // Store in external_risk table (same schema as US State Dept)
    const rows = advisories.map(a => ({
      source: 'uk_fcdo' as const,
      country_code: a.countryCode,
      risk_level: a.riskLevel,
      risk_label: a.riskLabel,
      summary: a.summary,
      raw_data: { country_name: a.countryName, updated: a.updated, url: a.url },
      fetched_at: new Date().toISOString(),
    }));

    let stored = 0;
    for (const row of rows) {
      const { error } = await supabaseAdmin.from('external_risk').upsert(row, {
        onConflict: 'source,country_code',
      });

      if (error) {
        log.error(`Error storing FCDO data for ${row.country_code}`, error);
        errors++;
      } else {
        stored++;
      }
    }

    await logScraperSuccess(SCRAPER_NAME, `${stored} stored, ${errors} errors of ${advisories.length} total`);

    return { stored, errors, total: advisories.length };
  } catch (e: any) {
    log.error('FCDO scrape failed', e);
    await logScraperError(SCRAPER_NAME, e.message);
    return { stored: 0, errors: 1, total: 0 };
  }
}
