'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Bot, Sparkles, Crown, Zap, AlertTriangle, Lock, Plus, MessageSquare, Trash2, History, Share2, Check, Copy, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSubscription } from '@/hooks/useSubscription';

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
  const [sharingMsg, setSharingMsg] = useState<number | null>(null);
  const [shareForm, setShareForm] = useState({ name: '', destination: '', days: '7' });
  const [shareLoading, setShareLoading] = useState(false);
  const [shareResult, setShareResult] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canUsePremium = sub.premium;

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

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setLoading(true);
    setPremiumBlocked(false);

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
  }, [input, loading, messages, model, canUsePremium, activeConversationId]);

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
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span className="truncate text-xs">{conv.title}</span>
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
          {messages.length === 0 && (
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
                  <h3 className="text-white font-semibold text-sm">Free</h3>
                  <p className="text-slate-400 text-xs mt-1">5 msgs/dia</p>
                  <p className="text-slate-500 text-xs">llama-3.1-8b</p>
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
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
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
              ))}
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
            <div className="mt-2 text-xs text-slate-500 text-center">
              {model === 'free' ? (
                <span>Modelo 8b gratuito</span>
              ) : (
                <span className="text-green-400">Modelo 70b Premium activo — Chat ilimitado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
