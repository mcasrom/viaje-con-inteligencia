'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Bot, Sparkles, Crown, Zap, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTIONS = [
  { icon: '🌍', text: '¿Es seguro viajar a Japón?' },
  { icon: '📋', text: '¿Necesito visado para Brasil?' },
  { icon: '💰', text: 'Presupuesto para 7 días en Tailandia' },
  { icon: '🏔️', text: 'Mejores destinos de montaña en Europa' },
];

const FREE_MODEL = 'llama-3.1-8b-instant';
const PREMIUM_MODEL = 'llama-3.1-70b-versatile';
const FREE_DAILY_LIMIT = 5;

function getTodayKey() {
  return `chat_daily_${new Date().toISOString().split('T')[0]}`;
}

function getDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(getTodayKey());
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function incrementDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = getTodayKey();
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const next = current + 1;
    localStorage.setItem(key, String(next));
    return next;
  } catch {
    return 0;
  }
}

function resetDailyIfNeeded() {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('chat_daily_'));
    const today = getTodayKey();
    keys.forEach(k => {
      if (k !== today) localStorage.removeItem(k);
    });
  } catch {}
}

export default function ChatClient() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [model, setModel] = useState<'free' | 'premium'>('free');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetDailyIfNeeded();
    setDailyCount(getDailyCount());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    if (dailyCount >= FREE_DAILY_LIMIT && model === 'free') {
      return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          model: model === 'premium' ? PREMIUM_MODEL : FREE_MODEL,
          history: messages.map(m => m.content).slice(-6),
        }),
      });

      const data = await response.json();
      if (response.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Has alcanzado el límite de 5 mensajes hoy. **Actualiza a Premium** para chat ilimitado con modelo superior.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Lo siento, no pude procesar tu solicitud. Intenta de nuevo.' }]);
        if (model === 'free') {
          const newCount = incrementDailyCount();
          setDailyCount(newCount);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Verifica tu conexión e intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, dailyCount, model]);

  const remaining = Math.max(0, FREE_DAILY_LIMIT - dailyCount);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1010]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Model selector */}
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
                onClick={() => setModel('premium')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                  model === 'premium' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3 h-3" />
                Premium
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Chat IA de Viajes
            </h1>
            <p className="text-slate-400 max-w-md mb-8">
              Tu asistente inteligente para planificar viajes, consultar riesgos, visados y mucho más.
            </p>

            {/* Model info */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
              <div className="bg-slate-800 rounded-xl p-4 border border-blue-500/30">
                <Zap className="w-5 h-5 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold text-sm">Free</h3>
                <p className="text-slate-400 text-xs mt-1">5 mensajes/día</p>
                <p className="text-slate-500 text-xs">llama-3.1-8b</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-amber-500/30">
                <Crown className="w-5 h-5 text-amber-400 mb-2" />
                <h3 className="text-white font-semibold text-sm">Premium</h3>
                <p className="text-slate-400 text-xs mt-1">Ilimitado</p>
                <p className="text-slate-500 text-xs">llama-3.1-70b</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.text)}
                  disabled={dailyCount >= FREE_DAILY_LIMIT}
                  className="flex items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-left text-sm text-slate-300 transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs leading-tight">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
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

        {/* Daily limit warning */}
        {model === 'free' && dailyCount > 0 && remaining <= 2 && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>
                {remaining === 0
                  ? 'Límite alcanzado. Actualiza a Premium para continuar.'
                  : `Te quedan ${remaining} mensaje${remaining === 1 ? '' : 's'} hoy.`}
              </span>
              <Link href="/premium" className="underline hover:text-amber-300">
                Ver Premium
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
              placeholder={dailyCount >= FREE_DAILY_LIMIT && model === 'free'
                ? 'Límite alcanzado. Actualiza a Premium.'
                : 'Ej: ¿Es seguro viajar a Japón?'
              }
              disabled={dailyCount >= FREE_DAILY_LIMIT && model === 'free'}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim() || (dailyCount >= FREE_DAILY_LIMIT && model === 'free')}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Counter / Upgrade CTA */}
          {model === 'free' && (
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-500">
                {dailyCount}/{FREE_DAILY_LIMIT} mensajes hoy
              </span>
              {dailyCount >= FREE_DAILY_LIMIT ? (
                <Link
                  href="/premium"
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  Desbloquear ilimitado
                </Link>
              ) : null}
            </div>
          )}
          {model === 'premium' && (
            <div className="mt-2 text-xs text-slate-500 text-center">
              <Link href="/premium" className="text-amber-400 hover:text-amber-300">
                ¿Necesitas Premium? Activa tu prueba gratuita →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
