'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckSquare, Square, Printer, ArrowLeft, FileText, Pill, Shield, CreditCard, Smartphone, Plane, MapPin, Phone } from 'lucide-react';

interface ChecklistCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: { id: string; text: string }[];
}

const checklistCategories: ChecklistCategory[] = [
  {
    id: 'documentos',
    name: 'Documentación Esencial',
    icon: <FileText className="w-5 h-5" />,
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
    icon: <Shield className="w-5 h-5" />,
    items: [
      { id: 'visa-check', text: 'Verificar requisitos visado' },
      { id: 'customs', text: '了解海关规定 (Customs regulations)' },
      { id: 'prohibited', text: 'Revisar objetos prohibidos' },
      { id: 'drugs', text: 'Medicamentos: receta médica inglés' },
      { id: 'food', text: 'Productos alimentación permits' },
      { id: 'cash-limit', text: 'Límite efectivo Declaración (>10.000$)' },
      { id: 'pets', text: 'Permisos mascotas' },
      { id: 'drone', text: 'Permiso drone si aplica' },
    ]
  },
  {
    id: 'sanitarios',
    name: 'Sanitarios / Salud',
    icon: <Pill className="w-5 h-5" />,
    items: [
      { id: 'vaccines', text: 'Vacunas recomendadas/obligatorias' },
      { id: 'insurance-health', text: 'Seguro médico internacional' },
      { id: 'eu-card', text: 'Tarjeta Sanitaria Europea (TSE)' },
      { id: 'medicines', text: 'Medicamentos personales (suficiente)' },
      { id: 'prescription', text: 'Receta médica en inglés' },
      { id: 'first-aid', text: 'Botiquín básico' },
      { id: 'painkillers', text: 'Analgésicos' },
      { id: 'anti diarrhea', text: 'Antidiarreicos' },
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
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      { id: 'cash-local', text: 'Efectivo moneda local' },
      { id: 'cash-euros', text: 'Euros / dólares备用' },
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
    icon: <Smartphone className="w-5 h-5" />,
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
    icon: <Plane className="w-5 h-5" />,
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
    icon: <MapPin className="w-5 h-5" />,
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
    name: 'Contactos Emergencia',
    icon: <Phone className="w-5 h-5" />,
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

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: !prev[categoryId][itemId]
      }
    }));
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
    return Math.round((checked / total) * 100);
  };

  const printChecklist = () => {
    window.print();
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

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex gap-2 no-print">
            <button
              onClick={resetChecklist}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              Reiniciar
            </button>
            <button
              onClick={printChecklist}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Checklist de Viaje</h1>
          <p className="text-slate-400">Prepara tu viaje con inteligencia. Marca los elementos completados.</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700 no-print">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Nombre del viaje</label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Vacaciones de verano..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Destino</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Japón"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Fechas</label>
              <input
                type="text"
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="15-30 Julio 2026"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Progreso total</span>
            <span className="text-white font-bold text-xl">{getTotalProgress()}%</span>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
          <p className="text-white/80 text-sm mt-2">
            {checklistCategories.reduce((acc, cat) => acc + cat.items.filter(item => checklist[cat.id][item.id]).length, 0)} de{' '}
            {checklistCategories.reduce((acc, cat) => acc + cat.items.length, 0)} elementos completados
          </p>
        </div>

        <div className="space-y-6">
          {checklistCategories.map((category) => (
            <div key={category.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-700/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400">{category.icon}</span>
                  <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${getCategoryProgress(category.id)}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-10 text-right">
                    {category.items.filter(item => checklist[category.id][item.id]).length}/{category.items.length}
                  </span>
                </div>
              </div>
              <div className="p-4 grid gap-2">
                {category.items.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors no-print ${
                      checklist[category.id][item.id]
                        ? 'bg-green-500/20 hover:bg-green-500/30'
                        : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(category.id, item.id)}
                      className="flex-shrink-0"
                    >
                      {checklist[category.id][item.id] ? (
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                    <span className={`${
                      checklist[category.id][item.id]
                        ? 'text-green-300 line-through'
                        : 'text-slate-200'
                    }`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700 no-print">
          <h3 className="text-lg font-semibold text-white mb-4">Notas personales</h3>
          <textarea
            className="w-full h-32 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
            placeholder="Añade tus notas, recordatorios especiales, números importantes..."
          />
        </div>
      </main>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          .bg-slate-900 {
            background: white !important;
          }
          .bg-slate-800 {
            background: #f8fafc !important;
            border-color: #e2e8f0 !important;
          }
          .bg-slate-700 {
            background: #f1f5f9 !important;
          }
          .bg-slate-700\\/50 {
            background: #e2e8f0 !important;
          }
          .bg-green-500\\/20 {
            background: #dcfce7 !important;
          }
          .text-white {
            color: #1e293b !important;
          }
          .text-slate-400 {
            color: #64748b !important;
          }
          .text-slate-200 {
            color: #334155 !important;
          }
          .text-blue-400 {
            color: #3b82f6 !important;
          }
          .text-green-500 {
            color: #22c55e !important;
          }
          .text-green-300 {
            color: #16a34a !important;
          }
          .border-slate-700 {
            border-color: #cbd5e1 !important;
          }
          .rounded-xl {
            border-radius: 0.5rem !important;
          }
          .from-blue-600 {
            --tw-gradient-from: #3b82f6 !important;
          }
          .to-purple-600 {
            --tw-gradient-to: #a855f7 !important;
          }
          .bg-gradient-to-r {
            background: #f1f5f9 !important;
          }
          .text-white\\/80 {
            color: #475569 !important;
          }
          h1, h2, h3 {
            color: #1e293b !important;
          }
          label[style] {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
