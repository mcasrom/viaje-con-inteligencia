'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Camera, Image, FileText, X, Plane, Building, Ticket, Trash2, Download, Upload, Phone, StickyNote, ArrowLeft, Home } from 'lucide-react';
import { addDocument, getDocuments, deleteDocument, getAllDocuments, exportToZip } from '@/lib/travel-documents';

interface TravelDocument {
  id?: number;
  type: 'ticket' | 'vuelo' | 'hotel' | 'nota' | 'ref';
  createdAt: Date;
  imageData?: string;
  text: string;
  title: string;
}

const DOC_TYPES = [
  { id: 'vuelo', label: 'Vuelo', icon: Plane, color: 'bg-blue-500' },
  { id: 'hotel', label: 'Hotel', icon: Building, color: 'bg-purple-500' },
  { id: 'ticket', label: 'Ticket', icon: Ticket, color: 'bg-green-500' },
  { id: 'nota', label: 'Nota', icon: FileText, color: 'bg-orange-500' },
  { id: 'ref', label: 'Referencia', icon: Phone, color: 'bg-cyan-500' },
];

export default function TravelDocumentsPage() {
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<TravelDocument | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [newDocType, setNewDocType] = useState<'nota' | 'ref'>('nota');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await getDocuments(filter);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCaptureImage = (type: 'vuelo' | 'hotel' | 'ticket') => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.docType = type;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docType = (e.target.dataset.docType || 'ticket') as 'vuelo' | 'hotel' | 'ticket';
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result as string;
      const fileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      await addDocument({
        type: docType,
        title: fileName || `${docType} - ${new Date().toLocaleDateString('es-ES')}`,
        text: '',
        imageData,
        createdAt: new Date(),
      });
      loadDocuments();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleNoteSave = async () => {
    if (!noteText.trim()) return;
    await addDocument({
      type: newDocType,
      title: noteText.substring(0, 50) + (noteText.length > 50 ? '...' : ''),
      text: noteText,
      createdAt: new Date(),
    });
    setShowNoteInput(false);
    setNoteText('');
    loadDocuments();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar documento?')) return;
    await deleteDocument(id);
    setSelectedDoc(null);
    loadDocuments();
  };

  const handleExport = async () => {
    if (documents.length === 0) {
      alert('No hay documentos para exportar');
      return;
    }
    
    const blob = await exportToZip();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viaje-documentos-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getTypeInfo = (type: string) => DOC_TYPES.find(t => t.id === type) || DOC_TYPES[3];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        data-doc-type=""
        onChange={handleFileChange}
      />

      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-full hover:bg-slate-700 text-sm">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </a>
          <div>
            <h1 className="text-2xl font-bold">Memoria de Viaje</h1>
            <p className="text-slate-400 text-sm">PREMIUM</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleCaptureImage('ticket')}
            className="p-2 bg-blue-600 rounded-full"
            title="Subir imagen"
          >
            <Upload className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setNewDocType('nota'); setShowNoteInput(true); }}
            className="p-2 bg-orange-600 rounded-full"
            title="Nueva nota"
          >
            <StickyNote className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setNewDocType('ref'); setShowNoteInput(true); }}
            className="p-2 bg-cyan-600 rounded-full"
            title="Nueva referencia (tlfn, direccion, etc)"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-slate-800 rounded-full"
            title="Exportar"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="bg-slate-800/50 rounded-xl p-3 mb-4 text-xs">
        <p className="text-slate-300">
          <span className="text-blue-400 font-bold">↑</span> imagen · 
          <span className="text-orange-400 font-bold">📝</span> nota · 
          <span className="text-cyan-400 font-bold">☎</span> ref · 
          <span className="text-slate-400 font-bold">↓</span> backup
        </p>
        <p className="mt-1 text-slate-500">
          Formatos: JPG, PNG, WebP | Max 5MB | <span className="text-red-400">Local solo - sin nube</span>
        </p>
        <p className="text-red-400 mt-1">
          ⚠ Si pierdes el dispositivo, pierdes TODO. Exporta backup regularmente.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
            filter === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          Todos
        </button>
        {DOC_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filter === type.id ? `${type.color} text-white` : 'bg-slate-800 text-slate-400'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <Upload className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 mb-2">Sin documentos</p>
          <p className="text-slate-600 text-sm">Toca + para añadir tu primer documento</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {documents.map((doc) => {
            const typeInfo = getTypeInfo(doc.type);
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="bg-slate-900 rounded-xl overflow-hidden text-left transition hover:ring-2 hover:ring-blue-500/50"
              >
                {doc.imageData ? (
                  <div className="aspect-[4/3] bg-slate-800">
                    <img src={doc.imageData} alt={doc.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`aspect-[4/3] ${typeInfo.color} flex items-center justify-center`}>
                    <typeInfo.icon className="w-12 h-12 text-white/80" />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${typeInfo.color}`} />
                    <span className="text-xs text-slate-400">{typeInfo.label}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(doc.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3">
        {showTypeMenu && (
          <div className="mb-2 flex flex-col gap-2">
            <button
              onClick={() => { handleCaptureImage('vuelo'); setShowTypeMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition"
            >
              <Plane className="w-5 h-5" />
              <span className="font-medium">Vuelo</span>
            </button>
            <button
              onClick={() => { setShowNoteInput(true); setShowTypeMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg transition"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Nota</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className={`w-14 h-14 rounded-full shadow-lg transition ${
            showTypeMenu ? 'bg-slate-700' : 'bg-blue-500 hover:bg-blue-600'
          } flex items-center justify-center`}
        >
          {showTypeMenu ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {showNoteInput && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center p-4">
          <div className="w-full bg-slate-900 rounded-2xl p-4">
            <h3 className="text-lg font-bold mb-4">
              {newDocType === 'ref' ? 'Nueva Referencia' : 'Nueva Nota'}
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              {newDocType === 'ref' 
                ? 'Escribe: telefono, direccion, email, contacto emergencia...' 
                : 'Escribe: notas sobre tu viaje, recordatorios, lo que sea...'}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={newDocType === 'ref' ? 'Hotel: +34 600 000 000\nEmergencia: 112\nDirección: Calle...' : 'Escribe tu nota...'}
              className="w-full h-48 bg-slate-800 rounded-xl p-4 text-white placeholder-slate-500 resize-none"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNoteInput(false)}
                className="flex-1 py-3 bg-slate-800 rounded-full text-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleNoteSave}
                className="flex-1 py-3 bg-blue-500 rounded-full font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl overflow-hidden">
            {selectedDoc.imageData && (
              <div className="bg-black">
                <img src={selectedDoc.imageData} alt={selectedDoc.title} className="w-full max-h-[60vh] object-contain" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-3 h-3 rounded-full ${getTypeInfo(selectedDoc.type).color}`} />
                <span className="text-sm text-slate-400">{DOC_TYPES.find(t => t.id === selectedDoc.type)?.label}</span>
              </div>
              <h3 className="text-lg font-bold">{selectedDoc.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{formatDate(selectedDoc.createdAt)}</p>
              {selectedDoc.text && (
                <p className="text-slate-300 mt-3">{selectedDoc.text}</p>
              )}
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 py-3 bg-slate-800 rounded-full"
              >
                Cerrar
              </button>
              <button
                onClick={() => selectedDoc.id && handleDelete(selectedDoc.id)}
                className="px-4 py-3 bg-red-500/20 text-red-400 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>AVISO: Docs guardados localmente. Sin copia en la nube.</p>
        <p className="text-red-400">Si pierdes el dispostivo, pierdes TODO. Exporta regularmente.</p>
        <p className="mt-1 text-slate-600">Formats: JPG, PNG, WebP | Max 5MB</p>
      </div>
    </div>
  );
}