'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, ExternalLink, MessageSquare } from 'lucide-react';

export default function RedditClient() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'title' | 'body' | null>(null);

  const generate = async () => {
    setLoading(true);
    setError('');
    setTitle('');
    setBody('');
    try {
      const res = await fetch('/api/admin/reddit-generate');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al generar');
      }
      const data = await res.json();
      setTitle(data.title);
      setBody(data.body);
      setGeneratedAt(data.generatedAt);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, type: 'title' | 'body') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-orange-400" />
              Posts Reddit
            </h1>
            <p className="text-slate-400 text-sm mt-1">Genera borradores para Reddit con datos actuales de seguridad y sentimiento.</p>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generando...' : 'Generar post'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm">{error}</div>
        )}

        {loading && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
            <p className="text-slate-300">Generando post con datos actuales...</p>
            <p className="text-slate-500 text-sm">Groq analiza alertas, señales y sentimiento para redactar el borrador.</p>
          </div>
        )}

        {title && !loading && (
          <>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold">Vista previa</h2>
                {generatedAt && (
                  <span className="text-slate-500 text-xs">Generado {new Date(generatedAt).toLocaleTimeString('es-ES')}</span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Título</label>
                  <button onClick={() => copy(title, 'title')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                    {copied === 'title' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'title' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                  <p className="text-white font-bold text-lg">{title}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Cuerpo</label>
                  <button onClick={() => copy(body, 'body')} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                    {copied === 'body' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'body' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-slate-700 rounded-xl p-4 border border-slate-600 whitespace-pre-wrap text-slate-200 text-sm leading-relaxed">
                  {body}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-slate-400 text-xs text-center">
                Copia el título y cuerpo, pégálos en Reddit manualmente. No incluyas URLs directas para evitar el filtro de autopromoción.
              </p>
            </div>
          </>
        )}

        {!title && !loading && !error && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">Presiona "Generar post" para crear un borrador</p>
            <p className="text-slate-500 text-sm">Basado en alertas activas, sentimiento y señales OSINT de los últimos 7 días.</p>
          </div>
        )}
      </div>
    </div>
  );
}
