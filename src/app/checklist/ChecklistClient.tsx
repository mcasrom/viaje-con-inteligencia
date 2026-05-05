'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Download, Printer, Share2, ChevronDown, ChevronUp, FileText, Shield, Wallet, Smartphone, Briefcase, Heart, Zap, AlertTriangle, Star } from 'lucide-react';

interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;
  iconLucide: any;
  color: string;
  bg: string;
  border: string;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  checked?: boolean;
  priority?: 'essential' | 'important' | 'optional';
  tip?: string;
}

const INITIAL_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'documentos',
    title: 'Documentos',
    icon: '📄',
    iconLucide: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    items: [
      { id: 'd1', text: 'Pasaporte vigente (mínimo 6 meses)', priority: 'essential', tip: 'Comprueba la fecha de caducidad antes de salir' },
      { id: 'd2', text: 'DNI / Identificación', priority: 'essential' },
      { id: 'd3', text: 'Visado de entrada (si aplica)', priority: 'essential', tip: 'Consulta requisitos en consulado o embajada' },
      { id: 'd4', text: 'Billetes de avión (confirmación)', priority: 'essential' },
      { id: 'd5', text: 'Reserva de hotel / alojamiento', priority: 'essential' },
      { id: 'd6', text: 'Póliza de seguro de viaje', priority: 'essential' },
      { id: 'd7', text: 'Carnet de conducir internacional', priority: 'important', tip: 'Necesario si piensas alquilar coche en ciertos países' },
      { id: 'd8', text: 'Fotos carnet recientes (2-4)', priority: 'important' },
      { id: 'd9', text: 'Autorización de viaje para menores', priority: 'important', tip: 'Obligatorio si viajas con niños sin el otro progenitor' },
      { id: 'd10', text: 'Copia de documento de identidad', priority: 'important' },
      { id: 'd11', text: 'Tarjeta sanitaria europea (EHIC)', priority: 'optional', tip: 'Solo para países de la UE/EEE' },
      { id: 'd12', text: 'Certificado de vacunación', priority: 'optional' },
      { id: 'd13', text: 'Permiso de conducir nacional', priority: 'optional' },
    ],
  },
  {
    id: 'tecnologia',
    title: 'Tecnología',
    icon: '💻',
    iconLucide: Smartphone,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    items: [
      { id: 't1', text: 'Móvil + cargador original', priority: 'essential' },
      { id: 't2', text: 'Power bank / batería portátil', priority: 'essential', tip: 'Mínimo 10.000mAh para viajes largos' },
      { id: 't3', text: 'Adaptador de enchufes universal', priority: 'essential', tip: 'Revisa el voltaje del destino (110V/220V)' },
      { id: 't4', text: 'eSIM o roaming activado', priority: 'essential', tip: 'Activa roaming o compra eSIM local antes de salir' },
      { id: 't5', text: 'Mapas offline descargados', priority: 'essential', tip: 'Google Maps offline o Maps.me' },
      { id: 't6', text: 'VPN configurada', priority: 'important', tip: 'Útil en países con censura o redes públicas' },
      { id: 't7', text: 'Auriculares (con/sin cable)', priority: 'important' },
      { id: 't8', text: 'Cámara de fotos + tarjetas memoria', priority: 'optional' },
      { id: 't9', text: 'Portátil / Tablet', priority: 'optional' },
      { id: 't10', text: 'Kindle / Lector ebook', priority: 'optional' },
      { id: 't11', text: 'Cable USB extra / hub multipuerto', priority: 'optional' },
      { id: 't12', text: 'Backup cloud de fotos y documentos', priority: 'essential', tip: 'Sube todo a Google Drive, Dropbox o iCloud antes de salir' },
    ],
  },
  {
    id: 'salud',
    title: 'Salud y Farmacia',
    icon: '💊',
    iconLucide: Heart,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    items: [
      { id: 's1', text: 'Medicamentos habituales (cantidad suficiente)', priority: 'essential', tip: 'Lleva receta médica para aduanas si es necesario' },
      { id: 's2', text: 'Botiquín básico de viaje', priority: 'essential' },
      { id: 's3', text: 'Ibuprofeno / Paracetamol', priority: 'essential' },
      { id: 's4', text: 'Antidiarreicos (Fortasec, Smecta)', priority: 'essential' },
      { id: 's5', text: 'Tiritas / vendas', priority: 'important' },
      { id: 's6', text: 'Repelente de mosquitos', priority: 'important' },
      { id: 's7', text: 'Protector solar (SPF 30+)', priority: 'important' },
      { id: 's8', text: 'Crema hidratante / after-sun', priority: 'optional' },
      { id: 's9', text: 'Vacunas actualizadas (destino específico)', priority: 'essential', tip: 'Consulta vacunas recomendadas en Sanidad Exterior' },
      { id: 's10', text: 'Pastillas para mareo / altitud', priority: 'optional' },
      { id: 's11', text: 'Gotas para ojos / lentillas', priority: 'optional' },
      { id: 's12', text: 'Termómetro pequeño', priority: 'optional' },
    ],
  },
  {
    id: 'finanzas',
    title: 'Finanzas y Dinero',
    icon: '💳',
    iconLucide: Wallet,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    items: [
      { id: 'f1', text: 'Tarjeta de crédito (sin comisiones extranjeras)', priority: 'essential', tip: 'Revolut, N26 o similar evitan comisiones de cambio' },
      { id: 'f2', text: 'Tarjeta de débito', priority: 'essential' },
      { id: 'f3', text: 'Efectivo en moneda local', priority: 'essential', tip: 'Cambia algo antes de salir, el resto en destino' },
      { id: 'f4', text: 'Efectivo en euros (respaldo)', priority: 'important' },
      { id: 'f5', text: 'App de banca móvil instalada', priority: 'essential' },
      { id: 'f6', text: 'Notificar al banco del viaje', priority: 'important', tip: 'Evita que bloqueen tu tarjeta por uso en extranjero' },
      { id: 'f7', text: 'Aumentar límite de tarjeta si es necesario', priority: 'optional' },
      { id: 'f8', text: 'Comprobar comisiones de cambio', priority: 'important' },
      { id: 'f9', text: 'Guardar PIN de tarjetas en lugar seguro', priority: 'optional' },
      { id: 'f10', text: 'Presupuesto de viaje calculado', priority: 'important' },
    ],
  },
  {
    id: 'equipaje',
    title: 'Equipaje y Ropa',
    icon: '🧳',
    iconLucide: Briefcase,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    items: [
      { id: 'e1', text: 'Maleta / Mochila (revisar peso aerolínea)', priority: 'essential', tip: 'Ryanair: 10kg mano. EasyJet: 15kg' },
      { id: 'e2', text: 'Ropa interior (días de viaje + 1 extra)', priority: 'essential' },
      { id: 'e3', text: 'Calcetines', priority: 'essential' },
      { id: 'e4', text: 'Camisetas (algodón o secado rápido)', priority: 'essential' },
      { id: 'e5', text: 'Pantalones cortos y largos', priority: 'essential' },
      { id: 'e6', text: 'Chaqueta / Cortavientos', priority: 'essential', tip: 'Adapta al clima del destino' },
      { id: 'e7', text: 'Calzado cómodo (andando mucho)', priority: 'essential' },
      { id: 'e8', text: 'Ropa de dormir', priority: 'essential' },
      { id: 'e9', text: 'Traje de baño (si aplica)', priority: 'optional' },
      { id: 'e10', text: 'Gafas de sol', priority: 'important' },
      { id: 'e11', text: 'Sombrero / Gorra', priority: 'optional' },
      { id: 'e12', text: 'Ropa formal (si hay eventos especiales)', priority: 'optional' },
      { id: 'e13', text: 'Bolsas de compresión para ropa', priority: 'optional' },
      { id: 'e14', text: 'Candado TSA para maleta', priority: 'important' },
      { id: 'e15', text: 'Etiqueta de identificación en maleta', priority: 'important' },
    ],
  },
  {
    id: 'aseo',
    title: 'Aseo Personal',
    icon: '🧴',
    iconLucide: Star,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    items: [
      { id: 'a1', text: 'Cepillo de dientes + pasta', priority: 'essential' },
      { id: 'a2', text: 'Desodorante', priority: 'essential' },
      { id: 'a3', text: 'Champú + acondicionador (formato viaje)', priority: 'essential' },
      { id: 'a4', text: 'Jabón / Gel de baño', priority: 'essential' },
      { id: 'a5', text: 'Toalla de microfibra', priority: 'important', tip: 'Seca rápido, ocupa poco espacio' },
      { id: 'a6', text: 'Peine / Cepillo', priority: 'essential' },
      { id: 'a7', text: 'Crema facial', priority: 'optional' },
      { id: 'a8', text: 'Maquillaje (si aplica)', priority: 'optional' },
      { id: 'a9', text: 'Máquina de afeitar / cuchillas', priority: 'optional' },
      { id: 'a10', text: 'Tijeras de uñas / cortaúñas', priority: 'important' },
      { id: 'a11', text: 'Bolsas herméticas (líquidos en mano)', priority: 'essential', tip: 'Máximo 100ml por envase en equipaje de mano' },
    ],
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: '🛡️',
    iconLucide: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    items: [
      { id: 'sg1', text: 'Copias digitales de documentos (cloud)', priority: 'essential', tip: 'Envíate copia por email o sube a Google Drive' },
      { id: 'sg2', text: 'Registro de viajes en MAEC', priority: 'essential', tip: 'Registra tu viaje en el Ministerio de Exteriores' },
      { id: 'sg3', text: 'Contactos de emergencia guardados', priority: 'essential' },
      { id: 'sg4', text: 'Dirección y teléfono de embajada/consulado', priority: 'important' },
      { id: 'sg5', text: 'Notificar a familia/amigos del itinerario', priority: 'important' },
      { id: 'sg6', text: 'Seguro de cancelación de viaje', priority: 'important' },
      { id: 'sg7', text: 'Comprobar nivel de riesgo del destino', priority: 'essential', tip: 'Consulta el nivel MAEC en viajeinteligencia.com' },
      { id: 'sg8', text: 'Código de seguridad del hotel', priority: 'optional' },
      { id: 'sg9', text: 'App de traducción offline', priority: 'important' },
    ],
  },
  {
    id: 'ultimo',
    title: 'Último Minuto',
    icon: '⏰',
    iconLucide: Zap,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    items: [
      { id: 'u1', text: 'Check-in online del vuelo', priority: 'essential', tip: '24h antes del vuelo, evita colas' },
      { id: 'u2', text: 'Revisar peso del equipaje', priority: 'essential' },
      { id: 'u3', text: 'Consultar clima del destino', priority: 'important' },
      { id: 'u4', text: 'Aprender frases básicas del idioma local', priority: 'important' },
      { id: 'u5', text: 'Descargar apps útiles del destino', priority: 'important' },
      { id: 'u6', text: 'Vaciar nevera y cerrar grifos en casa', priority: 'optional' },
      { id: 'u7', text: 'Programar correo de ausencia', priority: 'optional' },
      { id: 'u8', text: 'Cerrar ventanas y persianas', priority: 'essential' },
      { id: 'u9', text: 'Sacar basura antes de salir', priority: 'essential' },
      { id: 'u10', text: 'Regar plantas / alimentar mascotas', priority: 'essential' },
      { id: 'u11', text: 'Confirmar transporte al aeropuerto', priority: 'essential' },
      { id: 'u12', text: 'Llevar snacks para el vuelo', priority: 'optional' },
    ],
  },
];

