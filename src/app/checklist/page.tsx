'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { CheckSquare, Square, Printer, ArrowLeft, FileText, Pill, Shield, CreditCard, Smartphone, Plane, MapPin, Phone, Eye, EyeOff } from 'lucide-react';

interface ChecklistCategory {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  items: { id: string; text: string }[];
}

const checklistCategories: ChecklistCategory[] = [
  {
    id: 'documentos',
    name: 'Documentación Esencial',
    shortName: 'Docs',
    icon: <FileText className="w-4 h-4" />,
    items: [
      { id: 'passport', text: 'Pasaporte en vigor (6 meses validez)' },
      { id: 'passport-copy', text: 'Copia pasaporte (física + digital)' },
      { id: 'dni', text: 'DNI o carnet identidad' },
      { id: 'dni-copy', text: 'Copia DNI (física + digital)' },
      { id: 'visa', text: 'Visa si requiere (impresa)' },
      { id: 'esta', text: 'ESTA / eTA / e-Visa' },
      { id: 'flight-tickets', text: 'Billetes avión (ida y vuelta)' },
      { id: 'hotel-booking', text: 'Reserva hotel / alojamiento' },
      { id: 'travel-insurance', text: 'Póliza seguro viaje (impresa + digital)' },
      { id: 'vaccine-cert', text: 'Certificado vacunas' },
      { id: 'driver-license', text: 'Carnet conducir internacional' },
      { id: 'car-rental', text: 'Reserva alquiler coche' },
      { id: 'train-tickets', text: 'Billetes tren / bus' },
      { id: 'event-tickets', text: 'Entradas eventos' },
    ]
  },
  {
    id: 'legales',
    name: 'Aspectos Legales',
    shortName: 'Legales',
    icon: <Shield className="w-4 h-4" />,
    items: [
      { id: 'visa-check', text: 'Verificar requisitos visado' },
      { id: 'customs', text: 'Regulaciones aduaneras' },
      { id: 'prohibited', text: 'Revisar objetos prohibidos' },
      { id: 'drugs', text: 'Medicamentos: receta médica inglés' },
      { id: 'food', text: 'Productos alimentación permitidos' },
      { id: 'cash-limit', text: 'Límite efectivo Declaración (>10.000$)' },
      { id: 'pets', text: 'Permisos mascotas' },
      { id: 'drone', text: 'Permiso drone si aplica' },
    ]
  },
  {
    id: 'sanitarios',
    name: 'Sanitario / Salud',
    shortName: 'Salud',
    icon: <Pill className="w-4 h-4" />,
    items: [
      { id: 'vaccines', text: 'Vacunas recomendadas/obligatorias' },
      { id: 'insurance-health', text: 'Seguro médico internacional' },
      { id: 'eu-card', text: 'Tarjeta Sanitaria Europea (TSE)' },
      { id: 'medicines', text: 'Medicamentos personales (suficiente)' },
      { id: 'prescription', text: 'Receta médica en inglés' },
      { id: 'first-aid', text: 'Botiquín básico' },
      { id: 'painkillers', text: 'Analgésicos' },
      { id: 'anti-diarrhea', text: 'Antidiarreicos' },
      { id: 'insect', text: 'Repelente insectos' },
      { id: 'sunscreen', text: 'Protector solar' },
      { id: 'altitude', text: 'Medicamentos altitud (si aplica)' },
      { id: 'malaria', text: 'Profilaxis malaria (si aplica)' },
      { id: 'blood-type', text: 'Tipo sangre documentado' },
      { id: 'emergency-contact', text: 'Contacto emergencia médica' },
    ]
  },
  {
    id: 'finanzas',
    name: 'Finanzas / Dinero',
    shortName: 'Dinero',
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      { id: 'cash-local', text: 'Efectivo moneda local' },
      { id: 'cash-euros', text: 'Euros / dólares backup' },
      { id: 'cards', text: 'Tarjetas crédito (aviso banco)' },
      { id: 'cards-2', text: 'Tarjeta secundaria backup' },
      { id: 'atm', text: 'Tarjeta ATM internacional' },
      { id: 'mobile-pay', text: 'Apple Pay / Google Pay configurado' },
      { id: 'budget', text: 'Presupuesto impreso' },
      { id: 'expenses', text: 'Gastos esperados documentados' },
    ]
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    shortName: 'Tech',
    icon: <Smartphone className="w-4 h-4" />,
    items: [
      { id: 'phone', text: 'Móvil cargado + cargador' },
      { id: 'power-bank', text: 'Power bank' },
      { id: 'adapter', text: 'Adaptador corriente país' },
      { id: 'sim', text: 'SIM / eSIM internacional' },
      { id: 'roaming', text: 'Roaming activado' },
      { id: 'wifi', text: 'Datos offline descargados' },
      { id: 'maps', text: 'Mapas offline (Google Maps)' },
      { id: 'translate', text: 'App traducción' },
      { id: 'vpn', text: 'VPN configurada (si requiere)' },
      { id: 'camera', text: 'Cámara fotos' },
      { id: 'laptop', text: 'Portátil / tablet (si trabajo)' },
      { id: 'headphones', text: 'Auriculares' },
    ]
  },
  {
    id: 'equipaje',
    name: 'Equipaje',
    shortName: 'Equipaje',
    icon: <Plane className="w-4 h-4" />,
    items: [
      { id: 'luggage', text: 'Maleta principal' },
      { id: 'carry-on', text: 'Equipaje mano' },
      { id: 'backpack', text: 'Mochila día' },
      { id: 'locks', text: 'Candados maletas' },
      { id: 'tags', text: 'Etiquetas equipaje' },
      { id: 'clothes-weather', text: 'Ropa acorde clima destino' },
      { id: 'clothes-formal', text: 'Ropa formal (si requiere)' },
      { id: 'shoes', text: 'Calzado cómodo' },
      { id: 'umbrella', text: 'Paraguas / impermeable' },
      { id: 'sunglasses', text: 'Gafas sol' },
      { id: 'hat', text: 'Sombrero / gorra' },
    ]
  },
  {
    id: 'hogar',
    name: 'Casa / Vacaciones',
    shortName: 'Casa',
    icon: <MapPin className="w-4 h-4" />,
    items: [
      { id: 'plants', text: 'Plantas regadas / cuidado' },
      { id: 'mail', text: 'Correspondencia detenida' },
      { id: 'lights', text: 'Luces temporizador' },
      { id: 'alarm', text: 'Alarma casa' },
      { id: 'neighbor', text: 'Vecino contacto llaves' },
      { id: 'pets-care', text: 'Cuidado mascotas' },
    ]
  },
  {
    id: 'emergencias',
    name: 'Emergencias',
    shortName: 'Emerg.',
    icon: <Phone className="w-4 h-4" />,
    items: [
      { id: 'embassy', text: 'Embajada país destino' },
      { id: 'family', text: 'Familia notificación viaje' },
      { id: 'bank', text: 'Teléfonos banco (bloqueo cards)' },
      { id: 'insurance', text: 'Tel. aseguradora' },
      { id: 'company', text: 'Empresa / trabajo' },
      { id: 'friend', text: 'Amigo contacto local' },
      { id: 'medical', text: 'Centro médico cercano' },
    ]
  }
];

