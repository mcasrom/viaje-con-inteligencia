'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bell, TestTube, List, AlertTriangle, CheckCircle } from 'lucide-react';

interface BotInfo {
  ok?: boolean;
  result?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
  };
  error?: string;
}

interface ChannelInfo {
  ok?: boolean;
  result?: {
    id: number;
    title: string;
    username: string;
    type: string;
  };
  error?: string;
}

export default function AdminAlertsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);

  const testConnection = async (type: 'bot' | 'channel') => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `test_${type}` }),
      });
      const data = await res.json();
      if (type === 'bot') setBotInfo(data);
      else setChannelInfo(data);
      setMessage({ type: 'success', text: 'Conexión exitosa' });
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
    setLoading(false);
  };

  const sendRiskUpdate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'broadcast_risk' }),
      });
      const data = await res.json();
      setMessage({ type: data.success ? 'success' : 'error', text: data.message });
    } catch {
      setMessage({ type: 'error', text: 'Error al enviar' });
    }
    setLoading(false);
  };

  const listCountries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_countries' }),
      });
      const data = await res.json();
      console.log('Countries:', data.countries);
      setMessage({ type: 'success', text: `${data.countries?.length || 0} países cargados en consola` });
    } catch {
      setMessage({ type: 'error', text: 'Error al listar' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Alertas</h1>
          <p className="text-slate-400">Gestiona las notificaciones del canal de Telegram</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              Enviar Alertas
            </h2>
            <div className="space-y-4">
              <button
                onClick={sendRiskUpdate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Enviar actualización de riesgos
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-green-400" />
              Probar Conexiones
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => testConnection('bot')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <TestTube className="w-4 h-4" />
                Probar Bot
              </button>
              <button
                onClick={() => testConnection('channel')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <TestTube className="w-4 h-4" />
                Probar Canal
              </button>
              <button
                onClick={listCountries}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <List className="w-4 h-4" />
                Listar países
              </button>
            </div>
          </div>
        </div>

        {(botInfo || channelInfo) && (
          <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Resultados de Prueba</h2>
            <pre className="bg-slate-900 p-4 rounded-lg overflow-auto text-sm text-slate-300">
              {JSON.stringify({ bot: botInfo, channel: channelInfo }, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Configuración</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-slate-400 mb-1">Bot Token</p>
              <p className="text-white font-mono">••••••••••••••••</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-slate-400 mb-1">Channel ID</p>
              <p className="text-white font-mono">{process.env.NEXT_PUBLIC_CHANNEL_ID || '-1003764932977'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/30 border border-blue-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-blue-400 mb-2">📢 Canal de Suscripción</h2>
          <p className="text-slate-300 text-sm mb-4">
            Los usuarios pueden suscribirse al canal para recibir alertas automáticas de riesgos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://t.me/AlertasViajeroBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              @AlertasViajeroBot
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
