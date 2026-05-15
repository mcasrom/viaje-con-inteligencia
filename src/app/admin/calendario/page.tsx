'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, ChevronLeft, ChevronRight, FileText, Mail,
  Edit3, Plus, X, Check, Trash2, Clock, AlertTriangle,
  RefreshCw, ExternalLink
} from 'lucide-react';

interface Infografia {
  id: string;
  week_start: string;
  week_end: string;
  edition: number;
  title: string;
  subtitle?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

interface Newsletter {
  id: number;
  subject: string;
  recipients_count: number;
  sent_at: string;
  opens?: number;
  clicks?: number;
}

interface EditorNote {
  id: string;
  title: string;
  content: string;
  month: string;
  tags: string[];
  is_published: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

interface CalendarEvent {
  date: Date;
  type: 'infografia' | 'newsletter' | 'editor_note';
  title: string;
  subtitle?: string;
  data: any;
}

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return dateStr; }
}

function formatShort(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  } catch { return dateStr; }
}

export default function AdminCalendario() {
  const router = useRouter();
  const [infografias, setInfografias] = useState<Infografia[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [editorNotes, setEditorNotes] = useState<EditorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<EditorNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [infRes, nlRes, notesRes] = await Promise.all([
        fetch('/api/infografias?page=1&perPage=50', { credentials: 'include' }),
        fetch('/api/newsletter/stats', { credentials: 'include' }),
        fetch('/api/admin/editor-notes', { credentials: 'include' }),
      ]);

      if (infRes.status === 401 || nlRes.status === 401 || notesRes.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!infRes.ok || !nlRes.ok || !notesRes.ok) throw new Error('Error fetching data');

      const [infData, nlData, notesData] = await Promise.all([
        infRes.json(), nlRes.json(), notesRes.json(),
      ]);

      setInfografias(infData.data || []);
      setNewsletters(nlData.history || []);
      setEditorNotes(notesData.notes || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const events = useMemo(() => {
    const all: CalendarEvent[] = [];

    infografias.forEach(inf => {
      const d = new Date(inf.week_start);
      all.push({
        date: d,
        type: 'infografia',
        title: `Infografía #${inf.edition}`,
        subtitle: inf.title,
        data: inf,
      });
    });

    newsletters.forEach(nl => {
      const d = new Date(nl.sent_at);
      all.push({
        date: d,
        type: 'newsletter',
        title: nl.subject || 'Newsletter',
        subtitle: `${nl.recipients_count || 0} destinatarios`,
        data: nl,
      });
    });

    editorNotes.forEach(note => {
      const d = new Date(note.month);
      all.push({
        date: d,
        type: 'editor_note',
        title: note.title,
        subtitle: `Nota del Editor — ${note.author}`,
        data: note,
      });
    });

    return all.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [infografias, newsletters, editorNotes]);

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthEvents = useMemo(() => {
    return events.filter(e => {
      const d = e.date;
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [events, year, month]);

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const openNewNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setShowNoteForm(true);
  };

  const openEditNote = (note: EditorNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags((note.tags || []).join(', '));
    setShowNoteForm(true);
  };

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSavingNote(true);
    try {
      const tags = noteTags.split(',').map(t => t.trim()).filter(Boolean);
      const body: any = {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        month: currentMonth + '-01',
        tags,
      };

      if (editingNote) {
        body.id = editingNote.id;
        const res = await fetch('/api/admin/editor-notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al guardar');
        const json = await res.json();
        setEditorNotes(prev =>
          prev.map(n => n.id === json.note.id ? json.note : n)
        );
      } else {
        const res = await fetch('/api/admin/editor-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Error al crear');
        const json = await res.json();
        setEditorNotes(prev => [json.note, ...prev]);
      }

      setShowNoteForm(false);
      setEditingNote(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('¿Eliminar esta nota del editor?')) return;
    try {
      const res = await fetch(`/api/admin/editor-notes?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setEditorNotes(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const eventsForDay = (day: number) => {
    return monthEvents.filter(e => e.date.getDate() === day);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'infografia': return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case 'newsletter': return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'editor_note': return <Edit3 className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'infografia': return 'border-l-purple-500 bg-purple-500/10';
      case 'newsletter': return 'border-l-blue-500 bg-blue-500/10';
      case 'editor_note': return 'border-l-amber-500 bg-amber-500/10';
    }
  };

  const typeDot = (type: string) => {
    switch (type) {
      case 'infografia': return 'bg-purple-400';
      case 'newsletter': return 'bg-blue-400';
      case 'editor_note': return 'bg-amber-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold">Calendario Editorial</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/dashboard"
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          >
            ← Volver al admin
          </a>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Infografías</p>
            <p className="text-2xl font-bold text-purple-400">{infografias.length}</p>
            <p className="text-xs text-slate-500">domingos vía cron</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Newsletters</p>
            <p className="text-2xl font-bold text-blue-400">{newsletters.length}</p>
            <p className="text-xs text-slate-500">lunes vía cron</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs mb-1">Notas del Editor</p>
            <p className="text-2xl font-bold text-amber-400">{editorNotes.length}</p>
            <p className="text-xs text-slate-500">mensuales / bajo demanda</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-slate-750 border-b border-slate-700">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <h2 className="text-lg font-semibold">
              {new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400 py-2 border-b border-slate-700/50">
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-slate-700/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = eventsForDay(day);
              const today = new Date();
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              return (
                <div
                  key={day}
                  className={`min-h-[90px] border-b border-r border-slate-700/30 p-1 ${isToday ? 'bg-emerald-900/20' : ''}`}
                >
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isToday ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {events.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate ${typeColor(ev.type)} border-l-2`}
                        title={ev.title}
                      >
                        {typeIcon(ev.type)}
                        <span className="truncate text-[10px]">{ev.title}</span>
                      </div>
                    ))}
                    {events.length > 3 && (
                      <p className="text-[10px] text-slate-500 px-1">+{events.length - 3} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Infografía</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Newsletter</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Nota Editor</span>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-amber-400" />
              Notas del Editor
            </h2>
            <button
              onClick={openNewNote}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-600/30 transition-colors text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva nota
            </button>
          </div>

          {showNoteForm && (
            <div className="bg-slate-750 border border-slate-600 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-medium text-white mb-3">
                {editingNote ? 'Editar nota' : 'Nueva nota del Editor'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Título</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Ej: Situación geopolítica Mayo 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Contenido</label>
                  <textarea
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y"
                    placeholder="Análisis del editor sobre la situación actual..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tags (separados por coma)</label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={e => setNoteTags(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="geopolítica, seguridad, destinos"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveNote}
                    disabled={savingNote || !noteTitle.trim() || !noteContent.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {savingNote ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setShowNoteForm(false); setEditingNote(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {editorNotes.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay notas del editor. Crea la primera para {new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}.</p>
          ) : (
            <div className="space-y-3">
              {editorNotes.map(note => (
                <div key={note.id} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium text-sm">{note.title}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-600 text-slate-300">
                          {formatShort(note.month)}
                        </span>
                        {!note.is_published && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700/50">borrador</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag, j) => (
                            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/20 text-amber-400 border border-amber-700/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 mt-2">
                        {note.author} · {formatTime(note.updated_at || note.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditNote(note)}
                        className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Línea de tiempo completa
          </h2>
          {events.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay eventos registrados.</p>
          ) : (
            <div className="space-y-2">
              {events.map((ev, i) => (
                <div
                  key={`${ev.type}-${i}`}
                  className="flex items-start gap-3 bg-slate-700/30 rounded-xl p-3 border-l-4 hover:bg-slate-700/50 transition-colors"
                  style={{
                    borderLeftColor:
                      ev.type === 'infografia' ? '#a855f7' :
                      ev.type === 'newsletter' ? '#3b82f6' : '#f59e0b'
                  }}
                >
                  <div className="shrink-0 mt-0.5">
                    {typeIcon(ev.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{ev.title}</p>
                      <span className="text-[10px] text-slate-500">{formatTime(ev.date.toISOString())}</span>
                    </div>
                    {ev.subtitle && (
                      <p className="text-slate-400 text-xs truncate">{ev.subtitle}</p>
                    )}
                  </div>
                  {ev.type === 'infografia' && (
                    <a
                      href={`/infografias`}
                      target="_blank"
                      className="shrink-0 p-1 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
