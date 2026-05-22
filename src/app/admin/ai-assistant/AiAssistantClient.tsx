'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, FileText, Search, Tag, MessageSquare, Sparkles } from 'lucide-react';

type Mode = 'seo' | 'post' | 'meta' | 'free';

const MODES: { key: Mode; label: string; icon: typeof Bot; desc: string }[] = [
  { key: 'seo', label: 'Analizar contenido', icon: Search, desc: ' Analiza y mejora posts existentes' },
  { key: 'post', label: 'Generar post', icon: FileText, desc: ' Crea artículos SEO completos' },
  { key: 'meta', label: 'Meta tags', icon: Tag, desc: ' Genera titles + descriptions' },
  { key: 'free', label: 'Consulta libre', icon: MessageSquare, desc: ' Pregunta lo que quieras' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantClient() {
  const [mode, setMode] = useState<Mode>('free');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¿En qué te ayudo? Selecciona un modo abajo o simplemente escribe tu consulta.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.content,
          mode,
          context: context.trim() || undefined,
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.error || data.response,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Bot className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold text-white">Asistente IA</h1>
            <p className="text-xs text-slate-500">Groq llama-3.1-8b-instant — consultas SEO, posts, análisis</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Mode selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                mode === m.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <m.icon className="w-4 h-4 shrink-0" />
              <span className="leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-200'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="bg-slate-700/50 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowContext(!showContext)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  showContext ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                title="Añadir contexto (post existente, texto a analizar...)"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={
                  mode === 'seo' ? 'Pega el texto del post que quieres analizar...' :
                  mode === 'post' ? 'Describe el tema del post: país, enfoque, tono...' :
                  mode === 'meta' ? 'Indica la página o tema para generar meta tags...' :
                  'Escribe tu consulta...'
                }
                className="flex-1 px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder:text-slate-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {showContext && (
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Contexto adicional (ej. el post completo que quieres analizar, datos específicos, URL...)"
                rows={3}
                className="mt-2 w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder:text-slate-500 resize-none"
              />
            )}
          </form>
        </div>

        <p className="text-xs text-slate-600 mt-2 text-center">
          Las respuestas son generadas por IA. Revisa los datos antes de publicar.
        </p>
      </main>
    </div>
  );
}
