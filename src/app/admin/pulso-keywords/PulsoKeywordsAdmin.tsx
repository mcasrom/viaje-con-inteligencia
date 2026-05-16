'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, X, Check, AlertTriangle } from 'lucide-react';

interface Keyword {
  id: number;
  keyword_es: string;
  keyword_en: string;
  icon: string;
  category: string;
  used_in_detection: boolean;
  used_in_display: boolean;
  active: boolean;
  created_at: string;
}

const CATEGORIES = ['Transporte', 'Social', 'Clima', 'Desastre', 'Salud', 'Seguridad', 'Logística', 'Emergencia', 'Geopolítico', 'General'];

export default function PulsoKeywordsAdmin() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Keyword | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ keyword_es: '', keyword_en: '', icon: '⚠️', category: 'General', used_in_detection: true, used_in_display: true, active: true });
  const [saving, setSaving] = useState(false);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pulso-keywords');
      const json = await res.json();
      setKeywords(json.keywords || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeywords(); }, []);

  const resetForm = () => {
    setForm({ keyword_es: '', keyword_en: '', icon: '⚠️', category: 'General', used_in_detection: true, used_in_display: true, active: true });
    setCreating(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.keyword_es.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch('/api/admin/pulso-keywords', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: editing.id }),
        });
      } else {
        await fetch('/api/admin/pulso-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      resetForm();
      await fetchKeywords();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta keyword?')) return;
    await fetch(`/api/admin/pulso-keywords?id=${id}`, { method: 'DELETE' });
    await fetchKeywords();
  };

  const startEdit = (kw: Keyword) => {
    setForm({ keyword_es: kw.keyword_es, keyword_en: kw.keyword_en || '', icon: kw.icon, category: kw.category, used_in_detection: kw.used_in_detection, used_in_display: kw.used_in_display, active: kw.active });
    setEditing(kw);
    setCreating(true);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-purple-400" />
              Keywords del Pulso Global
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gestiona las palabras clave para detección de alertas y visualización en /pulso-global</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchKeywords} className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => { resetForm(); setCreating(true); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Añadir keyword
            </button>
          </div>
        </div>

        {/* Form */}
        {creating && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <h2 className="text-white font-bold">{editing ? 'Editar keyword' : 'Nueva keyword'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Keyword ES *</label>
                <input value={form.keyword_es} onChange={e => setForm({ ...form, keyword_es: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="huelga" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Keyword EN</label>
                <input value={form.keyword_en} onChange={e => setForm({ ...form, keyword_en: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="strike" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Icono (emoji)</label>
                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" placeholder="⚡" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Categoría</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="detection" checked={form.used_in_detection} onChange={e => setForm({ ...form, used_in_detection: e.target.checked })} className="rounded bg-slate-700 border-slate-600" />
                <label htmlFor="detection" className="text-slate-300 text-sm">Usar en detección</label>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="display" checked={form.used_in_display} onChange={e => setForm({ ...form, used_in_display: e.target.checked })} className="rounded bg-slate-700 border-slate-600" />
                <label htmlFor="display" className="text-slate-300 text-sm">Mostrar en Pulso</label>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="rounded bg-slate-700 border-slate-600" />
                <label htmlFor="active" className="text-slate-300 text-sm">Activo</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !form.keyword_es.trim()} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                <Check className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-slate-600 animate-spin" /></div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Icono</th>
                    <th className="text-left px-4 py-3 font-medium">ES</th>
                    <th className="text-left px-4 py-3 font-medium">EN</th>
                    <th className="text-left px-4 py-3 font-medium">Categoría</th>
                    <th className="text-center px-4 py-3 font-medium">Detección</th>
                    <th className="text-center px-4 py-3 font-medium">Display</th>
                    <th className="text-center px-4 py-3 font-medium">Activo</th>
                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map(kw => (
                    <tr key={kw.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-xl">{kw.icon}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{kw.keyword_es}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{kw.keyword_en || '—'}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{kw.category}</span></td>
                      <td className="px-4 py-3 text-center">{kw.used_in_detection ? <span className="text-green-400 text-sm font-medium">Sí</span> : <span className="text-slate-500 text-sm">No</span>}</td>
                      <td className="px-4 py-3 text-center">{kw.used_in_display ? <span className="text-green-400 text-sm font-medium">Sí</span> : <span className="text-slate-500 text-sm">No</span>}</td>
                      <td className="px-4 py-3 text-center">{kw.active ? <span className="text-green-400 text-sm font-medium">Sí</span> : <span className="text-red-400 text-sm font-medium">No</span>}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(kw)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors" title="Editar">
                            <Pencil className="w-4 h-4 text-slate-400" />
                          </button>
                          <button onClick={() => handleDelete(kw.id)} className="p-1.5 hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {keywords.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No hay keywords. Añade la primera.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
