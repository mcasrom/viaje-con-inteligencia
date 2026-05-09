'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, TrendingUp, BarChart3, Globe, AlertTriangle, Activity, Zap, Target, Layers, HeartPulse, Plane, DollarSign, Map, Calculator } from 'lucide-react';
import { TOTAL_PAISES } from '@/lib/constants';

const proprietaryIndices = [
  {
    name: 'IRV',
    fullName: 'Índice de Riesgo Viaje',
    icon: Shield,
    range: [40, 100],
    rangeLabel: '40 (peligroso) → 100 (muy seguro)',
    color: 'blue',
    currentValue: 85,
    narrative: 'Mide la seguridad de un destino para viajeros. Se calcula a partir del nivel de riesgo MAEC (sin-riesgo, bajo, medio, alto, muy-alto) y se normaliza a una escala 0-100 donde más alto es mejor.',
    formula: 'IRV = 100 − (nivel × 8), donde nivel: sin-riesgo=1, bajo=2, medio=3, alto=4, muy-alto=5',
    levels: [
      { label: 'Muy seguro', min: 90, color: 'text-green-400', bg: 'bg-green-500' },
      { label: 'Seguro', min: 70, color: 'text-blue-400', bg: 'bg-blue-500' },
      { label: 'Precaución', min: 50, color: 'text-yellow-400', bg: 'bg-yellow-500' },
      { label: 'Riesgo alto', min: 40, color: 'text-red-400', bg: 'bg-red-500' },
    ],
    usedIn: 'Newsletter briefing, alertas de país, Q&A semanal',
    example: 'España (nivel bajo): IRV 84 | Japón (nivel bajo): IRV 84 | Afganistán (nivel muy-alto): IRV 40',
  },
  {
    name: 'TCI',
    fullName: 'Travel Cost Index',
    icon: DollarSign,
    range: [60, 160],
    rangeLabel: '< 85 = buen momento · > 115 = precios altos',
    color: 'emerald',
    currentValue: 100,
    narrative: 'Índice compuesto que predice cuándo es el mejor momento para reservar vuelos. Combina demanda turística, precio del petróleo, estacionalidad, inflación y riesgo MAEC en una sola métrica.',
    formula: 'TCI = (demanda × 0.30) + (petróleo × 0.25) + (estacionalidad × 0.25) + (IPC × 0.10) + (riesgo × 0.10)',
    levels: [
      { label: 'Buen momento', min: 85, color: 'text-green-400', bg: 'bg-green-500' },
      { label: 'Ligeramente bajista', min: 95, color: 'text-emerald-400', bg: 'bg-emerald-500' },
      { label: 'Estable', min: 105, color: 'text-yellow-400', bg: 'bg-yellow-500' },
      { label: 'Alcista', min: 115, color: 'text-orange-400', bg: 'bg-orange-500' },
      { label: 'Caro', min: 120, color: 'text-red-400', bg: 'bg-red-500' },
    ],
    usedIn: 'Coste de viaje, cron diario, predicción de tendencias',
    example: 'TCI 82 = reserva ahora · TCI 100 = sin prisa · TCI 130 = espera o reserva con anticipación',
  },
  {
    name: 'IST',
    fullName: 'Índice de Saturación Turística',
    icon: BarChart3,
    range: [0, 100],
    rangeLabel: '0 (vacío) → 100 (colapsado)',
    color: 'amber',
    currentValue: 45,
    narrative: 'Mide cuánta saturación turística tiene un destino en un momento dado. Combina temporada, precios, eventos globales y día de la semana para predecir si un lugar estará lleno o tranquilo.',
    formula: 'IST = (temporada × 0.35) + (precio × 0.25) + (eventos × 0.20) + (día × 0.20)',
    levels: [
      { label: 'Muy baja', min: 20, color: 'text-green-400', bg: 'bg-green-500' },
      { label: 'Baja', min: 40, color: 'text-emerald-400', bg: 'bg-emerald-500' },
      { label: 'Moderada', min: 60, color: 'text-yellow-400', bg: 'bg-yellow-500' },
      { label: 'Alta', min: 80, color: 'text-orange-400', bg: 'bg-orange-500' },
      { label: 'Extrema', min: 81, color: 'text-red-400', bg: 'bg-red-500' },
    ],
    usedIn: 'API /ist, recomendaciones de fechas',
    example: 'Barcelona en agosto: IST 85 (extrema) · Barcelona en febrero: IST 25 (baja)',
  },
  {
    name: 'RS',
    fullName: 'Recommendation Score (/decidir)',
    icon: Target,
    range: [0, 100],
    rangeLabel: '0 (no recomendado) → 100+ (excelente)',
    color: 'violet',
    currentValue: 75,
    narrative: 'Score multivariable que rankea destinos según tus preferencias. Pondera intereses, presupuesto, visado, seguridad, región y coste de vuelo para darte los 10 mejores destinos personalizados.',
    formula: 'RS = intereses + presupuesto + visado + región + seguridad + TCI',
    levels: [
      { label: 'Excelente', min: 80, color: 'text-green-400', bg: 'bg-green-500' },
      { label: 'Muy bueno', min: 60, color: 'text-blue-400', bg: 'bg-blue-500' },
      { label: 'Bueno', min: 40, color: 'text-yellow-400', bg: 'bg-yellow-500' },
      { label: 'Regular', min: 20, color: 'text-orange-400', bg: 'bg-orange-500' },
      { label: 'Bajo', min: 0, color: 'text-red-400', bg: 'bg-red-500' },
    ],
    usedIn: 'Página /decidir, ranking de destinos',
    example: 'Japón para presupuesto medio + cultura: RS 85 (Excelente) · Noruega para presupuesto bajo: RS 15 (Bajo)',
  },
  {
    name: 'Risk Score',
    fullName: 'Clustering Security Score',
    icon: AlertTriangle,
    range: [0, 80],
    rangeLabel: '0 (muy riesgoso) → 80 (muy seguro)',
    color: 'rose',
    currentValue: 60,
    narrative: 'Score de seguridad usado en el algoritmo de clustering K-Means. Transforma los niveles MAEC a una escala 0-80 para ser usado como feature ponderada (peso: 2x) en la agrupación de destinos similares.',
    formula: 'Risk Score = 100 − (nivel × 20), donde nivel: sin-riesgo=1 → 80, muy-alto=5 → 0',
    levels: [
      { label: 'Muy seguro', min: 60, color: 'text-green-400', bg: 'bg-green-500' },
      { label: 'Seguro', min: 40, color: 'text-blue-400', bg: 'bg-blue-500' },
      { label: 'Riesgoso', min: 20, color: 'text-orange-400', bg: 'bg-orange-500' },
      { label: 'Muy riesgoso', min: 0, color: 'text-red-400', bg: 'bg-red-500' },
    ],
    usedIn: 'Clustering K-Means, agrupación de destinos',
    example: 'España: Risk Score 60 | Turquía: Risk Score 40 | Siria: Risk Score 0',
  },
];

