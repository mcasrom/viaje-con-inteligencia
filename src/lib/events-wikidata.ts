const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';

interface WikidataEvent {
  source_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  start_date: string | null;
  end_date: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
}

const CATEGORY_MAP: Record<string, { cat: string; sub: string }> = {
  Q868557: { cat: 'festival', sub: 'music' },
  Q189855: { cat: 'festival', sub: 'cultural' },
  Q7725634: { cat: 'festival', sub: 'literary' },
  Q1251004: { cat: 'festival', sub: 'film' },
  Q16510064: { cat: 'sports', sub: 'competition' },
  Q15944511: { cat: 'sports', sub: 'marathon' },
  Q270493: { cat: 'sports', sub: 'tournament' },
  Q119459: { cat: 'holiday', sub: 'public' },
  Q1456510: { cat: 'commemoration', sub: 'remembrance' },
  Q156203: { cat: 'conference', sub: 'trade_fair' },
  Q201492: { cat: 'conference', sub: 'exhibition' },
  Q175015: { cat: 'cultural', sub: 'carnival' },
  Q235261: { cat: 'cultural', sub: 'parade' },
};

function getCatAndSub(types: string[]): { cat: string; sub: string } {
  for (const t of types) {
    const m = CATEGORY_MAP[t];
    if (m) return m;
  }
  return { cat: 'other', sub: 'other' };
}

