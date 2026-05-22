'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Key, Globe, Shield, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/risk/{country}/history',
    desc: 'Histórico de riesgo por país (30-90 días)',
    params: [
      { name: 'country', type: 'string', req: true, desc: 'ISO 3166-1 alpha-2' },
      { name: 'days', type: 'number', req: false, desc: 'Ventana en días (default: 30, max: 90)' },
    ],
    example: `curl -H "X-API-Key: tu-api-key" \\
  https://www.viajeinteligencia.com/api/v1/risk/ao/history?days=30`,
    response: `{
  "country": { "code": "AO", "name": "Angola" },
  "currentRisk": { "level": "medio", "label": "Medio" },
  "trend": "estable",
  "averageScore": 3.0,
  "history": [
    { "date": "2026-04-22", "level": "medio", "label": "Medio", "score": 3 },
    { "date": "2026-04-23", "level": "medio", "label": "Medio", "score": 3 }
  ],
  "period": "30 días",
  "totalRecords": 30
}`,
  },
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
  { tier: 'Free', price: '0€', requests: '100/mes', features: ['1 API key', 'Risk endpoint', 'Risk history (30d)', 'TCI endpoint', 'Incidents endpoint', 'Countries list'] },
  { tier: 'Pro', price: '4.99€', requests: '10,000/mes', features: ['5 API keys', 'Todos los endpoints', '90 días histórico', 'Email support', 'Alertas en tiempo real'] },
];

export default function ApiDocsClient() {
  const [expanded, setExpanded] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [proActivated, setProActivated] = useState(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('pro') === 'true'
  );

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
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {proActivated && (
          <div className="mb-8 bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-white mb-1">¡API Pro activada!</h2>
            <p className="text-slate-300 text-sm">
              Te hemos enviado tu API Key por email a la dirección que usaste en el pago.
              Revisa tu bandeja de entrada (y spam).
            </p>
            <button
              onClick={() => setProActivated(false)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-400 underline underline-offset-2"
            >
              Cerrar
            </button>
          </div>
        )}

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

        {/* Get your free key */}
        <div className="mt-10 bg-slate-800 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Consigue tu API Key gratis</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">Introduce tu email y recibe al instante una API Key gratuita (100 requests/mes). Sin registro, sin tarjeta.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('email') as HTMLInputElement;
            const btn = form.querySelector('button') as HTMLButtonElement;
            const msg = form.querySelector('.msg') as HTMLElement;
            btn.disabled = true;
            btn.textContent = 'Generando...';
            try {
              const res = await fetch('/api/v1/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: input.value }),
              });
              const data = await res.json();
              if (data.key) {
                msg.innerHTML = `<div class="bg-slate-900 rounded-lg p-4 mt-3">
                  <p class="text-green-400 text-sm font-bold mb-2">✅ Tu API Key:</p>
                  <code class="text-amber-400 text-sm break-all">${data.key}</code>
                  <p class="text-slate-500 text-xs mt-2">Guárdala. Solo la verás una vez.</p>
                  <p class="text-slate-400 text-xs mt-2 font-mono">${data.usage}</p>
                </div>`;
                input.value = '';
              } else {
                msg.innerHTML = `<p class="text-red-400 text-sm mt-2">${data.error || 'Error'}</p>`;
              }
            } catch {
              msg.innerHTML = '<p class="text-red-400 text-sm mt-2">Error de conexión</p>';
            }
            btn.disabled = false;
            btn.textContent = 'Obtener API Key';
          }}>
            <div className="flex gap-3">
              <input
                type="email"
                name="email"
                required
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder:text-slate-500"
              />
              <button type="submit" className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm whitespace-nowrap">
                Obtener API Key
              </button>
            </div>
            <div className="msg"></div>
          </form>
        </div>

        {/* Pricing */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-white">Planes</h2>
            <a href="/precio-api" className="text-xs text-blue-400 hover:underline">Ver detalles →</a>
          </div>
          <div className="grid md:grid-cols-2 max-w-2xl gap-4">
            {PRICING.map((p, i) => (
              <div key={i} className={`bg-slate-800 rounded-xl border p-6 ${i === 1 ? 'border-blue-500 relative' : 'border-slate-700'}`}>
                {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">Recomendado</div>}
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
                {i === 0 ? (
                  <a href="/api-endpoints" className="mt-6 block w-full text-center py-3 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">
                    Empezar gratis
                  </a>
                ) : (
                  <a href="/precio-api" className="mt-6 block w-full text-center py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                    Ver plan Pro
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-blue-300 font-semibold text-sm">¿Quieres integrar los datos de riesgo en tu app?</p>
              <p className="text-slate-400 text-xs mt-1">Contacta en <a href="mailto:info@viajeinteligencia.com" className="text-blue-400 hover:underline">info@viajeinteligencia.com</a> para partners, volúmenes superiores o necesidades personalizadas.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
