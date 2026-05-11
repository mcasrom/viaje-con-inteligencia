import { createLogger } from '@/lib/logger';
import { logScraperSuccess, logScraperWarning, logScraperError } from './audit';
import { supabaseAdmin } from '@/lib/supabase-admin';

const log = createLogger('USStateDept');

const API_PRIMARY = 'https://ivvcadataapi.state.gov/api/TravelAdvisories';
const API_FALLBACK = 'https://cadataapi.state.gov/api/TravelAdvisories';
const SCRAPER_NAME = 'us_state_dept';

const US_LEVEL_LABELS: Record<number, string> = {
  1: 'Exercise Normal Precautions',
  2: 'Exercise Increased Caution',
  3: 'Reconsider Travel',
  4: 'Do Not Travel',
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
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
  'cote d ivoire': 'ci', "cote d'ivoire": 'ci', 'croatia': 'hr', 'cuba': 'cu',
  'cyprus': 'cy', 'czechia': 'cz', 'democratic republic of the congo': 'cd',
  'denmark': 'dk', 'djibouti': 'dj', 'dominica': 'dm', 'dominican republic': 'do',
  'ecuador': 'ec', 'egypt': 'eg', 'el salvador': 'sv', 'equatorial guinea': 'gq',
  'eritrea': 'er', 'estonia': 'ee', 'eswatini': 'sz', 'ethiopia': 'et',
  'fiji': 'fj', 'finland': 'fi', 'france': 'fr', 'gabon': 'ga', 'gambia': 'gm',
  'georgia': 'ge', 'germany': 'de', 'ghana': 'gh', 'greece': 'gr',
  'grenada': 'gd', 'guatemala': 'gt', 'guinea': 'gn', 'guinea-bissau': 'gw',
  'guyana': 'gy', 'haiti': 'ht', 'honduras': 'hn', 'hungary': 'hu',
  'iceland': 'is', 'india': 'in', 'indonesia': 'id', 'iran': 'ir', 'iraq': 'iq',
  'ireland': 'ie', 'italy': 'it', 'jamaica': 'jm', 'japan': 'jp',
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
  'pakistan': 'pk', 'palau': 'pw', 'panama': 'pa', 'papua new guinea': 'pg',
  'paraguay': 'py', 'peru': 'pe', 'philippines': 'ph', 'poland': 'pl',
  'portugal': 'pt', 'qatar': 'qa', 'republic of the congo': 'cg',
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

export interface USAdvisory {
  countryCode: string;
  countryName: string;
  level: number;
  label: string;
  summary: string;
  updated: string;
}

function parseLevelFromTitle(title: string): { countryName: string; level: number } {
  const match = title.match(/^(.+?)\s*-\s*Level\s*(\d+):/);
  if (!match) return { countryName: title, level: 1 };
  return {
    countryName: match[1].trim(),
    level: parseInt(match[2], 10),
  };
}

function nameToCode(name: string): string | null {
  const key = name.toLowerCase().replace(/[^a-z\s'-]/g, '').trim();
  if (COUNTRY_NAME_TO_CODE[key]) return COUNTRY_NAME_TO_CODE[key];

  for (const [engName, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (key.includes(engName) || engName.includes(key)) {
      return code;
    }
  }
  return null;
}

async function fetchFromAPI(url: string): Promise<USAdvisory[]> {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'ViajeInteligencia/1.0' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status} for ${url}`);
  }

  const text = await res.text();
  if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
    throw new Error(`Cloudflare challenge at ${url}`);
  }

  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error('Unexpected API response format');
  }

  const advisories: USAdvisory[] = [];

  for (const item of data) {
    const title = item.Title || '';
    const summary = item.Summary || '';
    const updated = item.Updated || item.Published || '';

    const { countryName, level } = parseLevelFromTitle(title);
    if (level < 1 || level > 4) continue;

    const countryCode = nameToCode(countryName);
    if (!countryCode) {
      logScraperWarning(SCRAPER_NAME, `Unknown country: ${countryName}`);
      continue;
    }

    advisories.push({
      countryCode,
      countryName,
      level,
      label: US_LEVEL_LABELS[level] || `Level ${level}`,
      summary,
      updated,
    });
  }

  return advisories;
}

async function fetchAllAdvisories(): Promise<USAdvisory[]> {
  try {
    return await fetchFromAPI(API_PRIMARY);
  } catch (e: any) {
    logScraperWarning(SCRAPER_NAME, `Primary API failed: ${e.message}, trying fallback`);
    try {
      return await fetchFromAPI(API_FALLBACK);
    } catch (e2: any) {
      throw new Error(`All APIs failed: ${e2.message}`);
    }
  }
}

export async function scrapeUSAdvisories(): Promise<{
  stored: number;
  errors: number;
  total: number;
}> {
  const admin = supabaseAdmin;
  if (!admin) {
    logScraperError(SCRAPER_NAME, 'No Supabase admin available');
    return { stored: 0, errors: 0, total: 0 };
  }

  let advisories: USAdvisory[];
  try {
    advisories = await fetchAllAdvisories();
  } catch (e: any) {
    logScraperError(SCRAPER_NAME, `Fetch failed: ${e.message}`);
    return { stored: 0, errors: 0, total: 0 };
  }

  let stored = 0;
  let errors = 0;

  const rows = advisories.map(a => ({
    source: 'us_state_dept' as const,
    country_code: a.countryCode,
    risk_level: a.level,
    risk_label: a.label,
    summary: a.summary,
    raw_data: { country_name: a.countryName, updated: a.updated },
    fetched_at: new Date().toISOString(),
  }));

  for (const row of rows) {
    const { error } = await admin.from('external_risk').upsert(row, {
      onConflict: 'source,country_code',
    });
    if (error) errors++;
    else stored++;
  }

  log.info(`US advisories: ${stored} stored, ${errors} errors of ${advisories.length} total`);
  if (errors > 0) {
    logScraperWarning(SCRAPER_NAME, `${stored} stored, ${errors} errors`);
  } else {
    logScraperSuccess(SCRAPER_NAME, `${stored} advisories stored`);
  }

  return { stored, errors, total: advisories.length };
}
