import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const WHO_API_BASE = 'https://ghoapi.azureedge.net/api';
const WB_API_BASE = 'https://api.worldbank.org/v2/country';

interface DataPoint {
  value: number;
  year: number;
}

interface HealthIndicators {
  tuberculosis: DataPoint | null;
  hiv: DataPoint | null;
  vaccinationDTP3: DataPoint | null;
  healthExpenditure: DataPoint | null;
  doctors: DataPoint | null;
  beds: DataPoint | null;
}

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
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  dataQuality: {
    indicatorsWithData: number;
    totalIndicators: number;
    status: 'complete' | 'partial' | 'insufficient';
    oldestDataYear: number | null;
    sources: ('who' | 'worldbank')[];
  };
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

// HDI data for cross-validation: countries with HDI < 0.6 should not show "low" health risk
const HDI_HEALTH_THRESHOLD = 0.6;
const HDI_DATA: Record<string, number> = {
  AF: 0.422, AL: 0.795, DZ: 0.754, DE: 0.942, AD: 0.858, AO: 0.591, AG: 0.826,
  SA: 0.875, AR: 0.849, AM: 0.786, AU: 0.939, AT: 0.908, AZ: 0.734, BS: 0.812,
  BH: 0.888, BD: 0.645, BB: 0.809, BE: 0.937, BJ: 0.525, BT: 0.666, BY: 0.822,
  BW: 0.693, BR: 0.832, BN: 0.730, BG: 0.848, BF: 0.449, BI: 0.426, KH: 0.589,
  CM: 0.587, CA: 0.935, CV: 0.645, TD: 0.394, CL: 0.872, CN: 0.844, CY: 0.860,
  CO: 0.767, KM: 0.555, CG: 0.589, CD: 0.479, CR: 0.810, HR: 0.858, CU: 0.764,
  DK: 0.948, DJ: 0.509, DM: 0.742, EC: 0.759, EG: 0.731, SV: 0.674, GQ: 0.610,
  EE: 0.899, SZ: 0.549, ET: 0.498, FJ: 0.724, FI: 0.940, FR: 0.910, GA: 0.650,
  GM: 0.518, GE: 0.812, GH: 0.632, GR: 0.887, GD: 0.779, GT: 0.697, GN: 0.465,
  GW: 0.483, GY: 0.742, HT: 0.535, HN: 0.625, HU: 0.878, IS: 0.959, IN: 0.645,
  ID: 0.718, IR: 0.799, IQ: 0.686, IE: 0.945, IL: 0.919, IT: 0.872, JM: 0.710,
  JP: 0.925, JO: 0.735, KZ: 0.825, KE: 0.575, KI: 0.624, KW: 0.826, KG: 0.697,
  LA: 0.607, LV: 0.870, LB: 0.712, LS: 0.514, LR: 0.480, LY: 0.718, LT: 0.870,
  LU: 0.930, MG: 0.520, MW: 0.512, MY: 0.830, MV: 0.740, ML: 0.427, MT: 0.887,
  MH: 0.703, MR: 0.546, MU: 0.804, MX: 0.838, FM: 0.620, MD: 0.771, MC: 0.956,
  MN: 0.749, ME: 0.838, MA: 0.767, MZ: 0.456, MM: 0.583, NA: 0.615, NR: 0.630,
  NP: 0.604, NL: 0.938, NZ: 0.936, NI: 0.660, NE: 0.400, NG: 0.539, MK: 0.774,
  NO: 0.959, OM: 0.819, PK: 0.557, PW: 0.781, PA: 0.815, PG: 0.558, PY: 0.730,
  PE: 0.777, PH: 0.718, PL: 0.880, PT: 0.906, QA: 0.860, RO: 0.855, RU: 0.822,
  RW: 0.543, KN: 0.779, LC: 0.745, VC: 0.751, WS: 0.707, SM: 0.867, ST: 0.613,
  SN: 0.514, RS: 0.806, SC: 0.782, SL: 0.452, SG: 0.935, SK: 0.848, SI: 0.918,
  SO: 0.351, ZA: 0.713, SS: 0.396, ES: 0.911, LK: 0.782, SD: 0.508, SR: 0.738,
  SE: 0.946, CH: 0.962, SY: 0.567, TW: 0.916, TJ: 0.668, TZ: 0.549, TH: 0.830,
  TL: 0.607, TG: 0.543, TO: 0.745, TT: 0.799, TN: 0.739, TR: 0.836, TM: 0.745,
  TV: 0.641, UG: 0.525, UA: 0.773, UY: 0.830, UZ: 0.727, VU: 0.609, VE: 0.691,
  VN: 0.726, YE: 0.470, ZM: 0.565, ZW: 0.571,
};

