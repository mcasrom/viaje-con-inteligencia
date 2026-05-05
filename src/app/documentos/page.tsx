'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Image, Plane, Hotel, CreditCard, Shield, MapPin, Trash2, Search, FolderOpen, Eye, Download, Plus, X, FileImage, File, Camera } from 'lucide-react';

interface TravelDoc {
  id: string;
  title: string;
  category: 'ticket' | 'hotel' | 'passport' | 'insurance' | 'visa' | 'receipt' | 'photo' | 'other';
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  tripName: string;
  dateAdded: string;
  notes?: string;
}

const CATEGORIES: { id: TravelDoc['category']; label: string; icon: any; color: string; bg: string }[] = [
  { id: 'ticket', label: 'Billetes', icon: Plane, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'hotel', label: 'Hoteles', icon: Hotel, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'passport', label: 'Pasaporte/DNI', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
  { id: 'insurance', label: 'Seguro', icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'visa', label: 'Visados', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'receipt', label: 'Facturas', icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'photo', label: 'Fotos', icon: Camera, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'other', label: 'Otros', icon: FolderOpen, color: 'text-slate-400', bg: 'bg-slate-500/10' },
];

const DB_NAME = 'viaje_docs_db';
const STORE_NAME = 'documents';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDoc(doc: TravelDoc): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(doc);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadDocs(): Promise<TravelDoc[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteDoc(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<TravelDoc[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TravelDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'other' as TravelDoc['category'],
    tripName: '',
    notes: '',
  });

  useEffect(() => {
    loadDocs().then(setDocs).catch(console.error);
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      notify('El archivo es demasiado grande (max 10MB)');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const doc: TravelDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: newDoc.title || file.name,
        category: newDoc.category,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrl,
        tripName: newDoc.tripName || 'General',
        dateAdded: new Date().toISOString(),
        notes: newDoc.notes,
      };
      await saveDoc(doc);
      setDocs(prev => [doc, ...prev]);
      setShowUpload(false);
      setNewDoc({ title: '', category: 'other', tripName: '', notes: '' });
      notify('Documento guardado');
    } catch (e) {
      console.error(e);
      notify('Error al guardar');
    } finally {
      setUploading(false);
    }
  }, [newDoc]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    await deleteDoc(id);
    setDocs(prev => prev.filter(d => d.id !== id));
    notify('Documento eliminado');
  }, []);

  const filtered = docs.filter(d => {
    const matchCategory = filter === 'all' || d.category === filter;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tripName.toLowerCase().includes(search.toLowerCase()) || d.fileName.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const totalSize = docs.reduce((sum, d) => sum + d.fileSize, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-blue-400" />Mis Documentos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {docs.length} documentos · {formatSize(totalSize)} almacenados localmente
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Upload className="w-4 h-4" />Subir documento
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-1.5 bg-slate-800/60 rounded-lg p-1.5 border border-slate-700/50 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${filter === cat.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <cat.icon className="w-3 h-3" />{cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Docs Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{docs.length === 0 ? 'No tienes documentos' : 'Sin resultados'}</h3>
            <p className="text-slate-400 text-sm mb-6">{docs.length === 0 ? 'Sube billetes, hoteles, pasaportes, seguros...' : 'Prueba con otra búsqueda o filtro.'}</p>
            {docs.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Upload className="w-4 h-4" />Subir primer documento
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(doc => {
              const cat = CATEGORIES.find(c => c.id === doc.category);
              const isImage = doc.fileType.startsWith('image/');
              const isPdf = doc.fileType === 'application/pdf';
              return (
                <div key={doc.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-colors group">
                  {/* Preview */}
                  <div className="h-32 bg-slate-700/30 flex items-center justify-center relative overflow-hidden">
                    {isImage ? (
                      <img src={doc.dataUrl} alt={doc.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        {isPdf ? <FileText className="w-10 h-10 text-red-400" /> : <File className="w-10 h-10 text-blue-400" />}
                        <span className="text-slate-500 text-xs">{doc.fileType.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 bg-slate-900/80 rounded-md text-white hover:bg-blue-600"
                        title="Ver"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = doc.dataUrl;
                          a.download = doc.fileName;
                          a.click();
                        }}
                        className="p-1.5 bg-slate-900/80 rounded-md text-white hover:bg-green-600"
                        title="Descargar"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 bg-slate-900/80 rounded-md text-white hover:bg-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {cat && <cat.icon className={`w-4 h-4 ${cat.color} mt-0.5 flex-shrink-0`} />}
                      <div className="min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{doc.title}</h3>
                        <p className="text-slate-500 text-xs">{doc.tripName} · {formatSize(doc.fileSize)}</p>
                      </div>
                    </div>
                    {doc.notes && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{doc.notes}</p>}
                    <p className="text-slate-600 text-[10px] mt-2">{new Date(doc.dateAdded).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />Subir documento
              </h2>
              <button onClick={() => setShowUpload(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Form fields */}
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Título</label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={e => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Billete Madrid-Tokio"
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Categoría</label>
                  <select
                    value={newDoc.category}
                    onChange={e => setNewDoc(prev => ({ ...prev, category: e.target.value as TravelDoc['category'] }))}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 text-sm mb-1 block">Viaje</label>
                  <input
                    type="text"
                    value={newDoc.tripName}
                    onChange={e => setNewDoc(prev => ({ ...prev, tripName: e.target.value }))}
                    placeholder="Ej: Japón 2026"
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Notas (opcional)</label>
                <textarea
                  value={newDoc.notes}
                  onChange={e => setNewDoc(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Referencia de reserva, número de vuelo..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-600/50 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-300 text-sm font-medium">Arrastra un archivo o haz clic</p>
                <p className="text-slate-500 text-xs mt-1">PDF, JPG, PNG, DOC (max 10MB)</p>
              </div>

              {uploading && (
                <div className="text-center text-slate-400 text-sm">
                  Subiendo archivo...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 sticky top-0 bg-slate-800">
              <h2 className="text-lg font-bold text-white">{previewDoc.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewDoc.dataUrl;
                    a.download = previewDoc.fileName;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm hover:bg-green-600/30"
                >
                  <Download className="w-3.5 h-3.5" />Descargar
                </button>
                <button onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5">
              {previewDoc.fileType.startsWith('image/') ? (
                <img src={previewDoc.dataUrl} alt={previewDoc.title} className="w-full rounded-lg" />
              ) : previewDoc.fileType === 'application/pdf' ? (
                <iframe src={previewDoc.dataUrl} className="w-full h-[60vh] rounded-lg bg-white" />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-sm">Vista previa no disponible para este formato.</p>
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = previewDoc.dataUrl;
                      a.download = previewDoc.fileName;
                      a.click();
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    Descargar para ver
                  </button>
                </div>
              )}
              <div className="mt-4 text-slate-400 text-sm space-y-1">
                <p><strong className="text-slate-300">Archivo:</strong> {previewDoc.fileName}</p>
                <p><strong className="text-slate-300">Tamaño:</strong> {formatSize(previewDoc.fileSize)}</p>
                <p><strong className="text-slate-300">Viaje:</strong> {previewDoc.tripName}</p>
                <p><strong className="text-slate-300">Fecha:</strong> {new Date(previewDoc.dateAdded).toLocaleDateString('es-ES')}</p>
                {previewDoc.notes && <p><strong className="text-slate-300">Notas:</strong> {previewDoc.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium">
          {notification}
        </div>
      )}
    </div>
  );
}