const externalIndices = [
  {
    name: 'GPI',
    fullName: 'Global Peace Index',
    icon: Globe,
    range: '1.095 – 3.929',
    rangeLabel: 'Menor = más pacífico',
    source: 'Institute for Economics & Peace',
    narrative: 'Mide el nivel de paz en 163 países usando 23 indicadores: seguridad social, conflicto interno y militarización. Referencia global para evaluar estabilidad.',
    url: '/kpi',
  },
  {
    name: 'GTI',
    fullName: 'Global Terrorism Index',
    icon: AlertTriangle,
    range: '1.0 – 6.8',
    rangeLabel: 'Menor = menos impacto terrorista',
    source: 'Institute for Economics & Peace',
    narrative: 'Mide el impacto del terrorismo en cada país basado en incidentes, muertes, heridos y daños. Esencial para evaluar riesgos de seguridad.',
  },
  {
    name: 'HDI',
    fullName: 'Human Development Index',
    icon: HeartPulse,
    range: '0.645 – 0.962',
    rangeLabel: 'Mayor = más desarrollo humano',
    source: 'Programa de Naciones Unidas (PNUD)',
    narrative: 'Combina esperanza de vida, educación e ingresos per cápita. Un HDI alto indica infraestructura, salud y estabilidad para el viajero.',
  },
  {
    name: 'IPC',
    fullName: 'Índice de Precios al Consumo',
    icon: TrendingUp,
    range: '0.5% – 130%',
    rangeLabel: 'Inflación anual por país',
    source: 'Datos oficiales nacionales',
    narrative: 'Mide la inflación de cada país. Alta inflación = costos impredecibles para el viajero. Se integra como componente del TCI (peso: 10%).',
  },
  {
    name: 'WHO Health',
    fullName: 'WHO Health Risk Indicators',
    icon: HeartPulse,
    range: 'bajo / medio / alto',
    rangeLabel: 'Riesgo sanitario por país',
    source: 'Organización Mundial de la Salud',
    narrative: 'Evalúa tuberculosis, VIH, vacunación, gasto en salud, doctores y camas hospitalarias. Factor crítico para viajeros con condiciones médicas.',
  },
];