export default function ChecklistClient() {
  const [categories, setCategories] = useState<ChecklistCategory[]>(INITIAL_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL_CATEGORIES.map(c => [c.id, true]))
  );
  const [filter, setFilter] = useState<'all' | 'unchecked' | 'essential'>('all');

  const toggleItem = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : cat
      )
    );
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkAll = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.map(item => ({ ...item, checked: true })) }
          : cat
      )
    );
  };

  const uncheckAll = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.map(item => ({ ...item, checked: false })) }
          : cat
      )
    );
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce((sum, cat) => sum + cat.items.filter(i => i.checked).length, 0);
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const filteredCategories = categories.map(cat => {
    let items = cat.items;
    if (filter === 'unchecked') items = items.filter(i => !i.checked);
    if (filter === 'essential') items = items.filter(i => i.priority === 'essential');
    return { ...cat, items };
  }).filter(cat => cat.items.length > 0);

  const priorityBadge = (priority?: string) => {
    switch (priority) {
      case 'essential': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium border border-red-500/30">Esencial</span>;
      case 'important': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">Importante</span>;
      case 'optional': return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400 font-medium border border-slate-500/30">Opcional</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Volver al inicio
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">📋 Checklist de Viaje</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Lista completa para organizar tu viaje. {totalItems} items en {categories.length} categorías. Marca lo que ya tienes listo.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-bold text-lg">Progreso del viaje</span>
            <span className="text-slate-400 text-sm">{checkedItems}/{totalItems} completados</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 15 && <span className="text-white text-xs font-bold">{progress}%</span>}
            </div>
          </div>
          {progress === 100 && (
            <div className="mt-3 text-center text-emerald-400 text-sm font-medium">
              🎉 ¡Todo listo! Buen viaje.
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/60 rounded-lg p-1.5 border border-slate-700/50">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Todos ({totalItems})
          </button>
          <button
            onClick={() => setFilter('unchecked')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unchecked' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Pendientes ({totalItems - checkedItems})
          </button>
          <button
            onClick={() => setFilter('essential')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'essential' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Esenciales
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />Imprimir
          </button>
          <a
            href="/api/checklist-pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 border border-blue-500/30 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />Descargar HTML
          </a>
          <button
            onClick={() => {
              const text = `📋 Mi checklist de viaje: ${checkedItems}/${totalItems} completados (${progress}%). Prepárate en viajeinteligencia.com/checklist`;
              navigator.clipboard?.writeText(text);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />Compartir
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {filteredCategories.map(cat => {
            const catChecked = cat.items.filter(i => i.checked).length;
            const catTotal = cat.items.length;
            const isExpanded = expandedCategories[cat.id] !== false;
            const IconLucide = cat.iconLucide;

            return (
              <div key={cat.id} className={`bg-slate-800/60 rounded-xl border ${cat.border} overflow-hidden`}>
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div className="text-left">
                      <h2 className={`font-bold ${cat.color}`}>{cat.title}</h2>
                      <p className="text-slate-500 text-xs">{catChecked}/{catTotal} completados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {catTotal > 0 && (
                      <div className="w-20 bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${catTotal === catChecked ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${(catChecked / catTotal) * 100}%` }}
                        />
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-700/30 p-4">
                    {/* Category Actions */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => checkAll(cat.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Marcar todo
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        onClick={() => uncheckAll(cat.id)}
                        className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        Desmarcar todo
                      </button>
                    </div>

                    {/* Items */}
                    <div className="space-y-1">
                      {cat.items.map(item => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                            item.checked ? 'bg-emerald-500/5' : 'hover:bg-slate-700/30'
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(cat.id, item.id)}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {item.checked ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-white'}`}>
                              {item.text}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {priorityBadge(item.priority)}
                              {item.tip && (
                                <span className="text-[10px] text-slate-500" title={item.tip}>💡 {item.tip}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Tip */}
        <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-5 text-center">
          <AlertTriangle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <h3 className="text-white font-bold mb-1">¿No sabes a dónde ir?</h3>
          <p className="text-slate-400 text-sm mb-3">Usa nuestro comparador de destinos y encuentra el viaje perfecto según seguridad, coste y clima.</p>
          <Link href="/decidir" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Descubrir destinos →
          </Link>
        </div>
      </div>
    </div>
  );
}
