'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Copy, Check, RefreshCw, ExternalLink, Shield, Eye, EyeOff, ArrowLeft, Ban } from 'lucide-react';

interface APIKey {
  id: number;
  name: string;
  key: string;
  active: boolean;
  rate_limit: number;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

export default function AdminApiKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<'new' | number | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());

  const fetchKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/admin', { credentials: 'include' });
      if (res.status === 401) { router.push('/admin/login'); return; }
      if (!res.ok) throw new Error('Error al cargar keys');
      const json = await res.json();
      setKeys(json.keys || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const createKey = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setNewKey(null);
    try {
      const res = await fetch('/api/v1/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) throw new Error('Error al crear key');
      const json = await res.json();
      setNewKey(json.key.key);
      setNewName('');
      fetchKeys();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleKey = async (id: number, active: boolean) => {
    try {
      await fetch('/api/v1/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, active: !active }),
      });
      fetchKeys();
    } catch {}
  };

  const formatDate = (ts: string | null) => {
    if (!ts) return 'Nunca';
    return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-300" />
            </button>
            <Key className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold text-white">API Keys</h1>
          </div>
          <a href="/api-endpoints" target="_blank" className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm text-slate-300">
            Documentación <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">{error}</div>
        )}

        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Crear nueva API Key</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre descriptivo (ej: Cliente Agencia X)"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              onKeyDown={e => e.key === 'Enter' && createKey()}
            />
            <button
              onClick={createKey}
              disabled={creating || !newName.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
            >
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generar
            </button>
          </div>

          {newKey && (
            <div className="mt-4 bg-green-900/30 border border-green-700/50 rounded-xl p-4">
              <p className="text-green-300 text-sm font-medium mb-2">API Key creada — cópiala ahora, no se mostrará de nuevo:</p>
              <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-3">
                <code className="flex-1 text-green-400 font-mono text-sm break-all">{newKey}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(newKey); setCopied('new'); setTimeout(() => setCopied(null), 2000); }}
                  className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  {copied === 'new' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Keys existentes
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : keys.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No hay API keys creadas aún</p>
          ) : (
            <div className="space-y-3">
              {keys.map(k => (
                <div key={k.id} className={`rounded-xl border p-4 ${k.active ? 'bg-slate-700/50 border-slate-600' : 'bg-red-900/10 border-red-800/30'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{k.name}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${k.active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                          {k.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-slate-400 font-mono text-xs">
                          {revealedKeys.has(k.id) ? k.key : `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}`}
                        </code>
                        <button
                          onClick={() => {
                            const next = new Set(revealedKeys);
                            next.has(k.id) ? next.delete(k.id) : next.add(k.id);
                            setRevealedKeys(next);
                          }}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                        >
                          {revealedKeys.has(k.id) ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-slate-500" />}
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(k.key); setCopied(k.id); setTimeout(() => setCopied(null), 2000); }}
                          className="p-1 hover:bg-slate-600 rounded transition-colors"
                        >
                          {copied === k.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                        </button>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Usos: {k.usage_count}</span>
                        <span>Rate limit: {k.rate_limit}/día</span>
                        <span>Último uso: {formatDate(k.last_used_at)}</span>
                        <span>Creada: {formatDate(k.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleKey(k.id, k.active)}
                      className={`p-2 rounded-lg transition-colors ${k.active ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'}`}
                      title={k.active ? 'Desactivar' : 'Activar'}
                    >
                      {k.active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
