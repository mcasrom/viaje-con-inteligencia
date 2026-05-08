export interface GDELTEvent {
  source: 'gdelt';
  source_id: string;
  country: string;
  title: string;
  description: string;
  category: 'protest' | 'conflict' | 'instability';
  subcategory: string;
  start_date: string;
  url: string | null;
  tone: number;
  goldstein: number;
}

const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

export async function fetchGDELTEvents(countryCode: string, days = 3): Promise<GDELTEvent[]> {
  const countryName = COUNTRY_NAMES[countryCode.toUpperCase()];
  if (!countryName) return [];

  const queries = [
    `sourcecountry:${countryName} protest`,
    `sourcecountry:${countryName} riot`,
    `sourcecountry:${countryName} strike`,
    `sourcecountry:${countryName} demonstration`,
    `sourcecountry:${countryName} violence`,
    `sourcecountry:${countryName} unrest`,
  ];

  const results: GDELTEvent[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    try {
      const url = `${GDELT_API}?query=${encodeURIComponent(query)}&mode=artlist&max=10&format=json&timespan=${days * 24}h`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const articles = data?.articles || [];
      for (const art of articles) {
        const dedupKey = art.url || art.title;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);

        const text = (art.title + ' ' + (art.summary || '')).toLowerCase();
        let subcat = 'protest';
        if (text.includes('riot') || text.includes('violent')) subcat = 'violence';
        else if (text.includes('strike')) subcat = 'strike';
        else if (text.includes('demonstration') || text.includes('march')) subcat = 'demonstration';

        results.push({
          source: 'gdelt',
          source_id: art.url || `gdelt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          country: countryCode.toUpperCase(),
          title: art.title || '',
          description: art.summary || art.title || '',
          category: subcat === 'violence' ? 'conflict' : 'protest',
          subcategory: subcat,
          start_date: art.seendate
            ? `${art.seendate.slice(0, 4)}-${art.seendate.slice(4, 6)}-${art.seendate.slice(6, 8)}`
            : new Date().toISOString().split('T')[0],
          url: art.url || null,
          tone: art.tone || 0,
          goldstein: art.goldsteinscore || 0,
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}

export async function fetchGDELTStability(countryCode: string): Promise<{
  instability_score: number;
  tone_avg: number;
  protest_count: number;
  trend: 'rising' | 'stable' | 'falling';
} | null> {
  const countryName = COUNTRY_NAMES[countryCode.toUpperCase()];
  if (!countryName) return null;

  try {
    const url = `https://api.gdeltproject.org/api/v1/dash_stabilitytimeline/dash_stabilitytimeline?VAR=instability&COD=${encodeURIComponent(countryName)}&TIMERES=day&FORMAT=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const timeline = data?.timeline || [];
    if (timeline.length < 2) return null;

    const recent = timeline.slice(-7);
    const avgTone = recent.reduce((s: number, d: any) => s + (d.tone || 0), 0) / recent.length;
    const instScore = recent.reduce((s: number, d: any) => s + (d.value || 0), 0) / recent.length;

    const half = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, half).reduce((s: number, d: any) => s + (d.value || 0), 0) / half;
    const secondHalf = recent.slice(half).reduce((s: number, d: any) => s + (d.value || 0), 0) / (recent.length - half);

    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (secondHalf > firstHalf * 1.2) trend = 'rising';
    else if (secondHalf < firstHalf * 0.8) trend = 'falling';

    return {
      instability_score: Math.round(instScore * 1000) / 1000,
      tone_avg: Math.round(avgTone * 10) / 10,
      protest_count: recent.reduce((s: number, d: any) => s + (d.count || 0), 0),
      trend,
    };
  } catch {
    return null;
  }
}

const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AD: 'Andorra', AO: 'Angola',
  AR: 'Argentina', AM: 'Armenia', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan',
  BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus',
  BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BT: 'Bhutan', BO: 'Bolivia',
  BA: 'Bosnia', BW: 'Botswana', BR: 'Brazil', BN: 'Brunei', BG: 'Bulgaria',
  BF: 'Burkina Faso', BI: 'Burundi',
  KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', CF: 'Central African Republic',
  TD: 'Chad', CL: 'Chile', CN: 'China', CO: 'Colombia', KM: 'Comoros', CG: 'Congo',
  CD: 'Congo DR', CR: 'Costa Rica', CI: 'Ivory Coast', HR: 'Croatia', CU: 'Cuba',
  CY: 'Cyprus', CZ: 'Czech Republic',
  DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic',
  EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea',
  EE: 'Estonia', SZ: 'Eswatini', ET: 'Ethiopia',
  FJ: 'Fiji', FI: 'Finland', FR: 'France',
  GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GR: 'Greece',
  GD: 'Grenada', GT: 'Guatemala', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana',
  HT: 'Haiti', HN: 'Honduras', HU: 'Hungary',
  IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran', IQ: 'Iraq', IE: 'Ireland',
  IL: 'Israel', IT: 'Italy',
  JM: 'Jamaica', JP: 'Japan', JO: 'Jordan',
  KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'North Korea', KR: 'South Korea',
  KW: 'Kuwait', KG: 'Kyrgyzstan',
  LA: 'Laos', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libya',
  LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg',
  MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta',
  MH: 'Marshall Islands', MR: 'Mauritania', MU: 'Mauritius', MX: 'Mexico', FM: 'Micronesia',
  MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MA: 'Morocco',
  MZ: 'Mozambique', MM: 'Myanmar',
  NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', NZ: 'New Zealand',
  NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', MK: 'North Macedonia', NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan', PW: 'Palau', PS: 'Palestine', PA: 'Panama', PG: 'Papua New Guinea',
  PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PL: 'Poland', PT: 'Portugal',
  QA: 'Qatar',
  RO: 'Romania', RU: 'Russia', RW: 'Rwanda',
  KN: 'Saint Kitts', LC: 'Saint Lucia', VC: 'Saint Vincent', WS: 'Samoa', SM: 'San Marino',
  ST: 'Sao Tome', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles',
  SL: 'Sierra Leone', SG: 'Singapore', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands',
  SO: 'Somalia', ZA: 'South Africa', SS: 'South Sudan', ES: 'Spain', LK: 'Sri Lanka',
  SD: 'Sudan', SR: 'Suriname', SE: 'Sweden', CH: 'Switzerland', SY: 'Syria',
  TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania', TH: 'Thailand', TL: 'Timor-Leste',
  TG: 'Togo', TO: 'Tonga', TT: 'Trinidad', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan',
  TV: 'Tuvalu',
  UG: 'Uganda', UA: 'Ukraine', AE: 'UAE', GB: 'United Kingdom', US: 'United States',
  UY: 'Uruguay', UZ: 'Uzbekistan',
  VU: 'Vanuatu', VA: 'Vatican', VE: 'Venezuela', VN: 'Vietnam',
  YE: 'Yemen',
  ZM: 'Zambia', ZW: 'Zimbabwe',
};
