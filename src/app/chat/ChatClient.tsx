'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Bot, Sparkles, Crown, Zap, AlertTriangle, Lock, Plus, MessageSquare, Trash2, History, Share2, Check, Copy, Globe, Download, UserPlus, MapPin, Calendar, DollarSign, AlertCircle, Utensils, Camera, Mountain, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import remarkGfm from 'remark-gfm';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import { useSubscription } from '@/hooks/useSubscription';

const FREE_TRIAL_MAX = 3;
const FREE_TRIAL_KEY = 'viajeinteligencia_chat_trial';

function getFreeTrialCount(): number {
  if (typeof window === 'undefined') return 0;
  try { return parseInt(localStorage.getItem(FREE_TRIAL_KEY) || '0', 10); } catch { return 0; }
}

function incrementFreeTrial(): number {
  const next = getFreeTrialCount() + 1;
  try { localStorage.setItem(FREE_TRIAL_KEY, String(next)); } catch {}
  return next;
}

const SUGGESTIONS = [
  { icon: '🌍', text: '¿Es seguro viajar a Japon?' },
  { icon: '📋', text: '¿Necesito visado para Brasil?' },
  { icon: '💰', text: 'Presupuesto para 7 dias en Tailandia' },
  { icon: '🏔️', text: 'Mejores destinos de montaña en Europa' },
];

const FREE_MODEL = 'llama-3.1-8b-instant';
const PREMIUM_MODEL = 'llama-3.3-70b-versatile';

interface Conversation {
  id: number;
  title: string;
  model: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export default function ChatClient() {
  const sub = useSubscription();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<'free' | 'premium'>('free');
  const [premiumBlocked, setPremiumBlocked] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [freeTrialCount, setFreeTrialCount] = useState(getFreeTrialCount());
  const [sharingMsg, setSharingMsg] = useState<number | null>(null);
  const [shareForm, setShareForm] = useState({ name: '', destination: '', days: '7' });
  const [shareLoading, setShareLoading] = useState(false);
  const [shareResult, setShareResult] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [itineraryExportIdx, setItineraryExportIdx] = useState<number | null>(null);
  const [itineraryShareIdx, setItineraryShareIdx] = useState<number | null>(null);
  const [itineraryShareResult, setItineraryShareResult] = useState<string | null>(null);
  const [itineraryShareLoading, setItineraryShareLoading] = useState(false);
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [itineraryForm, setItineraryForm] = useState({
    destination: '',
    days: '7',
    interests: [] as string[],
    budget: 'moderado',
  });
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canUsePremium = sub.premium;
  const isAnonymous = sub.status === 'no_session';
  const trialExhausted = isAnonymous && freeTrialCount >= FREE_TRIAL_MAX;

  useEffect(() => {
    if (sub.premium) {
      setModel('premium');
    }
  }, [sub.premium]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadConversations();
    loadDailyUsage();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/ai/chat?conversations=true');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {}
  };

  const loadDailyUsage = async () => {
    try {
      const res = await fetch('/api/subscription/check');
      const data = await res.json();
      if (data.dailyCount !== undefined) setDailyCount(data.dailyCount);
    } catch {}
  };

  const loadConversation = async (convId: number) => {
    setActiveConversationId(convId);
    setShowSidebar(false);
    try {
      const res = await fetch(`/api/ai/chat?conversationId=${convId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {}
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setShowSidebar(false);
  };

  const deleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/chat?conversationId=${convId}&delete=true`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch {}
  };

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    if (isAnonymous && freeTrialCount >= FREE_TRIAL_MAX) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setLoading(true);
    setPremiumBlocked(false);

    if (isAnonymous) {
      incrementFreeTrial();
      setFreeTrialCount(prev => prev + 1);
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          model: model === 'premium' && canUsePremium ? PREMIUM_MODEL : FREE_MODEL,
          conversationId: activeConversationId,
          stream: true,
        }),
      });