export default function ChecklistPage() {
  const [activeTab, setActiveTab] = useState('documentos');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(checklistCategories.map(c => c.id)));
  const [printMode, setPrintMode] = useState<'all' | 'current'>('current');
  const printRef = useRef<HTMLDivElement>(null);

  const [checklist, setChecklist] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    checklistCategories.forEach(cat => {
      initial[cat.id] = {};
      cat.items.forEach(item => {
        initial[cat.id][item.id] = false;
      });
    });
    return initial;
  });

  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [notes, setNotes] = useState('');

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: !prev[categoryId][itemId]
      }
    }));
  };

  const toggleSectionVisibility = (categoryId: string) => {
    setVisibleSections(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getCategoryProgress = (categoryId: string) => {
    const category = checklistCategories.find(c => c.id === categoryId);
    if (!category) return 0;
    const checked = category.items.filter(item => checklist[categoryId][item.id]).length;
    return Math.round((checked / category.items.length) * 100);
  };

  const getTotalProgress = () => {
    const total = checklistCategories.reduce((acc, cat) => acc + cat.items.length, 0);
    const checked = checklistCategories.reduce((acc, cat) => {
      return acc + cat.items.filter(item => checklist[cat.id][item.id]).length;
    }, 0);
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  };

  const resetChecklist = () => {
    const initial: Record<string, Record<string, boolean>> = {};
    checklistCategories.forEach(cat => {
      initial[cat.id] = {};
      cat.items.forEach(item => {
        initial[cat.id][item.id] = false;
      });
    });
    setChecklist(initial);
  };

  const printChecklist = () => {
    const sectionsToPrint = printMode === 'all' 
      ? checklistCategories 
      : [checklistCategories.find(c => c.id === activeTab)!];
    
    const printContent = sectionsToPrint
      .map(cat => {
        const checked = cat.items.filter(i => checklist[cat.id][i.id]);
        const unchecked = cat.items.filter(i => !checklist[cat.id][i.id]);
        
        return `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-bottom: 10px;">
              ${cat.icon || ''} ${cat.name}
            </h3>
            ${checked.map(i => `<div style="color: #16a34a;">✓ ${i.text}</div>`).join('')}
            ${unchecked.map(i => `<div style="color: #94a3b8;">☐ ${i.text}</div>`).join('')}
          </div>
        `;
      })
      .join('');

    const header = tripName || destination || dates 
      ? `<div style="margin-bottom: 20px; padding: 10px; background: #f1f5f9; border-radius: 8px;">
          <strong>${tripName || 'Viaje'}</strong> ${destination ? '→ ' + destination : ''} ${dates ? '(' + dates + ')' : ''}
        </div>`
      : '';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Checklist Viaje - ${tripName || destination || 'Viaje con Inteligencia'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
              h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
              h3 { color: #1e293b; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <h1>✈️ Checklist de Viaje</h1>
            ${header}
            ${printContent}
            ${notes ? `<div style="margin-top: 20px;"><h3>Notas:</h3><p>${notes}</p></div>` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const activeCategory = checklistCategories.find(c => c.id === activeTab)!;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as 'all' | 'current')}
              className="bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-600"
            >
              <option value="current">Sección actual</option>
              <option value="all">Todas las secciones</option>
            </select>
            <button
              onClick={resetChecklist}
              className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-xs"
            >
              Reiniciar
            </button>
            <button
              onClick={printChecklist}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pb-3 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {checklistCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === cat.id
                    ? 'bg-blue-600 text-white'
                    : visibleSections.has(cat.id)
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {cat.icon}
                <span className="hidden md:inline">{cat.name}</span>
                <span className="md:hidden">{cat.shortName}</span>
                <span className="ml-1 opacity-70">({getCategoryProgress(cat.id)}%)</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Nombre del viaje"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400"
            />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destino"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400"
            />
            <input
              type="text"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="Fechas"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium text-sm">Progreso total</span>
            <span className="text-white font-bold">{getTotalProgress()}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {checklistCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleSectionVisibility(cat.id)}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                visibleSections.has(cat.id)
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-800 text-slate-500 line-through'
              }`}
            >
              {visibleSections.has(cat.id) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {cat.shortName}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {checklistCategories
            .filter(cat => visibleSections.has(cat.id))
            .map(category => (
              <div 
                key={category.id} 
                id={`section-${category.id}`}
                className={`bg-slate-800 rounded-xl border border-slate-700 overflow-hidden transition-all ${
                  activeTab === category.id ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-80'
                }`}
              >
                <button
                  onClick={() => setActiveTab(category.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">{category.icon}</span>
                    <span className="font-medium text-white">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${getCategoryProgress(category.id)}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs">
                      {category.items.filter(item => checklist[category.id][item.id]).length}/{category.items.length}
                    </span>
                  </div>
                </button>
                
                {activeTab === category.id && (
                  <div className="p-3 grid gap-1.5 border-t border-slate-700">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(category.id, item.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                          checklist[category.id][item.id]
                            ? 'bg-green-500/20 hover:bg-green-500/30'
                            : 'bg-slate-700/50 hover:bg-slate-700'
                        }`}
                      >
                        {checklist[category.id][item.id] ? (
                          <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          checklist[category.id][item.id]
                            ? 'text-green-300 line-through'
                            : 'text-slate-200'
                        }`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
          <h3 className="text-sm font-medium text-white mb-2">Notas personales</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 resize-none"
            placeholder="Añade tus notas, recordatorios especiales..."
          />
        </div>
      </main>

      <style jsx global>{`
        @media print {
          header, .no-print { display: none !important; }
          body { background: white !important; }
          .min-h-screen { min-height: auto !important; }
        }
      `}</style>
    </div>
  );
}