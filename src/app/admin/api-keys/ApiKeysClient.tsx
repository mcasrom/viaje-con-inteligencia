'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, Eye, EyeOff, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ApiKeyItem {
  id: number;
  name: string;
  key_prefix: string;
  tier: string;
  active: boolean;
  monthly_limit: number;
  created_at: string;
  last_used_at: string | null;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-slate-400' },
  starter: { label: 'Starter', color: 'text-green-400' },
  pro: { label: 'Pro', color: 'text-amber-400' },
  enterprise: { label: 'Enterprise', color: 'text-purple-400' },
};

export default function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTier, setNewTier] = useState('free');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/api-keys');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const createKey = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), tier: newTier }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCreatedKey(data.key);
      setNewName('');
      setNewTier('free');
      setShowCreate(false);
      fetchKeys();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteKey = async (id: number) => {
    if (!confirm('¿Eliminar esta API key?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const toggleKey = async (id: number, active: boolean) => {
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setKeys(prev => prev.map(k => k.id === id ? { ...k, active } : k));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-yellow-400" />API Keys
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gestiona tus claves de API B2B</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchKeys}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => { setShowCreate(true); setCreatedKey(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />Nueva API Key
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />{error}
            <button onClick={() => setError('')} className="ml-auto text-red-300 hover:text-white">✕</button>
          </div>
        )}

        {createdKey && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 font-medium text-sm mb-2">🔑 API Key creada</p>
            <p className="text-slate-300 text-xs mb-2">Cópiala ahora — no se mostrará de nuevo.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-800 px-3 py-2 rounded-lg text-sm font-mono text-amber-300 break-all">
                {createdKey}
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText(createdKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500">Cargando keys...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-20">
            <Key className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No tienes API keys</p>
            <p className="text-slate-500 text-sm mt-1">Crea una para empezar a usar la API B2B</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map(k => {
              const tierInfo = TIER_LABELS[k.tier] || TIER_LABELS.free;
              return (
                <div key={k.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${k.active ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-white font-medium text-sm">{k.name}</p>
                        <p className="text-slate-500 text-xs font-mono">{k.key_prefix}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 ${tierInfo.color}`}>
                        {tierInfo.label}
                      </span>
                      <span className="text-slate-500 text-xs">{k.monthly_limit}/mes</span>
                      <button
                        onClick={() => toggleKey(k.id, !k.active)}
                        className={`p-1.5 rounded-lg text-xs ${k.active ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}
                      >
                        {k.active ? 'Activa' : 'Inactiva'}
                      </button>
                      <button
                        onClick={() => deleteKey(k.id)}
                        disabled={deleting === k.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-[10px] text-slate-600">
                    <span>Creada: {new Date(k.created_at).toLocaleDateString('es-ES')}</span>
                    {k.last_used_at && <span>Último uso: {new Date(k.last_used_at).toLocaleDateString('es-ES')}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (!createdKey) setShowCreate(false); }}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-white mb-4">Nueva API Key</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Nombre</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ej: Producción, Testing..."
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Plan</label>
                  <select
                    value={newTier}
                    onChange={e => setNewTier(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm"
                  >
                    <option value="free">Free — 3,000 req/mes</option>
                    <option value="starter">Starter — 10,000 req/mes</option>
                    <option value="pro">Pro — 50,000 req/mes</option>
                    <option value="enterprise">Enterprise — 1,000,000 req/mes</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancelar</button>
                  <button onClick={createKey} disabled={!newName.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50">
                    Crear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
