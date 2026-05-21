import rawData from '@/data/paises-data.json';

const paises = (rawData as any).paisesData as Record<string, any>;

const nameToCode = new Map<string, string>();
const codeToName = new Map<string, string>();

for (const [code, info] of Object.entries(paises)) {
  const name = info.nombre as string;
  const lower = name.toLowerCase();
  nameToCode.set(lower, code);
  codeToName.set(code, name);
}

const ENGLISH_NAMES: Record<string, string> = {
  'spain': 'españa', 'france': 'francia', 'germany': 'alemania',
  'italy': 'italia', 'portugal': 'portugal', 'united kingdom': 'reino unido',
  'uk': 'reino unido', 'netherlands': 'países bajos', 'switzerland': 'suiza',
  'greece': 'grecia', 'united states': 'estados unidos', 'usa': 'estados unidos',
  'canada': 'canadá', 'mexico': 'méxico', 'cuba': 'cuba',
  'colombia': 'colombia', 'peru': 'perú', 'brazil': 'brasil',
  'argentina': 'argentina', 'chile': 'chile', 'japan': 'japón',
  'south korea': 'corea del sur', 'china': 'china', 'russia': 'rusia',
  'india': 'india', 'turkey': 'turquía', 'thailand': 'tailandia',
  'vietnam': 'vietnam', 'indonesia': 'indonesia', 'philippines': 'filipinas',
  'egypt': 'egipto', 'morocco': 'marruecos', 'south africa': 'sudáfrica',
  'nigeria': 'nigeria', 'kenya': 'kenia', 'australia': 'australia',
  'new zealand': 'nueva zelanda', 'singapore': 'singapur', 'malaysia': 'malasia',
  'taiwan': 'taiwán', 'sweden': 'suecia', 'norway': 'noruega',
  'denmark': 'dinamarca', 'finland': 'finlandia', 'poland': 'polonia',
  'ukraine': 'ucrania', 'romania': 'rumanía', 'czech': 'república checa',
  'hungary': 'hungría', 'austria': 'austria', 'belgium': 'bélgica',
  'ireland': 'irlanda', 'croatia': 'croacia', 'bulgaria': 'bulgaria',
  'serbia': 'serbia', 'albania': 'albania', 'slovakia': 'eslovaquia',
  'slovenia': 'eslovenia', 'lithuania': 'lituania', 'latvia': 'letonia',
  'estonia': 'estonia', 'iceland': 'islandia', 'luxembourg': 'luxemburgo',
  'monaco': 'mónaco', 'andorra': 'andorra', 'malta': 'malta',
  'cyprus': 'chipre', 'israel': 'israel', 'jordan': 'jordania',
  'lebanon': 'líbano', 'qatar': 'catar', 'uae': 'emiratos árabes unidos',
  'united arab emirates': 'emiratos árabes unidos', 'saudi arabia': 'arabia saudí',
  'iran': 'irán', 'iraq': 'irak', 'afghanistan': 'afganistán',
  'pakistan': 'pakistán', 'bangladesh': 'bangladesh', 'myanmar': 'myanmar',
  'cambodia': 'camboya', 'laos': 'laos', 'nepal': 'nepal',
  'sri lanka': 'sri lanka', 'mongolia': 'mongolia',
  'dominican republic': 'república dominicana', 'honduras': 'honduras',
  'guatemala': 'guatemala', 'el salvador': 'el salvador', 'nicaragua': 'nicaragua',
  'costa rica': 'costa rica', 'panama': 'panamá', 'venezuela': 'venezuela',
  'ecuador': 'ecuador', 'bolivia': 'bolivia', 'paraguay': 'paraguay',
  'uruguay': 'uruguay', 'ethiopia': 'etiopía', 'ghana': 'ghana',
  'tanzania': 'tanzania', 'mozambique': 'mozambique', 'angola': 'angola',
  'congo': 'congo', 'senegal': 'senegal', 'algeria': 'argelia',
  'tunisia': 'túnez', 'libya': 'libia', 'syria': 'siria',
  'yemen': 'yemen', 'oman': 'omán', 'kuwait': 'kuwait',
  'bahrain': 'baréin',
};

for (const [en, es] of Object.entries(ENGLISH_NAMES)) {
  const code = nameToCode.get(es.toLowerCase());
  if (code && !nameToCode.has(en)) {
    nameToCode.set(en, code);
  }
}

export function getCountryCode(name: string): string | null {
  return nameToCode.get(name.toLowerCase().trim()) ?? null;
}

export function getCountryName(code: string): string | null {
  return codeToName.get(code.toLowerCase()) ?? null;
}

export function extractCountryCodes(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const [name, code] of nameToCode) {
    if (lower.includes(name)) found.add(code);
  }
  return Array.from(found);
}

export const ALL_KNOWN_COUNTRY_NAMES = Array.from(nameToCode.keys());

const codeToEnglish = new Map<string, string>();
for (const [en, es] of Object.entries(ENGLISH_NAMES)) {
  const code = nameToCode.get(es.toLowerCase());
  if (code && !codeToEnglish.has(code)) {
    codeToEnglish.set(code, en);
  }
}

export function getEnglishName(code: string): string | null {
  return codeToEnglish.get(code.toLowerCase()) ?? null;
}

export function getCountrySearchTerms(code: string): string[] {
  const terms: string[] = [];
  const es = getCountryName(code);
  if (es) terms.push(es);
  const en = getEnglishName(code);
  if (en && en !== es?.toLowerCase()) terms.push(en);
  if (terms.length === 0) terms.push(code);
  return terms;
}
