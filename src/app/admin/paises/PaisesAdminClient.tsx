'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, Loader2, Globe, ChevronDown, ChevronUp,
  Save, X, Check, AlertTriangle, Shield, ExternalLink,
} from 'lucide-react';

interface PaisRow {
  codigo: string;
  nombre: string;
  capital: string | null;
  continente: string | null;
  nivel_riesgo: string;
  ultimo_informe: string | null;
  bandera: string | null;
  visible: boolean;
  data: any;
  updated_at: string | null;
}

const RISK_OPTIONS = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'] as const;
const RISK_COLORS: Record<string, string> = {
  'sin-riesgo': 'text-green-400 bg-green-900/30',
  bajo: 'text-blue-400 bg-blue-900/30',
  medio: 'text-yellow-400 bg-yellow-900/30',
  alto: 'text-orange-400 bg-orange-900/30',
  'muy-alto': 'text-red-400 bg-red-900/30',
};

export default function PaisesAdminClient() {
  const [paises, setPaises] = useState<PaisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaisRow>>({});

  const fetchPaises = useCallback(async () => {
    const res = await fetch('/api/admin/paises');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json();
    setPaises(data.paises || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPaises(); }, [fetchPaises]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const startEdit = (pais: PaisRow) => {
    setEditing(pais.codigo);
    setEditForm({
      nombre: pais.nombre,
      capital: pais.capital,
      continente: pais.continente,
      nivel_riesgo: pais.nivel_riesgo,
      ultimo_informe: pais.ultimo_informe,
      bandera: pais.bandera,
      visible: pais.visible,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const saveEdit = async (codigo: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/paises', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, ...editForm }),
      });
      if (!res.ok) {
        const err = await res.json();
        showNotification('error', err.error || 'Error al guardar');
        return;
      }
      showNotification('success', 'País actualizado correctamente');
      setEditing(null);
      setEditForm({});
      await fetchPaises();
    } catch {
      showNotification('error', 'Error de red al guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (pais: PaisRow) => {
    await fetch('/api/admin/paises', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo: pais.codigo, visible: !pais.visible }),
    });
    showNotification('success', `País ${pais.visible ? 'ocultado' : 'mostrado'}`);
    await fetchPaises();
  };

  const filtered = paises.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.nombre?.toLowerCase().includes(q) && !p.codigo?.toLowerCase().includes(q) && !p.capital?.toLowerCase().includes(q)) return false;
    }
    if (riskFilter !== 'all' && p.nivel_riesgo !== riskFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Admin Países</span>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 transition-all ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Gestión de Países</h1>
        <p className="text-slate-400 mb-6">{paises.length} países en total · {paises.filter(p => p.visible).length} visibles · {paises.filter(p => !p.visible).length} ocultos</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, código o capital..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos los niveles</option>
            {RISK_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Código</th>
                <th className="text-left py-3 px-4 font-medium">País</th>
                <th className="text-left py-3 px-4 font-medium">Capital</th>
                <th className="text-left py-3 px-4 font-medium">Continente</th>
                <th className="text-left py-3 px-4 font-medium">Riesgo</th>
                <th className="text-left py-3 px-4 font-medium">Visible</th>
                <th className="text-right py-3 px-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pais => (
                <tr key={pais.codigo} className={`border-b border-slate-700/50 ${!pais.visible ? 'opacity-60' : ''}`}>
                  {editing === pais.codigo ? (
                    <>
                      <td className="py-3 px-4 text-slate-400 font-mono">{pais.codigo}</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editForm.nombre || ''}
                          onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={editForm.capital || ''}
                          onChange={e => setEditForm(f => ({ ...f, capital: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editForm.continente || ''}
                          onChange={e => setEditForm(f => ({ ...f, continente: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        >
                          {['Europa', 'Asia', 'África', 'América del Norte', 'América del Sur', 'Oceanía', 'Américas'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={editForm.nivel_riesgo || ''}
                          onChange={e => setEditForm(f => ({ ...f, nivel_riesgo: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        >
                          {RISK_OPTIONS.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setEditForm(f => ({ ...f, visible: !f.visible }))}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            editForm.visible ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {editForm.visible ? 'Sí' : 'No'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(pais.codigo)}
                            disabled={saving}
                            className="p-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        <span className="text-slate-400 font-mono text-xs">{pais.codigo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pais.bandera}</span>
                          <span className="text-white font-medium">{pais.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{pais.capital || '—'}</td>
                      <td className="py-3 px-4 text-slate-300">{pais.continente || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${RISK_COLORS[pais.nivel_riesgo] || 'text-slate-400 bg-slate-700'}`}>
                          {pais.nivel_riesgo}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleVisible(pais)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            pais.visible
                              ? 'bg-green-900/50 text-green-400 hover:bg-green-800/50'
                              : 'bg-red-900/50 text-red-400 hover:bg-red-800/50'
                          }`}
                        >
                          {pais.visible ? 'Visible' : 'Oculto'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(pais)}
                            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 text-xs font-medium transition-colors"
                          >
                            Editar
                          </button>
                          <a
                            href={`/pais/${pais.codigo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No se encontraron países con esos filtros</p>
          </div>
        )}
      </main>
    </div>
  );
}
