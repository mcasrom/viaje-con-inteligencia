'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Edit2, Check, X, Trash2, AlertTriangle } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  terrorism: 'Terrorismo',
  airspace_closure: 'Cierre aereo',
  conflict: 'Conflicto',
  natural_disaster: 'Desastre natural',
  flight_disruption: 'Disrupcion vuelos',
  health_outbreak: 'Alerta sanitaria',
  protest: 'Protestas/Huelgas',
  travel_advisory: 'Aviso de viaje',
  security_threat: 'Amenaza seguridad',
  infrastructure: 'Infraestructura',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

interface Incident {
  id: number;
  type: string;
  entity_id: string;
  title: string;
  description: string;
  country_code: string | null;
  location: string | null;
  severity: string;
  recommendation: string;
  analyst_note: string | null;
  analyst_updated_at: string | null;
  detected_at: string;
}

export default function AdminIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const startEdit = (incident: Incident) => {
    setEditing(incident.id);
    setNoteText(incident.analyst_note || '');
  };

  const cancelEdit = () => {
    setEditing(null);
    setNoteText('');
  };

  const saveNote = async (incidentId: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/incidents/${incidentId}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText }),
      });
      if (res.ok) {
        await fetchIncidents();
        setEditing(null);
        setNoteText('');
      }
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (incidentId: number) => {
    try {
      const res = await fetch(`/api/admin/incidents/${incidentId}/note`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchIncidents();
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const getFlag = (code: string | null): string => {
    if (!code) return '';
    try {
      return code.toUpperCase().split('').map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-[1000]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="h-4 w-px bg-slate-700" />
            <h1 className="text-white font-semibold">Incidentes</h1>
          </div>
          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span>
            Añade notas de analista para complementar las recomendaciones automaticas.
            Se muestran en /osint para los usuarios.
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-12 border border-slate-800 text-center">
            <p className="text-slate-400">No hay incidentes activos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map(incident => {
              const isEditing = editing === incident.id;
              return (
                <div key={incident.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={SEVERITY_COLORS[incident.severity] || 'text-slate-400'}>
                          [{incident.severity?.toUpperCase()}]
                        </span>
                        <span className="text-white font-medium">{incident.title}</span>
                        {incident.country_code && (
                          <span>{getFlag(incident.country_code)}</span>
                        )}
                        <span className="text-slate-600 text-xs">
                          {TYPE_LABELS[incident.type] || incident.type}
                        </span>
                      </div>

                      {incident.location && (
                        <p className="text-slate-500 text-xs mb-2">{incident.location}</p>
                      )}

                      <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                        <span className="text-slate-500 text-xs">Recomendacion auto:</span>
                        <p className="text-slate-300 text-sm mt-0.5">{incident.recommendation}</p>
                      </div>

                      {/* Analyst Note */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Escribe tu nota de analista..."
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveNote(incident.id)}
                              disabled={saving}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          {incident.analyst_note ? (
                            <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-blue-400 text-xs font-semibold">Nota del analista</span>
                                <div className="flex items-center gap-1">
                                  {incident.analyst_updated_at && (
                                    <span className="text-slate-500 text-xs">
                                      {new Date(incident.analyst_updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => startEdit(incident)}
                                    className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                                    title="Editar nota"
                                  >
                                    <Edit2 className="w-3 h-3 text-blue-400" />
                                  </button>
                                  <button
                                    onClick={() => deleteNote(incident.id)}
                                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                    title="Eliminar nota"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-slate-200 text-sm whitespace-pre-wrap">{incident.analyst_note}</p>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(incident)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-500 hover:text-blue-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Añadir nota de analista
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
