import type { InfografiaData } from './data';

const BG = '#0a0e17';
const CARD_BG = '#111827';
const BORDER = '#1e293b';
const TEXT_PRIMARY = '#f1f5f9';
const TEXT_SECONDARY = '#94a3b8';
const ACCENT_BLUE = '#3b82f6';
const ACCENT_GREEN = '#22c55e';
const ACCENT_AMBER = '#f59e0b';
const ACCENT_RED = '#ef4444';
const ACCENT_PURPLE = '#a855f7';
const GRID = '#1e293b';

function riskColor(level: string): string {
  const map: Record<string, string> = {
    'sin-riesgo': ACCENT_GREEN,
    'bajo': '#84cc16',
    'medio': ACCENT_AMBER,
    'alto': ACCENT_RED,
    'muy-alto': '#991b1b',
  };
  return map[level] || TEXT_SECONDARY;
}

function gwiColor(score: number): string {
  if (score < 25) return ACCENT_GREEN;
  if (score < 45) return '#84cc16';
  if (score < 60) return ACCENT_AMBER;
  if (score < 75) return ACCENT_RED;
  return '#991b1b';
}

// Simplified heatmap dots: approximate lat/lng mapped to SVG coords
const HEATMAP_DOTS = [
  { cx: 52, cy: 22, countries: ['RU', 'UA', 'BY'] },
  { cx: 48, cy: 28, countries: ['DE', 'FR', 'GB', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'PT'] },
  { cx: 55, cy: 32, countries: ['PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'RS', 'AL'] },
  { cx: 52, cy: 38, countries: ['TR', 'EG', 'IL', 'JO', 'LB', 'CY'] },
  { cx: 60, cy: 26, countries: ['SE', 'NO', 'FI', 'DK', 'LT', 'LV', 'EE'] },
  { cx: 60, cy: 42, countries: ['IR', 'IQ', 'SA', 'AE', 'YE', 'OM', 'QA', 'KW', 'BH'] },
  { cx: 72, cy: 30, countries: ['KZ', 'UZ', 'TM', 'KG', 'TJ'] },
  { cx: 82, cy: 28, countries: ['CN', 'MN'] },
  { cx: 88, cy: 30, countries: ['JP', 'KR', 'TW'] },
  { cx: 78, cy: 36, countries: ['IN', 'NP', 'BD', 'LK', 'PK', 'AF'] },
  { cx: 88, cy: 40, countries: ['TH', 'VN', 'KH', 'LA', 'MM', 'MY', 'SG', 'ID', 'PH'] },
  { cx: 22, cy: 30, countries: ['US', 'CA'] },
  { cx: 20, cy: 42, countries: ['MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA'] },
  { cx: 28, cy: 50, countries: ['CO', 'VE', 'EC', 'PE', 'BR', 'BO', 'CL', 'AR', 'UY', 'PY', 'GY', 'SR'] },
  { cx: 52, cy: 58, countries: ['ZA', 'NG', 'KE', 'EG', 'MA', 'TN', 'DZ', 'LY', 'SN', 'GH', 'CI', 'ET', 'TZ', 'AO', 'MZ', 'MG', 'ZW', 'CM', 'UG', 'ZM'] },
  { cx: 18, cy: 58, countries: ['AU', 'NZ'] },
  { cx: 56, cy: 16, countries: ['IS'] },
];

// continent risk blobs for heatmap
const CONTINENTS = [
  { label: 'EUROPA', cx: 52, cy: 28, w: 18, h: 16 },
  { label: 'NORTEAMÉRICA', cx: 22, cy: 30, w: 10, h: 10 },
  { label: 'LATAM', cx: 26, cy: 46, w: 12, h: 16 },
  { label: 'MENAT', cx: 56, cy: 38, w: 12, h: 14 },
  { label: 'ASIA', cx: 82, cy: 34, w: 18, h: 18 },
  { label: 'ÁFRICA', cx: 52, cy: 52, w: 16, h: 18 },
  { label: 'OCEANÍA', cx: 18, cy: 56, w: 6, h: 6 },
];

function computeContinentRisk(data: InfografiaData, countryCodes: string[]): string {
  const riskLevels = countryCodes.map(code => {
    const p = data.topRiskCountries.find(c => c.code === code)
      || data.topSafeCountries.find(c => c.code === code);
    return p ? p.riskLevel : 'bajo';
  });
  const scores = riskLevels.map(r => r === 'muy-alto' ? 5 : r === 'alto' ? 4 : r === 'medio' ? 3 : r === 'bajo' ? 2 : 1);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  if (avg >= 4) return ACCENT_RED;
  if (avg >= 3) return ACCENT_AMBER;
  if (avg >= 2) return '#84cc16';
  return ACCENT_GREEN;
}

export function generateInfografiaSVG(data: InfografiaData): string {
  const { stats, gwi, topRiskCountries, riskDistribution, edition, weekStart, weekEnd, incidentsThisWeek, countriesChanged, gwiTrend } = data;
  const W = 1200;
  const H = 1950; // taller for heatmap + CTA

  const trendArrow = gwiTrend !== null
    ? gwiTrend > 0
      ? `▲ +${gwiTrend.toFixed(1)}`
      : gwiTrend < 0
        ? `▼ ${gwiTrend.toFixed(1)}`
        : '— 0.0'
    : '—';

  const trendColor = gwiTrend !== null
    ? gwiTrend > 0 ? ACCENT_RED : ACCENT_GREEN
    : TEXT_SECONDARY;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0e17"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#0a0e17"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1e3a5f"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#1e3a5f"/>
    </linearGradient>
    <linearGradient id="gwiGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${gwiColor(gwi.total)}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${gwiColor(gwi.total)}" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      text { font-family: 'Courier New', 'Menlo', monospace; }
      .title { font-size: 32px; font-weight: bold; fill: ${TEXT_PRIMARY}; }
      .subtitle { font-size: 14px; fill: ${TEXT_SECONDARY}; }
      .slogan { font-size: 11px; fill: ${ACCENT_BLUE}; font-style: italic; }
      .section-title { font-size: 16px; font-weight: bold; fill: ${ACCENT_BLUE}; letter-spacing: 2px; }
      .value-lg { font-size: 48px; font-weight: bold; }
      .value-md { font-size: 28px; font-weight: bold; }
      .label-sm { font-size: 11px; fill: ${TEXT_SECONDARY}; }
      .country-name { font-size: 13px; fill: ${TEXT_PRIMARY}; }
      .risk-tag { font-size: 10px; font-weight: bold; }
      .cta { font-size: 13px; font-weight: bold; fill: ${ACCENT_BLUE}; }
      .signature { font-size: 10px; fill: #64748b; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

  <!-- Grid overlay -->
  <g opacity="0.08">
    ${Array.from({ length: 26 }, (_, i) => `<line x1="0" y1="${i * 75}" x2="${W}" y2="${i * 75}" stroke="${GRID}" stroke-width="0.5"/>`).join('')}
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 75}" y1="0" x2="${i * 75}" y2="${H}" stroke="${GRID}" stroke-width="0.5"/>`).join('')}
  </g>

  <!-- Header -->
  <rect x="0" y="0" width="${W}" height="135" fill="url(#headerGrad)"/>
  <line x1="0" y1="135" x2="${W}" y2="135" stroke="${ACCENT_BLUE}" stroke-width="2" opacity="0.5"/>

  <!-- Logo / branding -->
  <text x="40" y="45" class="title">VIAJE CON INTELIGENCIA</text>
  <text x="40" y="67" class="slogan">"Tu radar de seguridad global impulsado por IA"</text>
  <text x="40" y="90" class="subtitle">INFORME SEMANAL DE RIESGOS GLOBALES</text>
  <text x="40" y="114" class="subtitle">Edición #${edition}  •  ${weekStart} — ${weekEnd}</text>

  <text x="${W - 40}" y="45" text-anchor="end" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">CLASSIFICATION: UNCLASSIFIED</text>
  <text x="${W - 40}" y="63" text-anchor="end" font-size="11" fill="${ACCENT_GREEN}" font-family="monospace">● LIVE DATA</text>
  <text x="${W - 40}" y="81" text-anchor="end" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">${data.timestamp.split('T')[0]} UTC</text>
  <text x="${W - 40}" y="99" text-anchor="end" font-size="10" fill="${ACCENT_BLUE}" font-family="monospace">Smart Traveler: AI-Driven Global Risk Radar</text>

  <!-- GWI - Global Weekly Index (hero card) -->
  <rect x="40" y="165" width="${W - 80}" height="180" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <rect x="40" y="165" width="${W - 80}" height="180" rx="8" fill="url(#gwiGrad)"/>
  <text x="60" y="195" class="section-title">GLOBAL WEEKLY INDEX (GWI)</text>
  <text x="60" y="215" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">Composite travel risk score: 0 (safe) — 100 (critical)</text>

  <text x="60" y="290" class="value-lg" fill="${gwiColor(gwi.total)}" filter="url(#glow)">${gwi.total.toFixed(1)}</text>
  <text x="60" y="315" class="label-sm">GLOBAL INDEX</text>

  <text x="200" y="290" class="value-md" fill="${trendColor}">${trendArrow}</text>
  <text x="200" y="315" class="label-sm">vs. last week</text>

  <!-- GWI sub-scores -->
  ${[
    { label: 'RISK DISTRIBUTION', value: gwi.riskScore, max: 100, x: 380, color: ACCENT_RED },
    { label: 'GPI', value: gwi.gpiScore, max: 100, x: 560, color: ACCENT_PURPLE },
    { label: 'GTI', value: gwi.gtiScore, max: 100, x: 720, color: ACCENT_AMBER },
    { label: 'INCIDENTS', value: gwi.incidentScore, max: 100, x: 890, color: ACCENT_BLUE },
    { label: 'HDI', value: gwi.hdiScore, max: 100, x: 1060, color: ACCENT_GREEN },
  ].map((s) => {
    const barH = 60;
    const fillH = (s.value / s.max) * barH;
    return `
  <g>
    <text x="${s.x}" y="215" class="label-sm" text-anchor="middle">${s.label}</text>
    <rect x="${s.x - 6}" y="225" width="12" height="${barH}" rx="2" fill="${BORDER}"/>
    <rect x="${s.x - 6}" y="${225 + (barH - fillH)}" width="12" height="${fillH}" rx="2" fill="${s.color}" opacity="0.8"/>
    <text x="${s.x}" y="${250}" text-anchor="middle" font-size="14" font-weight="bold" fill="${TEXT_PRIMARY}" font-family="monospace">${s.value.toFixed(1)}</text>
  </g>`;
  }).join('')}

  <!-- Simplified Heatmap -->
  <rect x="40" y="375" width="${W - 80}" height="230" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <text x="60" y="405" class="section-title">HEATMAP — RIESGO GLOBAL</text>
  <text x="60" y="425" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">Intensidad de riesgo por región  •  ${stats.totalPaises} países</text>

  <!-- Continent blobs with risk coloring -->
  ${CONTINENTS.map(cont => {
    const color = computeContinentRisk(data, cont.cx > 50 && cont.cy > 40 ? ['IR','IQ','SA','AE','YE','OM','QA','KW','BH','AF'] : ['']);
    return `
  <g>
    <rect x="${cont.cx - cont.w / 2}" y="${cont.cy - cont.h / 2}" width="${cont.w}" height="${cont.h}" rx="4" fill="${color}" opacity="0.25"/>
    <text x="${cont.cx}" y="${cont.cy + 3}" text-anchor="middle" font-size="7" font-weight="bold" fill="${color}" font-family="monospace">${cont.label}</text>
  </g>`;
  }).join('')}

  <!-- Risk dots by country cluster -->
  ${HEATMAP_DOTS.map(d => {
    const p = topRiskCountries.find(c => d.countries.includes(c.code));
    const level = p ? p.riskLevel : 'bajo';
    const color = riskColor(level);
    const r = level === 'muy-alto' ? 7 : level === 'alto' ? 6 : level === 'medio' ? 5 : 4;
    return `
  <g>
    <circle cx="${d.cx}" cy="${d.cy}" r="${r}" fill="${color}" opacity="0.8"/>
    <circle cx="${d.cx}" cy="${d.cy}" r="${r + 3}" fill="${color}" opacity="0.15"/>
  </g>`;
  }).join('')}

  <!-- Legend -->
  <g transform="translate(60, 540)">
    <rect x="0" y="0" width="10" height="10" rx="2" fill="${ACCENT_GREEN}" opacity="0.8"/>
    <text x="14" y="9" font-size="9" fill="${TEXT_SECONDARY}" font-family="monospace">Seguro</text>
    <rect x="70" y="0" width="10" height="10" rx="2" fill="#84cc16" opacity="0.8"/>
    <text x="84" y="9" font-size="9" fill="${TEXT_SECONDARY}" font-family="monospace">Bajo</text>
    <rect x="130" y="0" width="10" height="10" rx="2" fill="${ACCENT_AMBER}" opacity="0.8"/>
    <text x="144" y="9" font-size="9" fill="${TEXT_SECONDARY}" font-family="monospace">Medio</text>
    <rect x="195" y="0" width="10" height="10" rx="2" fill="${ACCENT_RED}" opacity="0.8"/>
    <text x="209" y="9" font-size="9" fill="${TEXT_SECONDARY}" font-family="monospace">Alto</text>
    <rect x="250" y="0" width="10" height="10" rx="2" fill="#991b1b" opacity="0.8"/>
    <text x="264" y="9" font-size="9" fill="${TEXT_SECONDARY}" font-family="monospace">Crítico</text>
  </g>

  <!-- Risk Distribution -->
  <rect x="40" y="635" width="540" height="200" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <text x="60" y="665" class="section-title">RIESGO GLOBAL — DISTRIBUCIÓN</text>
  <text x="60" y="685" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">${stats.totalPaises} países monitoreados  •  ${stats.totalContinentes} continentes</text>

  ${[
    { label: 'Sin riesgo', count: riskDistribution.sinRiesgo, color: ACCENT_GREEN, pct: (riskDistribution.sinRiesgo / stats.totalPaises) * 100 },
    { label: 'Bajo', count: riskDistribution.bajo, color: '#84cc16', pct: (riskDistribution.bajo / stats.totalPaises) * 100 },
    { label: 'Medio', count: riskDistribution.medio, color: ACCENT_AMBER, pct: (riskDistribution.medio / stats.totalPaises) * 100 },
    { label: 'Alto', count: riskDistribution.alto, color: ACCENT_RED, pct: (riskDistribution.alto / stats.totalPaises) * 100 },
    { label: 'Muy alto', count: riskDistribution.muyAlto, color: '#991b1b', pct: (riskDistribution.muyAlto / stats.totalPaises) * 100 },
  ].map((r, i) => {
    const barW = 380;
    const y = 710 + i * 28;
    return `
  <g>
    <text x="60" y="${y + 4}" class="country-name">${r.label}</text>
    <rect x="170" y="${y - 8}" width="${barW}" height="16" rx="3" fill="${BORDER}"/>
    <rect x="170" y="${y - 8}" width="${Math.max(4, (r.pct / 100) * barW)}" height="16" rx="3" fill="${r.color}" opacity="0.8"/>
    <text x="570" y="${y + 4}" text-anchor="end" font-size="13" font-weight="bold" fill="${TEXT_PRIMARY}" font-family="monospace">${r.count}</text>
    <text x="585" y="${y + 4}" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">${r.pct.toFixed(0)}%</text>
  </g>`;
  }).join('')}

  <!-- Key metrics -->
  <rect x="610" y="635" width="550" height="200" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <text x="630" y="665" class="section-title">MÉTRICAS CLAVE</text>

  <g>
    <text x="630" y="710" class="value-md" fill="${ACCENT_RED}">${stats.altoOMuyAlto}</text>
    <text x="770" y="710" class="label-sm" dominant-baseline="middle">Países en riesgo alto/muy alto</text>
  </g>
  <g>
    <text x="630" y="755" class="value-md" fill="${ACCENT_GREEN}">${stats.seguroOBajo}</text>
    <text x="770" y="755" class="label-sm" dominant-baseline="middle">Países seguros o riesgo bajo</text>
  </g>
  <g>
    <text x="630" y="800" class="value-md" fill="${ACCENT_AMBER}">${incidentsThisWeek}</text>
    <text x="770" y="800" class="label-sm" dominant-baseline="middle">Incidentes esta semana</text>
  </g>

  ${countriesChanged.length > 0 ? `
  <rect x="610" y="825" rx="4" fill="${ACCENT_AMBER}" opacity="0.15" width="420" height="20"/>
  <text x="630" y="839" font-size="11" fill="${ACCENT_AMBER}" font-family="monospace">⚠ ${countriesChanged.length} países cambiaron de nivel de riesgo</text>
  ` : ''}

  <!-- Top Risk Countries -->
  <rect x="40" y="865" width="540" height="${40 + topRiskCountries.slice(0, 10).length * 36}" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <text x="60" y="895" class="section-title">TOP 10 — MAYOR RIESGO</text>

  <g>
    <text x="60" y="915" class="label-sm">#</text>
    <text x="95" y="915" class="label-sm">PAÍS</text>
    <text x="320" y="915" class="label-sm">REGIÓN</text>
    <text x="440" y="915" class="label-sm">RIESGO</text>
  </g>
  <line x1="60" y1="921" x2="560" y2="921" stroke="${BORDER}" stroke-width="0.5"/>

  ${topRiskCountries.slice(0, 10).map((c, i) => `
  <g>
    <text x="60" y="${950 + i * 36}" font-size="12" fill="${TEXT_SECONDARY}" font-family="monospace">${String(i + 1).padStart(2, ' ')}</text>
    <text x="95" y="${950 + i * 36}" class="country-name">${c.flag} ${c.name}</text>
    <text x="320" y="${950 + i * 36}" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">${c.region}</text>
    <rect x="435" y="${940 + i * 36}" width="8" height="8" rx="2" fill="${riskColor(c.riskLevel)}"/>
    <text x="450" y="${950 + i * 36}" class="risk-tag" fill="${riskColor(c.riskLevel)}">${c.riskLevel.toUpperCase()}</text>
  </g>`).join('')}

  <!-- Top Safe Countries -->
  <rect x="610" y="865" width="550" height="${40 + topRiskCountries.slice(0, 10).length * 36}" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <text x="630" y="895" class="section-title">TOP 10 — MENOR RIESGO</text>

  <g>
    <text x="630" y="915" class="label-sm">#</text>
    <text x="665" y="915" class="label-sm">PAÍS</text>
    <text x="890" y="915" class="label-sm">REGIÓN</text>
    <text x="1020" y="915" class="label-sm">RIESGO</text>
  </g>
  <line x1="630" y1="921" x2="1140" y2="921" stroke="${BORDER}" stroke-width="0.5"/>

  ${topRiskCountries.slice(0, 10).map((c, i) => `
  <g>
    <text x="630" y="${950 + i * 36}" font-size="12" fill="${TEXT_SECONDARY}" font-family="monospace">${String(i + 1).padStart(2, ' ')}</text>
    <text x="665" y="${950 + i * 36}" class="country-name">${c.flag} ${c.name}</text>
    <text x="890" y="${950 + i * 36}" font-size="11" fill="${TEXT_SECONDARY}" font-family="monospace">${c.region}</text>
    <rect x="1015" y="${940 + i * 36}" width="8" height="8" rx="2" fill="${riskColor(c.riskLevel)}"/>
    <text x="1030" y="${950 + i * 36}" class="risk-tag" fill="${riskColor(c.riskLevel)}">${c.riskLevel.toUpperCase()}</text>
  </g>`).join('')}

  <!-- CTA Banner -->
  <rect x="40" y="1255" width="${W - 80}" height="50" rx="8" fill="url(#headerGrad)" stroke="${ACCENT_BLUE}" stroke-width="1" opacity="0.8"/>
  <text x="${W / 2}" y="1287" text-anchor="middle" class="cta" filter="url(#glow)">🌍 Consulta el mapa interactivo completo en viajeinteligencia.com</text>

  <!-- Footer -->
  <rect x="0" y="${H - 100}" width="${W}" height="100" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  <text x="40" y="${H - 70}" font-size="10" fill="${TEXT_SECONDARY}" font-family="monospace">Fuentes: MAEC • US State Dept • GPI • GTI • HDI • IPC • GDELT • USGS • GDACS • OpenSky</text>
  <text x="40" y="${H - 54}" font-size="10" fill="${TEXT_SECONDARY}" font-family="monospace">viajeinteligencia.com/infografias  |  info@viajeinteligencia.com</text>
  <text x="40" y="${H - 36}" class="signature" font-family="monospace">M. Castillo — Privacy Tools  •  SME en RRSS, OSINT y Estrategia Digital</text>
  <text x="40" y="${H - 20}" font-size="9" fill="#475569" font-family="monospace">OSINT • ML • TRAVEL RISK INTELLIGENCE — Edición #${edition}</text>
  <text x="${W - 40}" y="${H - 20}" text-anchor="end" font-size="9" fill="#475569" font-family="monospace">© 2026 M. Castillo. Todos los derechos reservados.</text>
</svg>`;
}

export function generateInfografiaHTML(data: InfografiaData): string {
  const { stats, gwi, topRiskCountries, topSafeCountries, riskDistribution, edition, weekStart, weekEnd, incidentsThisWeek, countriesChanged } = data;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0e17; font-family: system-ui, sans-serif; color: #f1f5f9; }
    .infografia { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .header { background: linear-gradient(135deg, #1e3a5f, #1e293b); padding: 32px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #3b82f6; }
    .header h1 { font-size: 28px; font-weight: bold; }
    .header .slogan { color: #3b82f6; font-size: 13px; font-style: italic; margin-top: 4px; }
    .header .meta { color: #94a3b8; font-size: 14px; margin-top: 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .card { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; }
    .card h2 { color: #3b82f6; font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }
    .gwi-hero { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
    .gwi-score { font-size: 64px; font-weight: bold; }
    .gwi-trend { font-size: 28px; font-weight: bold; }
    .gwi-bars { display: flex; gap: 16px; flex: 1; }
    .gwi-bar-group { flex: 1; text-align: center; }
    .gwi-bar-group .bar { width: 12px; height: 60px; background: #1e293b; border-radius: 2px; margin: 4px auto; position: relative; overflow: hidden; }
    .gwi-bar-group .bar .fill { position: absolute; bottom: 0; left: 0; width: 100%; border-radius: 2px; }
    .risk-bar { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
    .risk-bar .bar-track { flex: 1; height: 16px; background: #1e293b; border-radius: 4px; overflow: hidden; }
    .risk-bar .bar-fill { height: 100%; border-radius: 4px; }
    .country-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }
    .country-row:last-child { border-bottom: none; }
    .risk-dot { width: 10px; height: 10px; border-radius: 2px; }
    .cta-banner { background: linear-gradient(135deg, #1e3a5f, #1e293b); border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
    .cta-banner a { color: #3b82f6; font-weight: bold; font-size: 16px; text-decoration: none; }
    .footer { text-align: center; padding: 20px; color: #475569; font-size: 12px; border-top: 1px solid #1e293b; margin-top: 24px; }
    .footer .signature { color: #64748b; font-size: 11px; }
    .value-lg { font-size: 32px; font-weight: bold; }
    .text-green { color: ${ACCENT_GREEN}; }
    .text-amber { color: ${ACCENT_AMBER}; }
    .text-red { color: ${ACCENT_RED}; }
    .text-slate { color: ${TEXT_SECONDARY}; }
  </style>
</head>
<body>
  <div class="infografia">
    <div class="header">
      <h1>VIAJE CON INTELIGENCIA — INFORME SEMANAL #${edition}</h1>
      <div class="slogan">"Tu radar de seguridad global impulsado por IA"</div>
      <div class="meta">${weekStart} — ${weekEnd}  •  ${stats.totalPaises} países monitoreados</div>
    </div>

    <div class="card" style="margin-bottom: 16px;">
      <h2>GLOBAL WEEKLY INDEX (GWI)</h2>
      <div class="gwi-hero">
        <div>
          <div class="gwi-score" style="color: ${gwiColor(gwi.total)}">${gwi.total.toFixed(1)}</div>
          <div class="text-slate" style="font-size:12px;text-align:center;">GLOBAL INDEX</div>
        </div>
        <div class="gwi-bars">
          ${[
            { label: 'RISK', v: gwi.riskScore, c: ACCENT_RED },
            { label: 'GPI', v: gwi.gpiScore, c: ACCENT_PURPLE },
            { label: 'GTI', v: gwi.gtiScore, c: ACCENT_AMBER },
            { label: 'INCIDENTS', v: gwi.incidentScore, c: ACCENT_BLUE },
            { label: 'HDI', v: gwi.hdiScore, c: ACCENT_GREEN },
          ].map(s => `<div class="gwi-bar-group"><div class="value-md" style="font-size:18px;font-weight:bold;">${s.v.toFixed(1)}</div><div class="bar"><div class="fill" style="height:${s.v}%;background:${s.c}"></div></div><div class="text-slate" style="font-size:10px;margin-top:4px;">${s.label}</div></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>RIESGO GLOBAL — DISTRIBUCIÓN</h2>
        ${[
          { label: 'Sin riesgo', count: riskDistribution.sinRiesgo, pct: (riskDistribution.sinRiesgo / stats.totalPaises) * 100, c: ACCENT_GREEN },
          { label: 'Bajo', count: riskDistribution.bajo, pct: (riskDistribution.bajo / stats.totalPaises) * 100, c: '#84cc16' },
          { label: 'Medio', count: riskDistribution.medio, pct: (riskDistribution.medio / stats.totalPaises) * 100, c: ACCENT_AMBER },
          { label: 'Alto', count: riskDistribution.alto, pct: (riskDistribution.alto / stats.totalPaises) * 100, c: ACCENT_RED },
          { label: 'Muy alto', count: riskDistribution.muyAlto, pct: (riskDistribution.muyAlto / stats.totalPaises) * 100, c: '#991b1b' },
        ].map(r => `<div class="risk-bar"><span style="width:80px;font-size:13px;">${r.label}</span><div class="bar-track"><div class="bar-fill" style="width:${r.pct}%;background:${r.c}"></div></div><span style="width:40px;text-align:right;font-weight:bold;">${r.count}</span><span style="width:40px;text-align:right;color:#94a3b8;font-size:12px;">${r.pct.toFixed(0)}%</span></div>`).join('')}
      </div>
      <div class="card">
        <h2>MÉTRICAS CLAVE</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px;">
          <div><div class="value-lg" style="color:${ACCENT_RED}">${stats.altoOMuyAlto}</div><div class="text-slate" style="font-size:12px;">Alto/Muy alto riesgo</div></div>
          <div><div class="value-lg" style="color:${ACCENT_GREEN}">${stats.seguroOBajo}</div><div class="text-slate" style="font-size:12px;">Seguro/Bajo riesgo</div></div>
          <div><div class="value-lg" style="color:${ACCENT_AMBER}">${incidentsThisWeek}</div><div class="text-slate" style="font-size:12px;">Incidentes semanales</div></div>
          <div><div class="value-lg" style="color:${ACCENT_BLUE}">${countriesChanged.length}</div><div class="text-slate" style="font-size:12px;">Cambios de riesgo</div></div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h2>TOP 10 — MAYOR RIESGO</h2>
        ${topRiskCountries.slice(0, 10).map((c, i) => `<div class="country-row"><span style="color:#64748b;width:24px;">${String(i + 1).padStart(2, ' ')}</span><span>${c.flag}</span><span style="flex:1;">${c.name}</span><span style="color:#64748b;width:100px;font-size:12px;">${c.region}</span><span class="risk-dot" style="background:${riskColor(c.riskLevel)}"></span><span style="font-size:11px;font-weight:bold;color:${riskColor(c.riskLevel)};width:70px;">${c.riskLevel.toUpperCase()}</span></div>`).join('')}
      </div>
      <div class="card">
        <h2>TOP 10 — MENOR RIESGO</h2>
        ${topSafeCountries.slice(0, 10).map((c, i) => `<div class="country-row"><span style="color:#64748b;width:24px;">${String(i + 1).padStart(2, ' ')}</span><span>${c.flag}</span><span style="flex:1;">${c.name}</span><span style="color:#64748b;width:100px;font-size:12px;">${c.region}</span><span class="risk-dot" style="background:${riskColor(c.riskLevel)}"></span><span style="font-size:11px;font-weight:bold;color:${riskColor(c.riskLevel)};width:70px;">${c.riskLevel.toUpperCase()}</span></div>`).join('')}
      </div>
    </div>

    <div class="cta-banner">
      🌍 <a href="https://viajeinteligencia.com">Consulta el mapa interactivo completo en viajeinteligencia.com</a>
    </div>

    <div class="footer">
      Fuentes: MAEC • US State Dept • GPI • GTI • HDI • IPC • GDELT • USGS • GDACS • OpenSky<br/>
      viajeinteligencia.com/infografias  |  info@viajeinteligencia.com<br/>
      <div class="signature">M. Castillo — Privacy Tools  •  SME en RRSS, OSINT y Estrategia Digital</div>
      © 2026 M. Castillo. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>`;
}