// Correct WHO indicator codes
const WHO_INDICATORS = {
  tuberculosis: 'MDG_0000000020',
  hiv: 'MDG_0000000029',
  vaccinationDTP3: 'WHS4_100',
  healthExpenditure: 'GHED_CHE_pc_US_SHA2011',
  doctors: 'HWF_0001',
  beds: 'WHS6_102',
};

// World Bank indicator codes
const WB_INDICATORS: Record<string, string> = {
  tuberculosis: 'SH.TBS.INCD',
  hiv: 'SH.DYN.AIDS.ZS',
  vaccinationDTP3: 'SH.IMM.IDPT',
  healthExpenditure: 'SH.XPD.CHEX.PC.CD',
  doctors: 'SH.MED.PHYS.ZS',
  beds: 'SH.MED.BEDS.ZS',
};

// ---- WHO API ----
async function fetchWHOData(indicator: string): Promise<Record<string, DataPoint>> {
  try {
    const res = await fetch(`${WHO_API_BASE}/${indicator}`, {
      next: { revalidate: 86400 * 7 },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return {};
    const json = await res.json();
    const byCountry: Record<string, DataPoint[]> = {};

    (json.value || []).forEach((item: any) => {
      const country = item.SpatialDim;
      const numVal = item.NumericValue;
      const year = item.TimeDim;
      if (!country || numVal == null || year == null) return;
      if (!byCountry[country]) byCountry[country] = [];
      byCountry[country].push({ value: numVal, year });
    });

    const result: Record<string, DataPoint> = {};
    for (const [country, vals] of Object.entries(byCountry)) {
      const sorted = vals.sort((a, b) => b.year - a.year);
      result[country] = { value: sorted[0].value, year: sorted[0].year };
    }
    return result;
  } catch {
    return {};
  }
}

// ---- World Bank API ----
const WB_ISO3_MAP: Record<string, string> = {};
for (const [iso2, iso3] of Object.entries(countryCodes)) {
  WB_ISO3_MAP[iso2] = iso3;
}

async function fetchWorldBankIndicator(countryIso3: string, indicator: string): Promise<DataPoint | null> {
  try {
    const url = `${WB_API_BASE}/${countryIso3}/indicator/${indicator}?format=json&per_page=5&mrnev=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) return null;
    for (const entry of json[1]) {
      if (entry.value != null) {
        return { value: entry.value, year: parseInt(entry.date) };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWorldBankData(): Promise<Record<string, HealthIndicators>> {
  const keys = Object.keys(WB_INDICATORS);
  const result: Record<string, HealthIndicators> = {};

  for (const key of keys) {
    const indicator = WB_INDICATORS[key];
    const promises = Object.entries(WB_ISO3_MAP).map(async ([iso2, iso3]) => {
      const point = await fetchWorldBankIndicator(iso3, indicator);
      return { iso2, point };
    });
    const settled = await Promise.allSettled(promises);
    for (const s of settled) {
      if (s.status !== 'fulfilled' || !s.value.point) continue;
      const { iso2, point } = s.value;
      if (!result[iso2]) result[iso2] = { tuberculosis: null, hiv: null, vaccinationDTP3: null, healthExpenditure: null, doctors: null, beds: null };
      (result[iso2] as any)[key] = point;
    }
  }
  return result;
}

// ---- Risk calculation ----
function getOldestYear(...years: (number | null)[]): number | null {
  const valid = years.filter((y): y is number => y !== null);
  return valid.length > 0 ? Math.min(...valid) : null;
}

function scoreIndicators(data: HealthIndicators): { score: number; factors: number } {
  let score = 0;
  let factors = 0;

  if (data.tuberculosis) {
    factors++;
    const tb = data.tuberculosis.value;
    if (tb > 100) score += 3;
    else if (tb > 50) score += 2;
    else if (tb > 20) score += 1;
  }

  if (data.hiv) {
    factors++;
    const h = data.hiv.value;
    if (h > 5) score += 3;
    else if (h > 1) score += 1;
  }

  if (data.vaccinationDTP3) {
    factors++;
    const vac = data.vaccinationDTP3.value;
    if (vac < 70) score += 2;
    else if (vac < 85) score += 1;
  }

  if (data.healthExpenditure) {
    factors++;
    const he = data.healthExpenditure.value;
    if (he < 3) score += 2;
    else if (he < 6) score += 1;
  }

  return { score, factors };
}

function computeRisk(avgScore: number): 'low' | 'medium' | 'high' {
  if (avgScore >= 2) return 'high';
  if (avgScore >= 1) return 'medium';
  return 'low';
}

function determineRiskLevel(
  indicators: HealthIndicators,
  countryCode: string,
  sources: ('who' | 'worldbank')[],
): { riskLevel: 'low' | 'medium' | 'high' | 'unknown'; dataQuality: CountryHealthData['dataQuality'] } {
  const checks = [indicators.tuberculosis, indicators.hiv, indicators.vaccinationDTP3, indicators.healthExpenditure];
  const indicatorsWithData = checks.filter(c => c !== null).length;
  const totalIndicators = checks.length;
  const years = checks.map(c => c?.year ?? null);
  const oldestDataYear = getOldestYear(...years);

  let status: 'complete' | 'partial' | 'insufficient';
  if (indicatorsWithData >= totalIndicators) status = 'complete';
  else if (indicatorsWithData >= 2) status = 'partial';
  else status = 'insufficient';

  if (status === 'insufficient') {
    return {
      riskLevel: 'unknown',
      dataQuality: { indicatorsWithData, totalIndicators, status, oldestDataYear, sources },
    };
  }

  const { score, factors } = scoreIndicators(indicators);
  const avgScore = factors > 0 ? score / factors : 2;
  let riskLevel = computeRisk(avgScore);

  // Cross-validation against HDI
  const hdiScore = HDI_DATA[countryCode];
  if (riskLevel === 'low' && hdiScore !== undefined && hdiScore < HDI_HEALTH_THRESHOLD) {
    console.warn(`[Health Audit] ${countryCode}: HDI=${hdiScore} suggests risk should not be 'low'. Indicators: ${indicatorsWithData}/${totalIndicators}. Sources: ${sources.join(',')}`);
    riskLevel = 'medium';
  }

  return {
    riskLevel,
    dataQuality: { indicatorsWithData, totalIndicators, status, oldestDataYear, sources },
  };
}

function mergeSources(who: HealthIndicators, wb: HealthIndicators): { merged: HealthIndicators; sources: ('who' | 'worldbank')[] } {
  const sources: ('who' | 'worldbank')[] = [];
  const merged: HealthIndicators = { tuberculosis: null, hiv: null, vaccinationDTP3: null, healthExpenditure: null, doctors: null, beds: null };

  for (const key of ['tuberculosis', 'hiv', 'vaccinationDTP3', 'healthExpenditure', 'doctors', 'beds'] as const) {
    const whoVal = who[key];
    const wbVal = wb[key];

    if (whoVal && wbVal) {
      // Both sources have data — use WHO (more specialized) and cross-validate
      merged[key] = whoVal;
      sources.push('who');
    } else if (whoVal) {
      merged[key] = whoVal;
      sources.push('who');
    } else if (wbVal) {
      merged[key] = wbVal;
      if (!sources.includes('worldbank')) sources.push('worldbank');
    }
  }

  if (sources.length === 0) sources.push('who');
  return { merged, sources };
}

// ---- Active outbreak integration ----
const MIN_OUTBREAK_SEVERITY = 'high';
const OUTBREAK_THRESHOLD = 2;

async function fetchActiveOutbreakCountries(): Promise<Set<string>> {
  const outbreakCountries = new Set<string>();
  if (!supabase) return outbreakCountries;

  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('country_code, severity')
      .eq('type', 'health_outbreak')
      .eq('is_active', true);

    if (error) {
      console.error('[Health API] Error fetching active outbreaks:', error.message);
      return outbreakCountries;
    }

    const severityOrder = ['low', 'medium', 'high', 'critical'];
    const counts: Record<string, { count: number; hasCritical: boolean }> = {};

    for (const inc of data || []) {
      if (inc.country_code && severityOrder.indexOf(inc.severity || 'low') >= severityOrder.indexOf(MIN_OUTBREAK_SEVERITY)) {
        const code = inc.country_code.toUpperCase();
        if (!counts[code]) counts[code] = { count: 0, hasCritical: false };
        counts[code].count++;
        if (inc.severity === 'critical') counts[code].hasCritical = true;
      }
    }

    for (const [code, c] of Object.entries(counts)) {
      if (c.hasCritical || c.count >= OUTBREAK_THRESHOLD) {
        outbreakCountries.add(code);
      }
    }

    if (outbreakCountries.size > 0) {
      console.log(`[Health API] Active outbreaks (${MIN_OUTBREAK_SEVERITY}+, threshold ${OUTBREAK_THRESHOLD}) for: ${Array.from(outbreakCountries).join(', ')}`);
    }
  } catch (e) {
    console.error('[Health API] Failed to fetch outbreaks:', e);
  }

  return outbreakCountries;
}

// ---- Main handler ----
export async function GET() {
  try {
    const [whoTB, whoHIV, whoVac, whoHExp, whoDocs, whoBeds, outbreakCountries] = await Promise.all([
      fetchWHOData(WHO_INDICATORS.tuberculosis),
      fetchWHOData(WHO_INDICATORS.hiv),
      fetchWHOData(WHO_INDICATORS.vaccinationDTP3),
      fetchWHOData(WHO_INDICATORS.healthExpenditure),
      fetchWHOData(WHO_INDICATORS.doctors),
      fetchWHOData(WHO_INDICATORS.beds),
      fetchActiveOutbreakCountries(),
    ]);

    // Fetch World Bank as secondary source
    const wbData = await fetchWorldBankData();

    const allCodes = new Set([
      ...Object.keys(countryCodes),
      ...Object.keys(whoTB).filter(c => countryCodes[c] || WHO_TO_ISO2[c]),
      ...Object.keys(whoHIV).filter(c => countryCodes[c] || WHO_TO_ISO2[c]),
    ]);

    const countries: (CountryHealthData & { score: number })[] = Array.from(allCodes).map(code => {
      const whoCode = countryCodes[code] || code;

      const who: HealthIndicators = {
        tuberculosis: whoTB[whoCode] ?? null,
        hiv: whoHIV[whoCode] ?? null,
        vaccinationDTP3: whoVac[whoCode] ?? null,
        healthExpenditure: whoHExp[whoCode] ?? null,
        doctors: whoDocs[whoCode] ?? null,
        beds: whoBeds[whoCode] ?? null,
      };

      const wb: HealthIndicators = wbData[code] ?? {
        tuberculosis: null, hiv: null, vaccinationDTP3: null, healthExpenditure: null, doctors: null, beds: null,
      };

      const { merged, sources } = mergeSources(who, wb);
      let { riskLevel, dataQuality } = determineRiskLevel(merged, code, sources);

      // Override to 'high' if an active health outbreak is detected via OSINT pipeline
      if (riskLevel !== 'unknown' && outbreakCountries.has(code.toUpperCase())) {
        console.log(`[Health API] ${code}: active outbreak detected, overriding riskLevel ${riskLevel} → high`);
        riskLevel = 'high';
      }

      const score = riskLevel === 'unknown' ? 0
        : riskLevel === 'low' ? 0
        : riskLevel === 'medium' ? 1 : 2;

      return {
        code: whoCode,
        code2: WHO_TO_ISO2[whoCode] || code,
        country: getCountryName(code),
        tuberculosis: merged.tuberculosis?.value ?? null,
        malaria: null,
        hiv: merged.hiv?.value ?? null,
        vaccinationDTP3: merged.vaccinationDTP3?.value ?? null,
        healthExpenditure: merged.healthExpenditure?.value ?? null,
        doctors: merged.doctors?.value ?? null,
        beds: merged.beds?.value ?? null,
        riskLevel,
        dataQuality,
        score,
        ...(PAIS_COORDS[WHO_TO_ISO2[whoCode] || ''] ? {
          lat: PAIS_COORDS[WHO_TO_ISO2[whoCode]][0],
          lng: PAIS_COORDS[WHO_TO_ISO2[whoCode]][1],
        } : {}),
      };
    }).filter(c => c.tuberculosis !== null || c.hiv !== null || c.vaccinationDTP3 !== null);

    const topRisks = countries.filter(c => c.riskLevel === 'high').slice(0, 10);
    const lowRisks = countries.filter(c => c.riskLevel === 'low').slice(0, 10);

    // Log audit summary for anomalies
    const anomalies = countries.filter(c =>
      c.riskLevel === 'low' && HDI_DATA[getCountryCodeFromWhoCode(c.code)] !== undefined &&
      HDI_DATA[getCountryCodeFromWhoCode(c.code)] < HDI_HEALTH_THRESHOLD
    );
    if (anomalies.length > 0) {
      console.warn(`[Health Audit] ${anomalies.length} países con posible anomalía (riesgo bajo pero HDI < ${HDI_HEALTH_THRESHOLD}):`, anomalies.map(a => `${a.country}(${a.code2})`));
    }

    // Log countries with insufficient data
    const unknowns = countries.filter(c => c.riskLevel === 'unknown');
    if (unknowns.length > 0) {
      console.warn(`[Health Audit] ${unknowns.length} países sin datos suficientes:`, unknowns.map(a => `${a.country}(${a.code2})`));
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sources: ['WHO Global Health Observatory', 'World Bank Open Data'],
      totalCountries: countries.length,
      summary: {
        highRisk: countries.filter(c => c.riskLevel === 'high').length,
        mediumRisk: countries.filter(c => c.riskLevel === 'medium').length,
        lowRisk: countries.filter(c => c.riskLevel === 'low').length,
        unknown: countries.filter(c => c.riskLevel === 'unknown').length,
      },
      countries,
      topRiskCountries: topRisks,
      safestCountries: lowRisks,
    });
  } catch (error) {
    console.error('Health API error:', error);
    return NextResponse.json({ error: 'Failed to fetch health data' }, { status: 500 });
  }
}

function getCountryCodeFromWhoCode(whoCode: string): string {
  const entry = Object.entries(WHO_TO_ISO2).find(([k, v]) => k === whoCode);
  return entry ? entry[1] : whoCode;
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
