import { NextResponse } from 'next/server';

const WHO_API_BASE = 'https://ghoapi.azureedge.net/api';

interface CountryHealthData {
  code: string;
  code2: string;
  country: string;
  tuberculosis: number | null;
  malaria: number | null;
  hiv: number | null;
  vaccinationDTP3: number | null;
  healthExpenditure: number | null;
  doctors: number | null;
  beds: number | null;
  riskLevel: 'low' | 'medium' | 'high';
  lat?: number;
  lng?: number;
}

const WHO_TO_ISO2: Record<string, string> = {
  AFG: 'AF', ALB: 'AL', DZA: 'DZ', DEU: 'DE', AND: 'AD', AGO: 'AO', ATG: 'AG',
  SAU: 'SA', ARG: 'AR', ARM: 'AM', AUS: 'AU', AUT: 'AT', AZE: 'AZ', BHS: 'BS',
  BHR: 'BH', BGD: 'BD', BRB: 'BB', BEL: 'BE', BEN: 'BJ', BTN: 'BT', BLR: 'BY',
  BWA: 'BW', BRA: 'BR', BRN: 'BN', BGR: 'BG', BFA: 'BF', BDI: 'BI', KHM: 'KH',
  CMR: 'CM', CAN: 'CA', CPV: 'CV', TCD: 'TD', CHL: 'CL', CHN: 'CN', COL: 'CO',
  COM: 'KM', COG: 'CG', COD: 'CD', CRI: 'CR', CIV: 'CI', HRV: 'HR', CUB: 'CU',
  CYP: 'CY', CZE: 'CZ', DNK: 'DK', DMA: 'DM', ECU: 'EC', EGY: 'EG', SLV: 'SV',
  ERI: 'ER', EST: 'EE', ETH: 'ET', FJI: 'FJ', FIN: 'FI', FRA: 'FRA', GAB: 'GA',
  GMB: 'GM', GEO: 'GE', GHA: 'GH', GRC: 'GR', GRD: 'GD', GTM: 'GT', GIN: 'GN',
  GNB: 'GW', GUY: 'GY', HTI: 'HT', HND: 'HN', HUN: 'HU', ISL: 'IS', IND: 'IN',
  IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE', ISR: 'IL', ITA: 'IT', JAM: 'JM',
  JPN: 'JP', JOR: 'JO', KAZ: 'KZ', KEN: 'KE', KIR: 'KI', KWT: 'KW', LAO: 'LA',
  LVA: 'LV', LBN: 'LB', LSO: 'LS', LBR: 'LR', LBY: 'LY', LTU: 'LT', LUX: 'LU',
  MDG: 'MG', MYS: 'MY', MWI: 'MW', MDV: 'MV', MLI: 'ML', MLT: 'MT', MRT: 'MR',
  MUS: 'MU', MEX: 'MX', FSM: 'FM', MDA: 'MD', MCO: 'MC', MNG: 'MN', MNE: 'ME',
  MAR: 'MA', MOZ: 'MZ', MMR: 'MM', NAM: 'NA', NRU: 'NR', NPL: 'NP', NLD: 'NL',
  NZL: 'NZ', NIC: 'NI', NER: 'NE', NGA: 'NG', NOR: 'NO', OMN: 'OM', PAK: 'PK',
  PAN: 'PA', PNG: 'PG', PRY: 'PY', PER: 'PE', PHL: 'PH', POL: 'PL', PRT: 'PT',
  QAT: 'QA', ROU: 'RO', RUS: 'RU', RWA: 'RW', SEN: 'SN', SRB: 'RS',
  SYC: 'SC', SLE: 'SL', SGP: 'SG', SVK: 'SK', SVN: 'SI', SOM: 'SO', ZAF: 'ZA',
  SSD: 'SS', ESP: 'ES', LKA: 'LK', SDN: 'SD', SUR: 'SR', SWE: 'SE', CHE: 'CH',
  SYR: 'SY', TJK: 'TJ', TZA: 'TZ', THA: 'TH', TGO: 'TG', TON: 'TO', TTO: 'TT',
  TUN: 'TN', TUR: 'TR', TKM: 'TM', UGA: 'UG', UKR: 'UA', GBR: 'GB', URY: 'UY',
  UZB: 'UZ', VUT: 'VU', VEN: 'VE', VNM: 'VN', YEM: 'YE', ZMB: 'ZM', ZWE: 'ZW',
};