      // Handle streaming response
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/plain') && response.body) {
        // Streaming
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let newConvId: number | null = null;

        // Add placeholder assistant message
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const metaMatch = chunk.match(/__META__:({.*})/);
          if (metaMatch) {
            try {
              const meta = JSON.parse(metaMatch[1]);
              newConvId = meta.conversationId;
            } catch {}
            continue;
          }

          accumulated += chunk;
          // Update the last message progressively
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
            }
            return updated;
          });
        }

        if (newConvId && newConvId !== activeConversationId) {
          setActiveConversationId(newConvId);
          loadConversations();
        }
      } else {
        // Non-streaming fallback
        const data = await response.json();

        if (response.status === 403 && data.requires === 'premium') {
          setPremiumBlocked(true);
          setMessages(prev => [...prev, { role: 'assistant', content: `🔒 **${data.message}**` }]);
        } else if (response.status === 429) {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **${data.message}**` }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Lo siento, no pude procesar tu solicitud.' }]);
          if (data.conversationId && data.conversationId !== activeConversationId) {
            setActiveConversationId(data.conversationId);
            loadConversations();
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexion. Verifica tu conexion e intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, model, canUsePremium, activeConversationId, isAnonymous, freeTrialCount]);

  const handleShare = async (msgIndex: number, content: string) => {
    setShareLoading(true);
    setShareResult(null);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shareForm.name,
          destination: shareForm.destination,
          days: parseInt(shareForm.days) || 7,
          itinerary_raw: content,
          is_public: true,
          status: 'draft',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setShareResult(`error:${err.error || 'Error al guardar'}`);
        return;
      }
      const data = await res.json();
      const link = `${window.location.origin}/viajes/destacados/${data.trip.slug}`;
      setShareResult(link);
    } catch {
      setShareResult('error:Error de conexión');
    } finally {
      setShareLoading(false);
    }
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    const text = messages.map(m =>
      `**${m.role === 'user' ? 'Tú' : 'ViajeIA'}**\n${m.content}\n`
    ).join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viajeia-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateItinerary = async () => {
    if (!itineraryForm.destination.trim() || itineraryLoading) return;
    setItineraryLoading(true);
    setShowItineraryForm(false);

    const msgText = `Genera un itinerario de ${itineraryForm.days} días en ${itineraryForm.destination}`;
    setMessages(prev => [...prev, { role: 'user', content: msgText }]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          model: model === 'premium' && canUsePremium ? PREMIUM_MODEL : FREE_MODEL,
          conversationId: activeConversationId,
          itinerary: {
            destination: itineraryForm.destination.trim(),
            days: parseInt(itineraryForm.days) || 7,
            interests: itineraryForm.interests,
            budget: itineraryForm.budget,
          },
        }),
      });

      const data = await response.json();

      if (data.itinerary) {
        setMessages(prev => [...prev, { role: 'assistant', content: JSON.stringify(data.itinerary) }]);
        if (data.conversationId && data.conversationId !== activeConversationId) {
          setActiveConversationId(data.conversationId);
          loadConversations();
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error al generar el itinerario. Intenta de nuevo.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Verifica tu conexión e intenta de nuevo.' }]);
    } finally {
      setItineraryLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setItineraryForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const exportItinerary = (data: any) => {
    let md = `# Itinerario: ${data.destination}\n\n`;
    md += `${data.summary}\n\n`;
    md += `**Días:** ${data.days} | **Presupuesto:** ${data.budget}\n\n`;

    if (data.packing && data.packing.length > 0) {
      md += `## Qué llevar\n`;
      data.packing.forEach((item: string) => { md += `- ${item}\n`; });
      md += `\n`;
    }

    data.days_plan.forEach((day: any) => {
      md += `## Día ${day.day}: ${day.title}\n`;
      md += `*Coste estimado: ${day.estimatedCost}*\n\n`;
      day.activities.forEach((act: any) => {
        md += `### ${act.time} — ${act.title}\n`;
        if (act.description) md += `${act.description}\n`;
        if (act.location) md += `📍 ${act.location}\n`;
        md += `\n`;
      });
      if (day.tips && day.tips.length > 0) {
        md += `**Consejos:**\n`;
        day.tips.forEach((tip: string) => { md += `- ${tip}\n`; });
        md += `\n`;
      }
    });

    if (data.emergency_contacts && data.emergency_contacts.length > 0) {
      md += `## Contactos de emergencia\n`;
      data.emergency_contacts.forEach((c: string) => { md += `- ${c}\n`; });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerario-${data.destination.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareItinerary = async (data: any) => {
    setItineraryShareLoading(true);
    setItineraryShareResult(null);
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Itinerario ${data.destination} (${data.days} días)`,
          destination: data.destination,
          days: data.days,
          budget: data.budget,
          interests: data.days_plan?.flatMap((d: any) => d.activities?.map((a: any) => a.title)) || [],
          itinerary_raw: JSON.stringify(data),
          is_public: true,
          status: 'draft',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setItineraryShareResult(`error:${err.error || 'Error al guardar'}`);
        return;
      }
      const tripData = await res.json();
      const link = `${window.location.origin}/viajes/destacados/${tripData.trip.slug}`;
      setItineraryShareResult(link);
    } catch {
      setItineraryShareResult('error:Error de conexión');
    } finally {
      setItineraryShareLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1010]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Historial"
            >
              <History className="w-4 h-4" />
            </button>
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button onClick={handleExport} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Exportar conversación">
                <Download className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setModel('free')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  model === 'free' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3 inline mr-1" />
                Free
              </button>
              <button
                onClick={() => canUsePremium && setModel('premium')}
                disabled={!canUsePremium}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                  canUsePremium
                    ? model === 'premium'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900'
                      : 'text-slate-400 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {canUsePremium ? <Crown className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                Premium
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-72 bg-slate-800/50 border-r border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700">
              <button
                onClick={startNewConversation}
                className="w-full flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva conversacion
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">Sin conversaciones previas</p>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group ${
                      activeConversationId === conv.id
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span className="truncate text-xs">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      {conv.message_count} msgs · {new Date(conv.updated_at).toLocaleDateString('es-ES')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 && !trialExhausted && (
            /* Welcome screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Chat IA de Viajes
              </h1>
              <p className="text-slate-400 max-w-md mb-8">
                Tu asistente inteligente para planificar viajes, consultar riesgos, visados y mucho mas.
                {activeConversationId && <span className="text-purple-400"> Conversacion recuperada.</span>}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="bg-slate-800 rounded-xl p-4 border border-blue-500/30">
                  <Zap className="w-5 h-5 text-blue-400 mb-2" />
                  <h3 className="text-white font-semibold text-sm">Gratis</h3>
                  <p className="text-slate-400 text-xs mt-1">{isAnonymous ? `3 preguntas · sin registro` : `${Math.max(0, 5 - dailyCount)}/5 hoy`}</p>
                  <p className="text-slate-500 text-xs">llama-3.1-8b</p>
                  {isAnonymous && freeTrialCount > 0 && (
                    <p className="text-amber-400 text-[10px] mt-1">{FREE_TRIAL_MAX - freeTrialCount} restantes</p>
                  )}
                </div>
                <div className={`rounded-xl p-4 border ${canUsePremium ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800 border-slate-700/50'}`}>
                  <Crown className="w-5 h-5 text-amber-400 mb-2" />
                  <h3 className="text-white font-semibold text-sm">Premium</h3>
                  {canUsePremium ? (
                    <>
                      <p className="text-green-400 text-xs mt-1">Activo</p>
                      <p className="text-slate-500 text-xs">llama-3.1-70b</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 text-xs mt-1">Ilimitado</p>
                      <Link href="/premium" className="text-amber-400 text-xs hover:text-amber-300 font-medium">
                        Probar gratis
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="flex items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left text-sm text-slate-300 transition-colors border border-slate-700"
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-xs leading-tight">{s.text}</span>
                  </button>
                ))}
              </div>

              {/* Itinerary generator button */}
              <button
                onClick={() => setShowItineraryForm(!showItineraryForm)}
                className="mt-4 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-medium transition-all border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              >
                <MapPin className="w-4 h-4" />
                Generar itinerario de viaje
              </button>

              {/* Itinerary form */}
              {showItineraryForm && (
                <div className="mt-4 bg-slate-800 rounded-xl p-4 border border-slate-700 w-full max-w-sm space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Destino</label>
                    <input
                      value={itineraryForm.destination}
                      onChange={e => setItineraryForm(f => ({ ...f, destination: e.target.value }))}
                      placeholder="Ej: Japon, Tailandia, Peru..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Días</label>
                      <input
                        type="number"
                        value={itineraryForm.days}
                        onChange={e => setItineraryForm(f => ({ ...f, days: e.target.value }))}
                        min="1"
                        max="30"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Presupuesto</label>
                      <select
                        value={itineraryForm.budget}
                        onChange={e => setItineraryForm(f => ({ ...f, budget: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="economico">Económico</option>
                        <option value="moderado">Moderado</option>
                        <option value="alto">Alto</option>
                        <option value="lujo">Lujo</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Intereses</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'cultura', icon: '🏛️' },
                        { id: 'naturaleza', icon: '🌿' },
                        { id: 'gastronomia', icon: '🍜' },
                        { id: 'aventura', icon: '🧗' },
                        { id: 'playa', icon: '🏖️' },
                        { id: 'historia', icon: '📜' },
                        { id: 'fotografia', icon: '📸' },
                        { id: 'vida-nocturna', icon: '🌙' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => toggleInterest(opt.id)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            itineraryForm.interests.includes(opt.id)
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          {opt.icon} {opt.id}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleGenerateItinerary}
                      disabled={!itineraryForm.destination.trim() || itineraryLoading}
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {itineraryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                      {itineraryLoading ? 'Generando...' : 'Generar itinerario'}
                    </button>
                    <button
                      onClick={() => setShowItineraryForm(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Context indicator */}
              {!isAnonymous && (
                <div className="mt-6 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 max-w-sm">
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Contexto activo</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px]">Favoritos</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-[10px]">Viajes guardados</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px]">Alertas OSINT</span>
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[10px]">Datos MAEC en vivo</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {trialExhausted && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">¿Quieres seguir?</h2>
              <p className="text-slate-400 max-w-sm mb-6 text-sm">
                Has usado tus {FREE_TRIAL_MAX} preguntas gratuitas. Regístrate gratis para seguir chateando
                (hasta 5 mensajes/día) o prueba Premium para acceso ilimitado al modelo 70b.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/login?redirect=/chat"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  href="/premium"
                  className="px-6 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl font-medium transition-colors text-sm border border-amber-500/30"
                >
                  Probar Premium 7 días
                </Link>
              </div>
              <button
                onClick={() => {
                  try { localStorage.removeItem(FREE_TRIAL_KEY); } catch {}
                  setFreeTrialCount(0);
                }}
                className="mt-4 text-xs text-slate-500 hover:text-slate-400 underline"
              >
                Restablecer prueba (solo para testing)
              </button>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                // Try to parse as itinerary
                let itineraryData: any = null;
                if (msg.role === 'assistant') {
                  try {
                    const parsed = JSON.parse(msg.content);
                    if (parsed.days_plan && Array.isArray(parsed.days_plan)) {
                      itineraryData = parsed;
                    }
                  } catch {}
                }

                if (itineraryData) {
                  return (
                    <div key={i} className="flex justify-start w-full">
                      <div className="max-w-[95%] md:max-w-[85%] bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm overflow-hidden">
                        {/* Itinerary header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-white" />
                            <h3 className="text-white font-bold text-lg">{itineraryData.destination}</h3>
                          </div>
                          <p className="text-emerald-100 text-sm">{itineraryData.summary}</p>
                          <div className="flex gap-3 mt-2 text-xs text-emerald-100">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {itineraryData.days} días</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {itineraryData.budget}</span>
                          </div>
                        </div>

                        {/* Packing list */}
                        {itineraryData.packing && itineraryData.packing.length > 0 && (
                          <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Qué llevar</p>
                            <div className="flex flex-wrap gap-1.5">
                              {itineraryData.packing.map((item: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{item}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Day cards */}
                        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                          {itineraryData.days_plan.map((day: any) => (
                            <div key={day.day} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-semibold text-sm">
                                  Día {day.day}: {day.title}
                                </h4>
                                <span className="text-xs text-emerald-400 font-medium">{day.estimatedCost}</span>
                              </div>
                              <div className="space-y-2">
                                {day.activities.map((act: any, idx: number) => (
                                  <div key={idx} className="flex gap-3 items-start">
                                    <span className="text-xs text-slate-500 font-mono w-12 shrink-0 pt-0.5">{act.time}</span>
                                    <div className="flex-1">
                                      <p className="text-white text-sm font-medium">{act.title}</p>
                                      {act.description && <p className="text-slate-400 text-xs mt-0.5">{act.description}</p>}
                                      {act.location && <p className="text-slate-500 text-[10px] mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {act.location}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {day.tips && day.tips.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-600/50">
                                  <p className="text-xs text-amber-400 flex items-center gap-1 mb-1"><AlertCircle className="w-3 h-3" /> Consejos</p>
                                  {day.tips.map((tip: string, idx: number) => (
                                    <p key={idx} className="text-slate-400 text-xs ml-4">• {tip}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Emergency contacts */}
                        {itineraryData.emergency_contacts && itineraryData.emergency_contacts.length > 0 && (
                          <div className="px-4 py-3 border-t border-slate-700 bg-red-500/5">
                            <p className="text-xs text-red-400 flex items-center gap-1 mb-1"><Shield className="w-3 h-3" /> Emergencias</p>
                            {itineraryData.emergency_contacts.map((c: string, idx: number) => (
                              <p key={idx} className="text-slate-400 text-xs ml-4">• {c}</p>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50 flex gap-2">
                          <button
                            onClick={() => exportItinerary(itineraryData)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Exportar MD
                          </button>
                          {itineraryShareIdx === i ? (
                            itineraryShareResult ? (
                              itineraryShareResult.startsWith('error:') ? (
                                <div className="flex items-center gap-2 text-xs text-red-400 flex-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{itineraryShareResult.replace('error:', '')}</span>
                                  <button onClick={() => { setItineraryShareIdx(null); setItineraryShareResult(null); }} className="ml-auto text-slate-400 hover:text-white">Cerrar</button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs flex-1">
                                  <Globe className="w-3 h-3 text-green-400" />
                                  <a href={itineraryShareResult} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline truncate max-w-[200px]">
                                    {itineraryShareResult.replace('https://', '')}
                                  </a>
                                  <button
                                    onClick={() => { navigator.clipboard.writeText(itineraryShareResult); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }}
                                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                                  >
                                    {shareCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                  </button>
                                </div>
                              )
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-slate-400 flex-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Guardando...</span>
                              </div>
                            )
                          ) : (
                            <button
                              onClick={() => { setItineraryShareIdx(i); setItineraryShareResult(null); }}
                              disabled={itineraryShareLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs transition-colors disabled:opacity-50"
                            >
                              <Share2 className="w-3 h-3" />
                              Compartir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                    }`}>
                    {msg.role === 'assistant' ? (
                      <div>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        {msg.role === 'assistant' && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            {sharingMsg === i ? (
                              shareResult ? (
                                shareResult.startsWith('error:') ? (
                                  <div className="flex items-center gap-2 text-xs text-red-400">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>{shareResult.replace('error:', '')}</span>
                                    <button onClick={() => { setSharingMsg(null); setShareResult(null); }} className="ml-auto text-slate-400 hover:text-white">Cerrar</button>
                                  </div>
                                ) : (
                                <div className="flex items-center gap-2 text-xs">
                                  <Globe className="w-3.5 h-3.5 text-green-400" />
                                  <a href={shareResult} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline truncate max-w-[200px]">
                                    {shareResult.replace('https://', '')}
                                  </a>
                                  <button
                                    onClick={() => { navigator.clipboard.writeText(shareResult); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }}
                                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                                  >
                                    {shareCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                  </button>
                                </div>
                                )
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <div className="flex gap-2">
                                    <input
                                      value={shareForm.name}
                                      onChange={e => setShareForm(f => ({ ...f, name: e.target.value }))}
                                      placeholder="Nombre del viaje"
                                      className="flex-1 px-2 py-1 text-xs bg-slate-700 rounded border border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                    />
                                    <input
                                      value={shareForm.destination}
                                      onChange={e => setShareForm(f => ({ ...f, destination: e.target.value }))}
                                      placeholder="Destino"
                                      className="w-24 px-2 py-1 text-xs bg-slate-700 rounded border border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                    />
                                    <input
                                      type="number"
                                      value={shareForm.days}
                                      onChange={e => setShareForm(f => ({ ...f, days: e.target.value }))}
                                      placeholder="Días"
                                      className="w-14 px-2 py-1 text-xs bg-slate-700 rounded border border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleShare(i, msg.content)}
                                      disabled={shareLoading || !shareForm.name || !shareForm.destination}
                                      className="flex-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded transition-colors flex items-center justify-center gap-1"
                                    >
                                      {shareLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                                      {shareLoading ? 'Guardando...' : 'Publicar'}
                                    </button>
                                    <button
                                      onClick={() => setSharingMsg(null)}
                                      className="px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )
                            ) : (
                              <button
                                onClick={() => { setSharingMsg(i); setShareResult(null); setShareForm(f => ({ ...f, name: '', destination: '', days: '7' })); }}
                                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                <Share2 className="w-3 h-3" />
                                Compartir como viaje público
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {premiumBlocked && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
              <div className="flex items-center justify-center gap-2 text-red-400 text-xs">
                <Lock className="w-3 h-3" />
                <span>Modelo 70b bloqueado. Necesitas suscripcion Premium activa.</span>
                <Link href="/premium" className="underline hover:text-red-300 font-medium">
                  Activar trial gratis
                </Link>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4 border-t border-slate-700 bg-slate-900">
            {trialExhausted ? (
              <div className="text-center py-3">
                <p className="text-slate-400 text-sm mb-3">Has usado tus {FREE_TRIAL_MAX} preguntas gratuitas.</p>
                <div className="flex justify-center gap-3">
                  <Link href="/auth/login?redirect=/chat" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
                    Crear cuenta gratis
                  </Link>
                  <Link href="/premium" className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors border border-amber-500/30">
                    Premium 7 días gratis
                  </Link>
                </div>
              </div>
            ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ej: ¿Es seguro viajar a Japon?"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            )}
            <div className="mt-2 text-xs text-slate-500 text-center">
              {trialExhausted ? (
                <span>Regístrate para seguir usando el chat</span>
              ) : model === 'free' ? (
                <span>Modelo 8b gratuito {isAnonymous ? `· ${FREE_TRIAL_MAX - freeTrialCount}/${FREE_TRIAL_MAX} preguntas` : `· ${Math.max(0, 5 - dailyCount)}/5 hoy`}</span>
              ) : (
                <span className="text-green-400">Modelo 70b Premium activo — Chat ilimitado</span>
              )}
            </div>
            <p className="mt-1.5 text-[10px] text-slate-600 text-center leading-relaxed">
              Las respuestas IA son orientativas y se contrastan con fuentes oficiales. Ver <Link href="/metodologia" className="underline hover:text-slate-400">metodología</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