const algorithmMetrics = [
  {
    name: 'GDELT Tone',
    fullName: 'Sentimiento de noticias',
    icon: Activity,
    range: '-10 a +10',
    rangeLabel: 'Negativo → Positivo',
    narrative: 'Score de sentimiento del proyecto GDELT que analiza el tono de noticias globales. Se usa para ajustar urgencia de señales OSINT: tono < -5 sube 1 nivel, < -10 sube 2 niveles.',
    color: 'cyan',
  },
  {
    name: 'Conflict Surcharge',
    fullName: 'Sobrecargo por conflicto aéreo',
    icon: Plane,
    range: '2.5% – 35%',
    rangeLabel: 'Recargo sobre precio base',
    narrative: 'Calcula el sobrecosto de vuelos por cierres de espacio aéreo. Considera desvío en km, horas extra de vuelo y severidad del conflicto. Impacta directamente el TCI de rutas afectadas.',
    color: 'red',
  },
  {
    name: 'RSI Oil',
    fullName: 'Relative Strength Index (Petróleo)',
    icon: Zap,
    range: '5 – 95',
    rangeLabel: 'Sobreventa → Sobrecompra',
    narrative: 'Indicador de momentum para el precio del petróleo. Se calcula con regresión lineal y se mapea a una escala RSI. < 30 = petróleo barato (buen momento para volar), > 70 = caro.',
    color: 'amber',
  },
  {
    name: 'K-Means Clustering',
    fullName: 'Agrupación de destinos',
    icon: Layers,
    range: '3 – 8 clusters',
    rangeLabel: 'Grupos de destinos similares',
    narrative: 'Algoritmo que agrupa países por similitud en: seguridad, inflación, distancia desde España y llegadas turísticas. Genera etiquetas como "Europa occidental", "Destinos premium", "Emergentes".',
    color: 'purple',
  },
  {
    name: 'Event Impact',
    fullName: 'Impacto de eventos globales',
    icon: Map,
    range: '0 – 35 puntos',
    rangeLabel: 'Sin impacto → Impacto extremo',
    narrative: 'Mide cómo eventos como Olimpiadas, MWC, Oktoberfest o festivales afectan la saturación turística. Se integra en el IST como componente de eventos (peso: 20%).',
    color: 'pink',
  },
];

