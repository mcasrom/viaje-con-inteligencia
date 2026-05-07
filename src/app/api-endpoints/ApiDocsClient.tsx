'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Key, Globe, Shield, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/risk/{country}',
    desc: 'Datos de riesgo MAEC para un país',
    params: [
      { name: 'country', type: 'string', req: true, desc: 'ISO 3166-1 alpha-2 (ej: es, fr, th)' },
    ],
    example: `curl -H "X-API-Key: tu-api-key" \\
  https://www.viajeinteligencia.com/api/v1/risk/es`,
    response: `{
  "country": { "code": "es", "name": "España", "flag": "🇪🇸" },
  "risk": {
    "level": "sin-riesgo",
    "label": "Sin riesgo",
    "score": 1,
    "lastUpdated": "Mayo 2026"
  },
  "activeIncidents": [],
  "prediction": {
    "riskScore": 15,
    "probabilityUp7d": 0.02,
    "probabilityUp30d": 0.05
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/tci/{country}',
    desc: 'Travel Cost Index y componentes',
    params: [
      { name: 'country', type: 'string', req: true, desc: 'ISO 3166-1 alpha-2' },
    ],
    example: `curl -H "X-API-Key: tu-api-key" \\
  https://www.viajeinteligencia.com/api/v1/tci/th`,
    response: `{
  "country": { "code": "th", "name": "Tailandia" },
  "tci": { "current": 92.3, "trend": "estable" },
  "components": {
    "demand": 98.2, "oil": 110.5,
    "seasonality": 85.0, "ipc": 95.0, "risk": 100.0
  },
  "conflictImpact": { "isAffected": false }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/incidents',
    desc: 'Incidentes activos en tiempo real',
    params: [
      { name: 'country', type: 'string', req: false, desc: 'Filtrar por código de país' },
      { name: 'type', type: 'string', req: false, desc: 'Filtrar por tipo (conflict, natural_disaster, protest...)' },
      { name: 'severity', type: 'string', req: false, desc: 'Filtrar por severidad (low, medium, high, critical)' },
      { name: 'limit', type: 'number', req: false, desc: 'Máx resultados (default: 20, max: 100)' },
    ],
    example: `curl -H "X-API-Key: tu-api-key" \\
  "https://www.viajeinteligencia.com/api/v1/incidents?country=ve&limit=5"`,
    response: `{
  "total": 1,
  "incidents": [{
    "type": "conflict",
    "title": "Protestas en Caracas",
    "severity": "high",
    "country": "VE",
    "recommendation": "Evitar zonas de protesta"
  }]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/countries',
    desc: 'Listado completo de países con riesgo y TCI',
    params: [
      { name: 'risk', type: 'string', req: false, desc: 'Filtrar por nivel (sin-riesgo, bajo, medio, alto, muy-alto)' },
      { name: 'continent', type: 'string', req: false, desc: 'Filtrar por continente' },
    ],
    example: `curl -H "X-API-Key: tu-api-key" \\
  "https://www.viajeinteligencia.com/api/v1/countries?risk=alto"`,
    response: `{
  "total": 1,
  "countries": [{
    "code": "ve",
    "name": "Venezuela",
    "risk": { "level": "alto", "score": 4 },
    "cost": { "tci": 125.0, "trend": "alcista" }
  }]
}`,
  },
];

const PRICING = [
  { tier: 'Free', price: '0€', requests: '100/mes', features: ['1 API key', 'Risk endpoint', 'Countries list'] },
  { tier: 'Starter', price: '29€', requests: '10,000/mes', features: ['5 API keys', 'Todos endpoints', '90d histórico', 'Email support'] },
  { tier: 'Business', price: '99€', requests: '100,000/mes', features: ['API keys ilimitadas', 'Todos endpoints', '1 año histórico', 'SLA 99.9%', 'Support prioritario'] },
];

export default function ApiDocsClient() {
  const [expanded, setExpanded] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">API Pública v1</h1>
            <p className="text-slate-400">Datos de viaje, riesgo y costes para integraciones B2B</p>
          </div>
        </div>

        {/* Auth section */}
        <div className="mt-10 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Autenticación</h2>
          </div>
          <p className="text-slate-300 text-sm mb-3">
            Todas las peticiones requieren un API Key en el header <code className="bg-slate-700 px-2 py-0.5 rounded text-green-400">X-API-Key</code>.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono">
            <span className="text-slate-500"># Ejemplo con curl</span><br />
            <span className="text-green-400">curl</span> <span className="text-blue-400">-H</span> <span className="text-amber-400">&quot;X-API-Key: tu-api-key&quot;</span> \<br />
            &nbsp;&nbsp;<span className="text-green-400">https://www.viajeinteligencia.com/api/v1/risk/es</span>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">Endpoints</h2>
          <div className="space-y-3">
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === i ? -1 : i)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">{ep.method}</span>
                  <span className="text-white font-mono text-sm flex-1">{ep.path}</span>
                  <span className="text-slate-400 text-xs hidden sm:block">{ep.desc}</span>
                  {expanded === i ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 border-t border-slate-700 space-y-4">
                    <div className="mt-3">
                      <p className="text-slate-400 text-xs mb-2">Parámetros:</p>
                      <div className="space-y-1">
                        {ep.params.map((p, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm">
                            <code className="text-blue-400 bg-slate-700/50 px-2 py-0.5 rounded">{p.name}</code>
                            <span className="text-slate-500 text-xs">{p.type}</span>
                            {p.req && <span className="text-red-400 text-xs">requerido</span>}
                            <span className="text-slate-400 text-xs">{p.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-slate-400 text-xs">Ejemplo:</p>
                        <button
                          onClick={() => copyToClipboard(ep.example, `example-${i}`)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          {copied === `example-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-x-auto">{ep.example}</pre>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-slate-400 text-xs">Respuesta:</p>
                        <button
                          onClick={() => copyToClipboard(ep.response, `resp-${i}`)}
                          className="text-slate-500 hover:text-white transition-colors"
                        >
                          {copied === `resp-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-x-auto">{ep.response}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-white">Planes</h2>
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">Próximamente</span>
          </div>
          <p className="text-slate-500 text-sm mb-6">Los planes de pago aún no están disponibles. Por ahora, todos los endpoints son accesibles gratis con un API Key.</p>
          <div className="grid md:grid-cols-3 gap-4 opacity-60">
            {PRICING.map((p, i) => (
              <div key={i} className={`bg-slate-800 rounded-xl border p-6 ${i === 1 ? 'border-green-500 relative' : 'border-slate-700'}`}>
                {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-slate-900 text-xs font-bold rounded-full">Recomendado</div>}
                <h3 className="text-white font-bold text-lg">{p.tier}</h3>
                <p className="text-3xl font-bold text-white mt-2">{p.price}<span className="text-slate-500 text-sm font-normal">/mes</span></p>
                <p className="text-slate-400 text-sm mt-1">{p.requests}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-green-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button disabled className="w-full mt-6 py-3 bg-slate-700/50 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed">
                  Próximamente
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-blue-300 font-semibold text-sm">¿Quieres integrar nuestros datos?</p>
              <p className="text-slate-400 text-xs mt-1">Contacta en <a href="mailto:info@viajeinteligencia.com" className="text-blue-400 hover:underline">info@viajeinteligencia.com</a> para partners, volúmenes superiores o necesidades personalizadas.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
