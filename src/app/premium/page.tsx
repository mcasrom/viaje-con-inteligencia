'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Bell, FileCheck, Map, TrendingUp, Star, Check, CreditCard, Globe, Zap, AlertTriangle, MessageSquare, Plane, Wallet, FileText, Calculator, Briefcase } from 'lucide-react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Premium Mensual',
    price: '4.99',
    period: 'mes',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
    features: [
      'Todo lo del plan gratis',
      'Bot IA Groq (viajes, riesgos)',
      'Planificador de viajes IA',
      'Alertas tiempo real',
      'Mapa de seismos en vivo',
      'Monitoreo de conflictos',
      'Checklist completo',
      'Análisis de gastos',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium Anual',
    price: '19.99',
    period: 'año',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
    popular: true,
    savings: 'Ahorra 40€',
    features: [
      'Todo lo del plan Premium Mensual',
      'Acceso prioritario a nuevas funciones',
      'Soporte prioritario',
      'Análisis de riesgo avanzado con IA',
      'Alertas personalizadas por país',
      'Histórico de eventos y tendencias',
    ],
  },
];

export default function PremiumPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'chat' | 'seismos' | 'conflicts' | 'expenses' | 'visa' | 'packing'>('seismos');
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [seismos, setSeismos] = useState<any[]>([]);
  const [seismosLoading, setSeismosLoading] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expensesResult, setExpensesResult] = useState<string>('');
  const [expensesData, setExpensesData] = useState({ destination: '', days: '7', budget: 'moderado', category: 'turista' });
  const [visaCountry, setVisaCountry] = useState('');
  const [visaResult, setVisaResult] = useState<any>(null);
  const [visaLoading, setVisaLoading] = useState(false);
  const [packingDestination, setPackingDestination] = useState('');
  const [packingDays, setPackingDays] = useState('7');
  const [packingType, setPackingType] = useState('viaje');
  const [packingResult, setPackingResult] = useState<string>('');
  const [packingLoading, setPackingLoading] = useState(false);

  useEffect(() => {
    loadSeismos();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);
    setError(null);

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.setup_needed) {
        setError('Stripe no configurado. Añade las variables STRIPE_* en Vercel.');
      } else {
        setError(data.error || 'Error al procesar suscripción');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateExpenses = async () => {
    const destination = expensesData.destination;
    if (!destination) {
      setExpensesResult('Por favor, introduce un destino.');
      return;
    }

    setExpensesLoading(true);
    setExpensesResult('Analizando presupuesto...');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analiza el presupuesto estimado para un viaje de ${expensesData.days} días a ${destination} para un viajero ${expensesData.category}. Budget: ${expensesData.budget}. Proporciona un desglose detallado por categorías: alojamiento, transporte, comida, actividades, seguros, misceláneos. Incluye consejos para ahorrar.`,
          history: [],
        }),
      });

      const data = await response.json();
      setExpensesResult(data.response || data.error || 'Error al analizar');
    } catch (err) {
      setExpensesResult('Error de conexión. Asegúrate de tener GROQ_API_KEY configurada.');
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    const destination = (document.getElementById('destination') as HTMLInputElement)?.value;
    const days = (document.getElementById('days') as HTMLInputElement)?.value || '7';
    const interests = (document.getElementById('interests') as HTMLInputElement)?.value || '';

    if (!destination) {
      setItineraryResult('Por favor, introduce un destino.');
      return;
    }

    setItineraryLoading(true);
    setItineraryResult('Generando itinerario...');

    try {
      const response = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days: parseInt(days),
          interests: interests.split(',').map(i => i.trim()),
        }),
      });

      const data = await response.json();
      setItineraryResult(data.itinerary || data.error || 'Error al generar');
    } catch (err) {
      setItineraryResult('Error de conexión. Asegúrate de tener GROQ_API_KEY configurada.');
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages.map(m => m.content),
        }),
      });

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const loadSeismos = async () => {
    setSeismosLoading(true);
    try {
      const response = await fetch('/api/earthquakes?timeframe=week&minMagnitude=4&limit=20');
      const data = await response.json();
      setSeismos(data.earthquakes || []);
    } catch (err) {
      setSeismos([]);
    } finally {
      setSeismosLoading(false);
    }
  };

  const loadConflicts = async () => {
    setConflictsLoading(true);
    try {
      const response = await fetch('/api/conflicts?maxrecords=15');
      const data = await response.json();
      setConflicts(data.conflicts || []);
    } catch (err) {
      setConflicts([]);
    } finally {
      setConflictsLoading(false);
    }
  };

  const checkVisa = async () => {
    if (!visaCountry.trim()) return;
    setVisaLoading(true);
    setVisaResult(null);
    try {
      const response = await fetch(`/api/visa-check?country=${encodeURIComponent(visaCountry)}`);
      const data = await response.json();
      setVisaResult(data);
    } catch (err) {
      setVisaResult({ error: 'Error al verificar visa' });
    } finally {
      setVisaLoading(false);
    }
  };

  const generatePackingList = async () => {
    if (!packingDestination.trim()) return;
    setPackingLoading(true);
    setPackingResult('');
    try {
      const response = await fetch('/api/packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: packingDestination, days: parseInt(packingDays), type: packingType }),
      });
      const data = await response.json();
      setPackingResult(data.list || data.error);
    } catch (err) {
      setPackingResult('Error al generar lista');
    } finally {
      setPackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-medium">Premium</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Viaja más inteligente con <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Premium</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            IA Groq para planificar viajes, mapa de seismos en tiempo real, alertas de conflictos y más
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-8">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-slate-800 rounded-2xl p-6 border-2 mb-4 ${
                  plan.popular ? 'border-yellow-500 relative' : 'border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-slate-900 text-sm font-bold rounded-full">
                    Popular
                  </div>
                )}

                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}€</span>
                    <span className="text-slate-400">/{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-400 text-sm mt-1">{plan.savings}</p>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loading !== null}
                  className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 hover:from-yellow-400 hover:to-orange-400'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  } disabled:opacity-50`}
                >
                  {loading === plan.priceId ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Suscribirse
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                <button
                  onClick={() => { setActiveTab('seismos'); loadSeismos(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'seismos'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Sismos
                </button>
                <button
                  onClick={() => { setActiveTab('conflicts'); loadConflicts(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'conflicts'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Conflictos
                </button>
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'itinerary'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  Planificador IA
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat IA
                </button>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'expenses'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Análisis Gastos
                </button>
                <button
                  onClick={() => setActiveTab('visa')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'visa'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Visa Checker
                </button>
                <button
                  onClick={() => setActiveTab('packing')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'packing'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Lista Equipaje
                </button>
              </div>

              {activeTab === 'seismos' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Terremotos Recientes (USGS)
                    </h3>
                    <button
                      onClick={loadSeismos}
                      disabled={seismosLoading}
                      className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-500 disabled:opacity-50"
                    >
                      {seismosLoading ? 'Cargando...' : 'Actualizar'}
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Datos en tiempo real del USGS (Servicio Geológico de EE.UU.) - Últimos 7 días, magnitud 4+
                  </p>
                  {seismos.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {seismos.map((eq: any) => (
                        <div key={eq.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            eq.magnitude >= 6 ? 'bg-red-600 text-white' :
                            eq.magnitude >= 5 ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {eq.magnitude}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{eq.place}</p>
                            <p className="text-slate-400 text-xs">
                              {new Date(eq.time).toLocaleDateString('es-ES')} • Profundidad: {eq.depth?.toFixed(0)}km
                            </p>
                          </div>
                          {eq.tsunami === 1 && (
                            <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">Tsunami</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p>Haz clic en "Actualizar" para cargar datos</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'conflicts' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Monitor de Conflictos Activos
                  </h3>
                  <div className="mb-4">
                    <button
                      onClick={loadConflicts}
                      disabled={conflictsLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {conflictsLoading ? 'Cargando...' : 'Actualizar'}
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Datos en tiempo real de NewsMCP - Últimas noticias geopolíticas
                  </p>
                  {conflicts.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {conflicts.map((conflict: any, idx: number) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-white text-sm font-medium">{conflict.title}</p>
                          <p className="text-slate-400 text-xs mt-1">
                            {new Date(conflict.date).toLocaleDateString('es-ES')} • {conflict.domain}
                          </p>
                          <a 
                            href={conflict.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 text-xs hover:underline mt-1 block"
                          >
                            Ver fuente →
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <p>Haz clic en "Actualizar" para cargar datos</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-500" />
                    Generador de Itinerarios con IA
                  </h3>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Destino</label>
                      <input
                        id="destination"
                        type="text"
                        placeholder="Ej: Japón, España, Thailandia..."
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 text-sm mb-1">Días</label>
                        <input
                          id="days"
                          type="number"
                          defaultValue="7"
                          min="1"
                          max="30"
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-sm mb-1">Presupuesto</label>
                        <select
                          id="budget"
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="bajo">Económico</option>
                          <option value="moderado">Moderado</option>
                          <option value="alto">Lujo</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Intereses (separados por comas)</label>
                      <input
                        id="interests"
                        type="text"
                        placeholder="Ej: gastronomía, cultura, aventura"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateItinerary}
                    disabled={itineraryLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {itineraryLoading ? (
                      <>
                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Bot className="w-5 h-5" />
                        Generar Itinerario con IA
                      </>
                    )}
                  </button>
                  {itineraryResult && (
                    <div className="mt-4 bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
                        {itineraryResult}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    Asistente de Viajes IA
                  </h3>
                  <div className="bg-slate-700/50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-slate-400 text-center">
                        Pregunta sobre viajes, países, seguridad, visados...
                      </p>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`mb-3 ${
                            msg.role === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-600 text-slate-100'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="text-left">
                        <div className="inline-block px-4 py-2 rounded-lg bg-slate-600 text-slate-400">
                          Escribiendo...
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                      placeholder="Ej: ¿Es seguro viajar a Japón ahora?"
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={chatLoading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-500" />
                    Análisis de Gastos con IA
                  </h3>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Destino</label>
                      <input
                        type="text"
                        value={expensesData.destination}
                        onChange={(e) => setExpensesData({ ...expensesData, destination: e.target.value })}
                        placeholder="Ej: Japón, España, Thailandia..."
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 text-sm mb-1">Días</label>
                        <input
                          type="number"
                          value={expensesData.days}
                          onChange={(e) => setExpensesData({ ...expensesData, days: e.target.value })}
                          min="1"
                          max="90"
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-sm mb-1">Perfil</label>
                        <select
                          value={expensesData.category}
                          onChange={(e) => setExpensesData({ ...expensesData, category: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        >
                          <option value="mochilero">Mochilero</option>
                          <option value="turista">Turista</option>
                          <option value="lujo">Lujo</option>
                          <option value="familia">Familia</option>
                          <option value="negocios">Negocios</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm mb-1">Presupuesto</label>
                      <select
                        value={expensesData.budget}
                        onChange={(e) => setExpensesData({ ...expensesData, budget: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                      >
                        <option value="bajo">Económico (menos de 50€/día)</option>
                        <option value="moderado">Moderado (50-150€/día)</option>
                        <option value="alto">Alto (150-300€/día)</option>
                        <option value="lujo">Lujo (300+/día)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateExpenses}
                    disabled={expensesLoading}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {expensesLoading ? (
                      <>
                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Analizar Presupuesto
                      </>
                    )}
                  </button>
                  {expensesResult && (
                    <div className="mt-4 bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
                        {expensesResult}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <Globe className="w-8 h-8 text-orange-500 mb-3" />
            <h4 className="font-bold text-white mb-1">Sismos en Tiempo Real</h4>
            <p className="text-slate-400 text-sm">Datos del USGS con actualización continua</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <Bot className="w-8 h-8 text-blue-500 mb-3" />
            <h4 className="font-bold text-white mb-1">IA Groq Gratuita</h4>
            <p className="text-slate-400 text-sm">Planificador y chat con modelos abiertos</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
            <h4 className="font-bold text-white mb-1">Monitoreo Conflictos</h4>
            <p className="text-slate-400 text-sm">Alertas de zonas de tensión mundial</p>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-800/30 rounded-xl p-6 text-center">
          <p className="text-slate-300">
            <strong className="text-blue-400">Pago seguro con Stripe</strong> • Cancela cuando quieras • Sin compromiso
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            ¿Ya tienes cuenta? <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Acceder a mi cuenta</Link>
          </p>
        </div>

        {activeTab === 'visa' && (
          <div className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-500" />
              🛂 Check Visa - ¿Necesito visa?
            </h3>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={visaCountry}
                onChange={(e) => setVisaCountry(e.target.value)}
                placeholder="Escribe un país (ej: Japón,泰国, 日本)"
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && checkVisa()}
              />
              <button
                onClick={checkVisa}
                disabled={visaLoading || !visaCountry.trim()}
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-500 disabled:opacity-50"
              >
                {visaLoading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
            {visaResult && (
              <div className={`p-4 rounded-lg ${visaResult.error ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                {visaResult.error ? (
                  <p className="text-red-300">{visaResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-white font-bold text-lg">{visaResult.country}</p>
                    <p className="text-slate-300">{visaResult.visa_required ? '⚠️ Visa requerida' : '✅ Sin visa (para españoles)'}</p>
                    {visaResult.details && <p className="text-slate-400 text-sm">{visaResult.details}</p>}
                    {visaResult.duration && <p className="text-cyan-400">Duración máxima: {visaResult.duration}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'packing' && (
          <div className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-teal-500" />
              🧳 Generador de Lista de Equipaje
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Destino</label>
                <input
                  type="text"
                  value={packingDestination}
                  onChange={(e) => setPackingDestination(e.target.value)}
                  placeholder="Ej: Japón, Tailandia..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Días</label>
                <input
                  type="number"
                  value={packingDays}
                  onChange={(e) => setPackingDays(e.target.value)}
                  min="1"
                  max="365"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Tipo de viaje</label>
                <select
                  value={packingType}
                  onChange={(e) => setPackingType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="viaje">Turismo</option>
                  <option value="negocios">Negocios</option>
                  <option value="mochilero">Mochilero</option>
                  <option value="playa">Playa</option>
                  <option value="montaña">Montaña</option>
                </select>
              </div>
            </div>
            <button
              onClick={generatePackingList}
              disabled={packingLoading || !packingDestination.trim()}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-bold hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {packingLoading ? (
                <>
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                  Generando...
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  Generar Lista
                </>
              )}
            </button>
            {packingResult && (
              <div className="mt-4 bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">{packingResult}</pre>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia
          </p>
        </div>
      </footer>
    </div>
  );
}