function GaugeBar({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  const percentage = ((value - min) / (max - min)) * 100;
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${colors[color] || 'bg-blue-500'} transition-all duration-700`} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
    </div>
  );
}

function LevelIndicator({ levels, currentValue }: { levels: { label: string; min: number; color: string; bg: string }[]; currentValue: number }) {
  const currentLevel = levels.find(l => currentValue >= l.min) || levels[levels.length - 1];
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {levels.map((level) => (
        <span key={level.label} className={`text-xs px-2 py-1 rounded-full ${currentValue >= level.min ? `${level.bg}/20 ${level.color} ring-1 ring-current` : 'text-slate-500'}`}>
          {level.label}
        </span>
      ))}
    </div>
  );
}

function ProprietaryCard({ index }: { index: typeof proprietaryIndices[0] }) {
  const Icon = index.icon;
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{index.name}</span>
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Propietario</span>
            </div>
            <div className="text-sm text-slate-400">{index.fullName}</div>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">{index.narrative}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Rango: {index.rangeLabel}</span>
            <span className="text-white font-mono">Ejemplo: {index.currentValue}</span>
          </div>
          <GaugeBar value={index.currentValue} min={index.range[0]} max={index.range[1]} color={index.color} />
          <LevelIndicator levels={index.levels} currentValue={index.currentValue} />
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
          <div className="text-xs text-slate-500 mb-1">Fórmula</div>
          <code className="text-xs text-blue-300 font-mono">{index.formula}</code>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
          <div className="text-xs text-slate-500 mb-1">Ejemplo</div>
          <div className="text-xs text-slate-300">{index.example}</div>
        </div>

        <div className="text-xs text-slate-500">
          Se usa en: <span className="text-slate-400">{index.usedIn}</span>
        </div>
      </div>
    </div>
  );
}

function ExternalCard({ index }: { index: typeof externalIndices[0] }) {
  const Icon = index.icon;
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{index.name}</span>
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">Externo</span>
            </div>
            <div className="text-sm text-slate-400">{index.fullName}</div>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">{index.narrative}</p>

        <div className="flex items-center gap-4 text-xs mb-3">
          <div className="bg-slate-900/50 rounded-lg px-3 py-2">
            <div className="text-slate-500">Rango</div>
            <div className="text-white font-mono">{index.range}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-3 py-2">
            <div className="text-slate-500">Fuente</div>
            <div className="text-white">{index.source}</div>
          </div>
        </div>

        {index.url && (
          <Link href={index.url} className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
            Ver datos completos →
          </Link>
        )}
      </div>
    </div>
  );
}

function AlgorithmCard({ metric }: { metric: typeof algorithmMetrics[0] }) {
  const Icon = metric.icon;
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">{metric.name}</div>
            <div className="text-sm text-slate-400">{metric.fullName}</div>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-4">{metric.narrative}</p>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-900/50 rounded-lg px-3 py-2">
            <div className="text-slate-500">Rango</div>
            <div className="text-white font-mono">{metric.range}</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg px-3 py-2">
            <div className="text-slate-500">Interpretación</div>
            <div className="text-white">{metric.rangeLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IndicesClient() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Índices y Métricas</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Transparencia total: todos los índices, KPIs y algoritmos que usamos para analizar {TOTAL_PAISES} países
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-xl p-6 mb-12 border border-blue-500/20">
          <h2 className="text-xl font-bold mb-3">¿Por qué importan estos índices?</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Cada índice responde una pregunta diferente que todo viajero inteligente debería hacerse antes de decidir:
          </p>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300"><strong className="text-white">IRV:</strong> ¿Es seguro este destino ahora?</span>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300"><strong className="text-white">TCI:</strong> ¿Es buen momento para reservar?</span>
            </div>
            <div className="flex items-start gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300"><strong className="text-white">IST:</strong> ¿Estará saturado de turistas?</span>
            </div>
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300"><strong className="text-white">RS:</strong> ¿Es el destino ideal para mí?</span>
            </div>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-blue-500" />
            <h2 className="text-2xl font-bold">Índices Propietarios</h2>
            <span className="text-sm text-slate-500">({proprietaryIndices.length} métricas creadas por Viaje con Inteligencia)</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {proprietaryIndices.map(index => (
              <ProprietaryCard key={index.name} index={index} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-emerald-500" />
            <h2 className="text-2xl font-bold">Índices Externos</h2>
            <span className="text-sm text-slate-500">({externalIndices.length} fuentes oficiales integradas)</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {externalIndices.map(index => (
              <ExternalCard key={index.name} index={index} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-0.5 bg-cyan-500" />
            <h2 className="text-2xl font-bold">Algoritmos y Métricas de Análisis</h2>
            <span className="text-sm text-slate-500">({algorithmMetrics.length} modelos de procesamiento)</span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {algorithmMetrics.map(metric => (
              <AlgorithmCard key={metric.name} metric={metric} />
            ))}
          </div>
        </section>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Cómo se combinan los índices
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Ningún índice actúa solo. Nuestro sistema combina múltiples fuentes para dar una visión completa:
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="font-medium text-white mb-2">1. Recopilación</div>
              <p className="text-slate-400">MAEC, GDELT, USGS, GDACS, RSS, INE, WHO, IEP — 7 fuentes automáticas cada día.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="font-medium text-white mb-2">2. Procesamiento</div>
              <p className="text-slate-400">Clasificación por keywords, Groq para Reddit, tone GDELT, regresión lineal para tendencias.</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="font-medium text-white mb-2">3. Síntesis</div>
              <p className="text-slate-400">IRV, TCI, IST y RS se calculan y se usan en newsletter, /decidir, clustering y alertas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