const PAIS_COORDS: Record<string, [number, number]> = {
  AF: [33.9391, 67.7100], AL: [41.1533, 20.1683], DZ: [28.0339, 1.6596], DE: [51.1657, 10.4515],
  AD: [42.5063, 1.5218], AO: [-11.2027, 17.8739], AG: [17.0608, -61.7964], SA: [23.8859, 45.0792],
  AR: [-38.4161, -63.6167], AM: [40.0691, 45.0382], AU: [-25.2744, 133.7751], AT: [47.5162, 14.5501],
  AZ: [40.1431, 47.5769], BS: [25.0343, -77.3963], BH: [26.0667, 50.5577], BD: [23.6850, 90.3563],
  BB: [13.1939, -59.5432], BE: [50.5039, 4.4699], BJ: [9.3077, 2.3158], BT: [27.5140, 90.4336],
  BY: [53.7000, 27.0000], BW: [-22.3285, 24.6849], BR: [-14.2350, -51.9253], BN: [4.5354, 114.7277],
  BG: [42.7339, 25.4858], BF: [12.2383, -1.5616], BI: [-3.3731, 29.9189], KH: [12.5657, 104.9910],
  CM: [3.3792, 8.7876], CA: [56.1304, -106.3468], CV: [16.5388, -23.0418], TD: [15.4542, 18.7322],
  CL: [-35.6751, -71.5430], CN: [35.8617, 104.1954], CO: [4.5709, -74.2973], KM: [-11.8750, 43.8723],
  CG: [-0.2280, 15.8277], CD: [-4.0383, 21.7587], CR: [9.7489, -83.7534], CI: [7.5400, -5.5471],
  HR: [45.1000, 15.2000], CU: [21.5218, -77.7812], CY: [35.1264, 33.4299], CZ: [49.8175, 15.4730],
  DK: [56.2639, 9.5018], DM: [15.4150, -61.3710], EC: [-1.8312, -78.1834], EG: [26.8206, 30.8025],
  SV: [13.7942, -88.8965], EE: [58.5953, 25.0136], ET: [9.1450, 40.4897], FJ: [-17.7134, 178.0650],
  FI: [61.9241, 25.7482], FR: [46.2276, 2.2137], GA: [-0.8037, 11.6094], GM: [13.4432, -15.3101],
  GE: [42.3155, 43.3569], GH: [7.9465, -1.0232], GR: [39.0742, 21.8243], GD: [12.1165, -61.6790],
  GT: [15.7835, -90.2308], GN: [9.9456, -9.6966], GW: [11.8037, -15.1804], GY: [4.8604, -58.9302],
  HT: [18.9712, -72.2852], HN: [15.2000, -86.2419], HU: [47.1625, 19.5033], IS: [64.9631, -19.0208],
  IN: [20.5937, 78.9629], ID: [-0.7893, 113.9213], IR: [32.4279, 53.6880], IQ: [33.3152, 44.3661],
  IE: [53.1424, -7.6921], IL: [31.0461, 34.8516], IT: [41.8719, 12.5674], JM: [18.1096, -77.2955],
  JP: [36.2048, 138.2529], JO: [30.5852, 36.2384], KZ: [48.0196, 66.9237], KE: [-0.0236, 37.9062],
  KI: [1.4518, 173.1367], KW: [29.3117, 47.4818], LA: [19.8563, 102.4955], LV: [56.8796, 24.6032],
  LB: [33.8547, 35.8623], LS: [-29.6100, 28.2336], LR: [6.4281, -9.4295], LY: [26.3351, 17.2283],
  LT: [55.1694, 23.8799], LU: [49.8153, 6.1296], MG: [-18.7669, 46.8691], MY: [4.2105, 101.9758],
  MW: [-13.2543, 34.3015], MV: [3.2028, 73.2207], ML: [17.5707, -3.9962], MT: [35.9375, 14.3754],
  MR: [21.0079, -10.9408], MU: [-20.3484, 57.5522], MX: [23.6345, -102.5528], FM: [7.4256, 150.5508],
  MD: [47.4116, 28.3699], MC: [43.7384, 7.4244], MN: [46.8625, 103.8467], ME: [42.7087, 19.3744],
  MA: [31.7917, -7.0926], MZ: [-18.6657, 35.5296], MM: [21.9162, 95.9560], NA: [-22.9576, 18.4904],
  NR: [-0.5228, 166.9315], NP: [28.3949, 84.1240], NL: [52.1326, 5.2913], NZ: [-40.9006, 174.8860],
  NI: [12.8654, -85.2072], NE: [17.6078, 8.0817], NG: [9.0820, 8.6753], NO: [60.4720, 8.4689],
  OM: [21.4735, 55.9754], PK: [30.3753, 69.3451], PA: [8.5380, -80.7821], PG: [-6.3150, 143.9555],
  PY: [-23.4425, -58.4438], PE: [-9.1900, -75.0152], PH: [12.8797, 121.7740], PL: [51.9194, 19.1451],
  PT: [39.3999, -8.2245], QA: [25.3548, 51.1839], RO: [45.9432, 24.9668], RU: [61.5240, 105.3188],
  RW: [-1.9403, 29.8739], SN: [14.4974, -14.4524], RS: [44.0166, 21.0059], SC: [-4.6796, 55.4920],
  SL: [8.4606, -11.7799], SG: [1.3521, 103.8198], SK: [48.6690, 19.6990], SI: [46.1512, 14.9955],
  SO: [5.1521, 46.1996], ZA: [-30.5595, 22.9375], SS: [6.8770, 31.3070], ES: [40.4637, -3.7492],
  LK: [7.8731, 80.7718], SD: [12.8628, 30.2176], SR: [3.9193, -56.0279], SE: [60.1282, 18.6435],
  CH: [46.8182, 8.2275], SY: [34.8021, 38.9968], TJ: [38.8610, 71.2761], TZ: [-6.3690, 34.8888],
  TH: [15.8700, 100.9925], TG: [8.6195, 0.8248], TO: [-21.1790, -175.1982], TT: [10.6918, -61.2225],
  TN: [33.8869, 9.5375], TR: [38.9637, 35.2433], TM: [38.9697, 59.9283], UG: [1.3733, 32.2903],
  UA: [48.3794, 31.1656], GB: [54.7024, -3.2766], US: [37.0902, -95.7129], UY: [-32.5228, -55.7652],
  UZ: [41.3775, 64.5853], VU: [-15.3767, 166.9592], VE: [6.4238, -66.5897], VN: [14.0583, 108.2772],
  YE: [15.5527, 48.9934], ZM: [-13.1339, 27.8493], ZW: [-19.0154, 29.1549],
};