export async function fetchEventsByCountry(countryCode: string): Promise<WikidataEvent[]> {
  const countryQ = COUNTRY_Q_MAP[countryCode.toUpperCase()];
  if (!countryQ) return [];

  const query = `
SELECT DISTINCT ?item ?itemLabel ?description ?instance ?instanceLabel ?start ?end ?url ?lat ?lng ?city ?cityLabel WHERE {
  VALUES ?instance { wd:Q189855 wd:Q868557 wd:Q16510064 wd:Q119459 wd:Q1456510 wd:Q1251004 wd:Q7725634 wd:Q15944511 wd:Q270493 wd:Q156203 wd:Q201492 wd:Q175015 wd:Q235261 }
  ?item wdt:P31 ?instance ;
        wdt:P17 wd:${countryQ} .
  OPTIONAL { ?item wdt:P147 ?start . }
  OPTIONAL { ?item wdt:P582 ?end . }
  OPTIONAL { ?item wdt:P856 ?url . }
  OPTIONAL { ?item wdt:P625 ?coord . }
  OPTIONAL { ?item wdt:P131 ?city . }
  OPTIONAL { ?item wdt:P1441 ?description . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
  BIND(STR(?coord) AS ?latlng)
}
LIMIT 200
  `.trim();

  try {
    const res = await fetch(WIKIDATA_SPARQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json',
      },
      body: query,
    });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data.results?.bindings || [];

    return results.map((r: any) => {
      const types = r.instance?.value ? [r.instance.value.split('/').pop()] : [];
      const { cat, sub } = getCatAndSub(types);

      const coordStr = r.latlng?.value || '';
      let lat: number | null = null;
      let lng: number | null = null;
      if (coordStr.startsWith('Point(')) {
        const parts = coordStr.replace('Point(', '').replace(')', '').split(' ');
        lng = parseFloat(parts[0]);
        lat = parseFloat(parts[1]);
      }

      return {
        source_id: r.item?.value?.split('/').pop() || '',
        title: r.itemLabel?.value || '',
        description: r.description?.value || r.itemLabel?.value || '',
        category: cat,
        subcategory: sub,
        start_date: r.start?.value?.split('T')[0] || null,
        end_date: r.end?.value?.split('T')[0] || null,
        url: r.url?.value || null,
        lat,
        lng,
        city: r.cityLabel?.value || null,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchAllCountryEvents(countryCodes: string[]): Promise<WikidataEvent[]> {
  const all: WikidataEvent[] = [];
  for (const code of countryCodes) {
    const events = await fetchEventsByCountry(code);
    all.push(...events);
    await new Promise(r => setTimeout(r, 200));
  }
  return all;
}

const COUNTRY_Q_MAP: Record<string, string> = {
  AF: 'Q889', AL: 'Q222', DZ: 'Q262', AD: 'Q228', AO: 'Q916', AG: 'Q781',
  AR: 'Q414', AM: 'Q399', AU: 'Q408', AT: 'Q40', AZ: 'Q227',
  BS: 'Q778', BH: 'Q398', BD: 'Q902', BB: 'Q244', BY: 'Q184', BE: 'Q31',
  BZ: 'Q242', BJ: 'Q962', BT: 'Q917', BO: 'Q750', BA: 'Q225', BW: 'Q963',
  BR: 'Q155', BN: 'Q921', BG: 'Q219', BF: 'Q965', BI: 'Q967',
  KH: 'Q424', CM: 'Q1009', CA: 'Q16', CV: 'Q1011', CF: 'Q929', TD: 'Q657',
  CL: 'Q298', CN: 'Q148', CO: 'Q739', KM: 'Q971', CG: 'Q971', CD: 'Q974',
  CR: 'Q800', CI: 'Q1008', HR: 'Q224', CU: 'Q241', CY: 'Q229', CZ: 'Q213',
  DK: 'Q35', DJ: 'Q977', DM: 'Q784', DO: 'Q786',
  EC: 'Q736', EG: 'Q79', SV: 'Q792', GQ: 'Q983', ER: 'Q986', EE: 'Q191',
  SZ: 'Q1050', ET: 'Q115',
  FJ: 'Q712', FI: 'Q33', FR: 'Q142',
  GA: 'Q1000', GM: 'Q1005', GE: 'Q230', DE: 'Q183', GH: 'Q117', GR: 'Q41',
  GD: 'Q769', GT: 'Q774', GN: 'Q1006', GW: 'Q1007', GY: 'Q734',
  HT: 'Q790', HN: 'Q783', HU: 'Q28',
  IS: 'Q189', IN: 'Q668', ID: 'Q252', IR: 'Q794', IQ: 'Q796', IE: 'Q27',
  IL: 'Q801', IT: 'Q38',
  JM: 'Q766', JP: 'Q17', JO: 'Q810',
  KZ: 'Q232', KE: 'Q114', KI: 'Q710', KP: 'Q423', KR: 'Q884', KW: 'Q817',
  KG: 'Q813', LA: 'Q819', LV: 'Q211', LB: 'Q822', LS: 'Q1013', LR: 'Q1014',
  LY: 'Q1016', LI: 'Q347', LT: 'Q37', LU: 'Q32',
  MG: 'Q1019', MW: 'Q1020', MY: 'Q833', MV: 'Q826', ML: 'Q912', MT: 'Q233',
  MH: 'Q709', MR: 'Q1025', MU: 'Q1027', MX: 'Q96', FM: 'Q702', MD: 'Q217',
  MC: 'Q235', MN: 'Q711', ME: 'Q236', MA: 'Q1028', MZ: 'Q1029', MM: 'Q836',
  NA: 'Q1030', NR: 'Q697', NP: 'Q837', NL: 'Q55', NZ: 'Q664', NI: 'Q811',
  NE: 'Q1032', NG: 'Q1033', MK: 'Q221', NO: 'Q20',
  OM: 'Q842',
  PK: 'Q843', PW: 'Q695', PS: 'Q219578', PA: 'Q804', PG: 'Q691', PY: 'Q733',
  PE: 'Q419', PH: 'Q928', PL: 'Q36', PT: 'Q45',
  QA: 'Q846',
  RO: 'Q218', RU: 'Q159', RW: 'Q1037',
  KN: 'Q763', LC: 'Q760', VC: 'Q757', WS: 'Q683', SM: 'Q238', ST: 'Q1039',
  SA: 'Q851', SN: 'Q1041', RS: 'Q403', SC: 'Q1042', SL: 'Q1044', SG: 'Q334',
  SK: 'Q214', SI: 'Q215', SB: 'Q685', SO: 'Q1045', ZA: 'Q258', SS: 'Q958',
  ES: 'Q29', LK: 'Q854', SD: 'Q1049', SR: 'Q730', SE: 'Q34', CH: 'Q39',
  SY: 'Q858',
  TW: 'Q865', TJ: 'Q863', TZ: 'Q924', TH: 'Q869', TL: 'Q574', TG: 'Q945',
  TO: 'Q678', TT: 'Q754', TN: 'Q948', TR: 'Q43', TM: 'Q874', TV: 'Q672',
  UG: 'Q1036', UA: 'Q212', AE: 'Q878', GB: 'Q145', US: 'Q30', UY: 'Q77',
  UZ: 'Q265',
  VU: 'Q686', VA: 'Q237', VE: 'Q717', VN: 'Q881',
  YE: 'Q805',
  ZM: 'Q967', ZW: 'Q954',
};