const countryCodes: Record<string, string> = {
  AF: 'AFG', AL: 'ALB', DZ: 'DZA', DE: 'DEU', AD: 'AND', AO: 'AGO', AG: 'ATG',
  SA: 'SAU', AR: 'ARG', AM: 'ARM', AU: 'AUS', AT: 'AUT', AZ: 'AZE', BS: 'BHS',
  BH: 'BHR', BD: 'BGD', BB: 'BRB', BE: 'BEL', BJ: 'BEN', BT: 'BTN', BY: 'BLR',
  BW: 'BWA', BR: 'BRA', BN: 'BRN', BG: 'BGR', BF: 'BFA', BI: 'BDI', KH: 'KHM',
  CM: 'CMR', CA: 'CAN', CV: 'CPV', TD: 'TCD', CL: 'CHL', CN: 'CHN', CY: 'CYP',
  CO: 'COL', KM: 'COM', CG: 'COG', KR: 'KOR', CR: 'CRI', CI: 'CIV', HR: 'HRV',
  CU: 'CUB', DK: 'DNK', DM: 'DMA', EC: 'ECU', EG: 'EGY', SV: 'SLV',
  AE: 'ARE', ER: 'ERI', SK: 'SVK', SI: 'SVN', ES: 'ESP', EE: 'EST', SZ: 'SWZ',
  US: 'USA', ET: 'ETH', PH: 'PHL', FI: 'FIN', FJ: 'FJI', FR: 'FRA', GA: 'GAB',
  GM: 'GMB', GE: 'GEO', GH: 'GHA', GR: 'GRC', GD: 'GRD', GT: 'GTM', GN: 'GIN',
  GW: 'GNB', GY: 'GUY', HT: 'HTI', HN: 'HND', HU: 'HUN', IN: 'IND', ID: 'IDN',
  IQ: 'IRQ', IR: 'IRN', IE: 'IRL', IS: 'ISL', IL: 'ISR', IT: 'ITA', JM: 'JAM',
  JP: 'JPN', JO: 'JOR', KZ: 'KAZ', KE: 'KEN', KG: 'KGZ', KI: 'KIR', KW: 'KWT',
  LA: 'LAO', LS: 'LSO', LV: 'LVA', LB: 'LBN', LR: 'LBR', LY: 'LBY', LT: 'LTU',
  LU: 'LUX', MK: 'MKD', MG: 'MDG', MY: 'MYS', MW: 'MWI', MV: 'MDV', ML: 'MLI',
  MT: 'MLT', MA: 'MAR', MH: 'MHL', MR: 'MRT', MU: 'MUS', MX: 'MEX', FM: 'FSM',
  MD: 'MDA', MC: 'MCO', MN: 'MNG', ME: 'MNE', MZ: 'MOZ', MM: 'MMR', NA: 'NAM',
  NR: 'NRU', NP: 'NPL', NI: 'NIC', NE: 'NER', NG: 'NGA', NO: 'NOR', NZ: 'NZL',
  OM: 'OMN', PK: 'PAK', PW: 'PLW', PA: 'PAN', PG: 'PNG', PY: 'PRY', NL: 'NLD',
  PE: 'PER', PL: 'POL', PT: 'PRT', QA: 'QAT', GB: 'GBR', CZ: 'CZE',
  DO: 'DOM', CD: 'COD', RW: 'RWA', RO: 'ROU', RU: 'RUS', SB: 'SLB',
  SN: 'SEN', RS: 'SRB', SC: 'SYC', SL: 'SLE', SG: 'SGP', SO: 'SOM',
  LK: 'LKA', ZA: 'ZAF', SS: 'SSD', SD: 'SDN', SE: 'SWE', CH: 'CHE',
  SR: 'SUR', SY: 'SYR', TW: 'TWN', TJ: 'TJK', TZ: 'TZA', TH: 'THA', TL: 'TLS',
  TG: 'TGO', TO: 'TON', TT: 'TTO', TN: 'TUN', TR: 'TUR', TM: 'TKM', TV: 'TUV',
  UG: 'UGA', UA: 'UKR', UY: 'URY', UZ: 'UZB', VU: 'VUT', VE: 'VEN', VN: 'VNM',
  YE: 'YEM', ZM: 'ZMB', ZW: 'ZWE'
};

function calculateRiskLevel(data: Partial<CountryHealthData>): 'low' | 'medium' | 'high' {
  let score = 0;
  let factors = 0;
  
  if (data.tuberculosis !== null && data.tuberculosis !== undefined) {
    factors++;
    if (data.tuberculosis > 100) score += 3;
    else if (data.tuberculosis > 50) score += 2;
    else if (data.tuberculosis > 20) score += 1;
  }
  
  if (data.hiv !== null && data.hiv !== undefined) {
    factors++;
    if (data.hiv > 5) score += 3;
    else if (data.hiv > 1) score += 1;
  }
  
  if (data.vaccinationDTP3 !== null && data.vaccinationDTP3 !== undefined) {
    factors++;
    if (data.vaccinationDTP3 < 70) score += 2;
    else if (data.vaccinationDTP3 < 85) score += 1;
  }
  
  if (data.healthExpenditure !== null && data.healthExpenditure !== undefined) {
    factors++;
    if (data.healthExpenditure < 3) score += 2;
    else if (data.healthExpenditure < 6) score += 1;
  }
  
  const avgScore = factors > 0 ? score / factors : 2;
  
  if (avgScore >= 2) return 'high';
  if (avgScore >= 1) return 'medium';
  return 'low';
}

async function fetchWHOData(indicator: string): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${WHO_API_BASE}/${indicator}`, { 
      next: { revalidate: 86400 * 7 }
    });
    if (!res.ok) return {};
    const json = await res.json();
    const data: Record<string, number> = {};
    (json.value || []).forEach((item: any) => {
      if (item.SpatialDim && item.NumericValue) {
        data[item.SpatialDim] = item.NumericValue;
      }
    });
    return data;
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const [tuberculosis, hiv, vaccination, healthExp, doctors, beds] = await Promise.all([
      fetchWHOData('MDG_0000000001'),
      fetchWHOData('MDG_0000000002'),
      fetchWHOData('MDG_0000000003'),
      fetchWHOData('GHED_CHE_pc_PS'),
      fetchWHOData('GHED_PHYSICIANS_pc'),
      fetchWHOData('GHED_BEDS_pc'),
    ]);

    const allCodes = new Set([
      ...Object.keys(countryCodes),
      ...Object.keys(tuberculosis).filter(c => countryCodes[c] || WHO_TO_ISO2[c]),
      ...Object.keys(hiv).filter(c => countryCodes[c] || WHO_TO_ISO2[c]),
    ]);

    const countries: CountryHealthData[] = Array.from(allCodes).map(code => {
      const whoCode = countryCodes[code] || code;
      const tb = tuberculosis[whoCode] ?? null;
      const h = hiv[whoCode] ?? null;
      const vac = vaccination[whoCode] ?? null;
      const he = healthExp[whoCode] ?? null;
      const doc = doctors[whoCode] ?? null;
      const bed = beds[whoCode] ?? null;

      const countryName = Object.entries(countryCodes).find(([k, v]) => v === whoCode || k === code)?.[0] 
        ? getCountryName(code) 
        : whoCode;

      return {
        code: whoCode,
        code2: WHO_TO_ISO2[whoCode] || code,
        country: countryName,
        tuberculosis: tb,
        malaria: null,
        hiv: h,
        vaccinationDTP3: vac,
        healthExpenditure: he,
        doctors: doc,
        beds: bed,
        riskLevel: calculateRiskLevel({ tuberculosis: tb, hiv: h, vaccinationDTP3: vac, healthExpenditure: he }),
        score: (() => {
          const r = calculateRiskLevel({ tuberculosis: tb, hiv: h, vaccinationDTP3: vac, healthExpenditure: he });
          return r === 'low' ? 0 : r === 'medium' ? 1 : 2;
        })(),
        ...(PAIS_COORDS[WHO_TO_ISO2[whoCode] || ''] ? { lat: PAIS_COORDS[WHO_TO_ISO2[whoCode]][0], lng: PAIS_COORDS[WHO_TO_ISO2[whoCode]][1] } : {}),
      };
    }).filter(c => c.tuberculosis !== null || c.hiv !== null);

    const topRisks = countries.filter(c => c.riskLevel === 'high').slice(0, 10);
    const lowRisks = countries.filter(c => c.riskLevel === 'low').slice(0, 10);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      source: 'WHO Global Health Observatory',
      sourceUrl: 'https://ghoapi.azureedge.net/',
      totalCountries: countries.length,
      summary: {
        highRisk: countries.filter(c => c.riskLevel === 'high').length,
        mediumRisk: countries.filter(c => c.riskLevel === 'medium').length,
        lowRisk: countries.filter(c => c.riskLevel === 'low').length,
      },
      countries,
      topRiskCountries: topRisks,
      safestCountries: lowRisks,
    });
  } catch (error) {
    console.error('WHO API error:', error);
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
  }
}

function getCountryName(code: string): string {
  const names: Record<string, string> = {
    AF: 'Afganistán', AL: 'Albania', DZ: 'Argelia', DE: 'Alemania', AD: 'Andorra',
    AO: 'Angola', AG: 'Antigua y Barbuda', SA: 'Arabia Saudí', AR: 'Argentina',
    AM: 'Armenia', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaiyán', BS: 'Bahamas',
    BH: 'Baréin', BD: 'Bangladés', BB: 'Barbados', BE: 'Bélgica', BJ: 'Benín',
    BT: 'Bután', BY: 'Bielorrusia', BW: 'Botsuana', BR: 'Brasil', BN: 'Brunéi',
    BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Camboya', CM: 'Camerún',
    CA: 'Canadá', CV: 'Cabo Verde', TD: 'Chad', CL: 'Chile', CN: 'China',
    CY: 'Chipre', CO: 'Colombia', KM: 'Comoras', CG: 'Congo', KR: 'Corea del Sur',
    CR: 'Costa Rica', CI: 'Costa de Marfil', HR: 'Croacia', CU: 'Cuba', DK: 'Dinamarca',
    DM: 'Dominica', EC: 'Ecuador', EG: 'Egipto', SV: 'El Salvador', AE: 'Emiratos',
    EE: 'Estonia', ET: 'Etiopía', PH: 'Filipinas', FI: 'Finlandia', FJ: 'Fiyi',
    FR: 'Francia', GA: 'Gabón', GM: 'Gambia', GE: 'Georgia', GH: 'Ghana',
    GR: 'Grecia', GD: 'Granada', GT: 'Guatemala', GN: 'Guinea', GW: 'Guinea-Bisáu',
    GY: 'Guyana', HT: 'Haití', HN: 'Honduras', HU: 'Hungría', IN: 'India',
    ID: 'Indonesia', IQ: 'Irak', IR: 'Irán', IE: 'Irlanda', IS: 'Islandia',
    IL: 'Israel', IT: 'Italia', JM: 'Jamaica', JP: 'Japón', JO: 'Jordania',
    KZ: 'Kazajistán', KE: 'Kenia', KW: 'Kuwait', LV: 'Letonia', LB: 'Líbano',
    LR: 'Liberia', LY: 'Libia', LT: 'Lituania', LU: 'Luxemburgo', MK: 'Macedonia',
    MG: 'Madagascar', MY: 'Malasia', MW: 'Malaui', MV: 'Maldivas', ML: 'Malí',
    MT: 'Malta', MA: 'Marruecos', MH: 'Islas Marshall', MR: 'Mauritania',
    MU: 'Mauricio', MX: 'México', FM: 'Micronesia', MD: 'Moldavia', MC: 'Mónaco',
    MN: 'Mongolia', ME: 'Montenegro', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia',
    NP: 'Nepal', NI: 'Nicaragua', NE: 'Níger', NG: 'Nigeria', NO: 'Noruega',
    NZ: 'Nueva Zelanda', OM: 'Omán', PK: 'Pakistán', PA: 'Panamá', PG: 'Papúa',
    PY: 'Paraguay', NL: 'Países Bajos', PE: 'Perú', PL: 'Polonia', PT: 'Portugal',
    QA: 'Catar', GB: 'Reino Unido', CZ: 'República Checa', DO: 'República Dominicana',
    CD: 'RD Congo', RW: 'Ruanda', RO: 'Rumanía', RU: 'Rusia', SB: 'Islas Salomón',
    SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leona', SG: 'Singapur',
    SO: 'Somalia', ES: 'España', LK: 'Sri Lanka', ZA: 'Sudáfrica', SS: 'Sudán del Sur',
    SD: 'Sudán', SE: 'Suecia', CH: 'Suiza', SR: 'Surinam', SY: 'Siria', TW: 'Taiwán',
    TJ: 'Tayikistán', TZ: 'Tanzania', TH: 'Tailandia', TL: 'Timor Oriental', TG: 'Togo',
    TO: 'Tonga', TT: 'Trinidad y Tobago', TN: 'Túnez', TR: 'Turquía', TM: 'Turkmenistán',
    TV: 'Tuvalu', UG: 'Uganda', UA: 'Ucrania', UY: 'Uruguay', UZ: 'Uzbekistán',
    VU: 'Vanuatu', VE: 'Venezuela', VN: 'Vietnam', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabue',
  };
  return names[code] || code;
}

export const dynamic = 'force-dynamic';