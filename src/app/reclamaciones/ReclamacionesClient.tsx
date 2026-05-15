'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Crown, Download, Share2, Plane, Building, Hotel, Car, Bus, AlertTriangle, Clock, Check, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const CLAIM_TYPES = [
  { value: 'retraso', label: 'Retraso de vuelo', icon: <Clock className="w-4 h-4" />, desc: '+3h, +5h, cancelación' },
  { value: 'cancelacion', label: 'Cancelación', icon: <AlertTriangle className="w-4 h-4" />, desc: 'Vuelo, hotel, tour' },
  { value: 'overbooking', label: 'Overbooking', icon: <Plane className="w-4 h-4" />, desc: 'Denegado embarque' },
  { value: 'equipaje', label: 'Equipaje dañado/perdido', icon: <FileText className="w-4 h-4" />, desc: 'Maleta perdida o dañada' },
  { value: 'hotel', label: 'Incumplimiento hotel', icon: <Hotel className="w-4 h-4" />, desc: 'No conforme, overbooking' },
  { value: 'agencia', label: 'Agencia de viajes', icon: <Building className="w-4 h-4" />, desc: 'Servicio no contratado' },
  { value: 'alquiler', label: 'Alquiler de coche', icon: <Car className="w-4 h-4" />, desc: 'Problemas con reserva' },
  { value: 'otro', label: 'Otro', icon: <Bus className="w-4 h-4" />, desc: 'Cualquier incidencia' },
];

const ESTIMATED_COMPENSATION: Record<string, { range: string; cond: string }> = {
  retraso: { range: '250€ – 600€', cond: 'según distancia + duración retraso' },
  cancelacion: { range: '250€ – 600€', cond: 'según distancia y preaviso' },
  overbooking: { range: '250€ – 600€', cond: 'según distancia del vuelo' },
  equipaje: { range: 'hasta ~1.600€', cond: 'según Convenio Montreal' },
  hotel: { range: '50% – 100%', cond: 'según noche/no conforme' },
  agencia: { range: 'variable', cond: 'según incumplimiento + daños' },
  alquiler: { range: '50% – 100%', cond: 'según días afectados' },
  otro: { range: 'variable', cond: 'según normativa aplicable' },
};

const DOCUMENT_CHECKLIST: Record<string, string[]> = {
  retraso: ['Tarjeta de embarque', 'Confirmación de reserva', 'Factura/justificante de pago', 'Comunicación con aerolínea', 'Foto pantalla estado vuelo'],
  cancelacion: ['Confirmación de cancelación (email/SMS)', 'Reserva original', 'Factura', 'Comunicación con aerolínea/agencia', 'Gastos incurridos (hotel, taxi...)'],
  overbooking: ['Tarjeta de embarque', 'Confirmación de reserva con asiento', 'Documento denegación embarque', 'Oferta de compensación (si aplica)', 'Nuevo billete/factura'],
  equipaje: ['PIR (Property Irregularity Report)', 'Tarjeta de embarque', 'Etiqueta equipaje', 'Factura contenido perdido', 'Fotos daños'],
  hotel: ['Confirmación reserva', 'Factura', 'Fotos incidencia', 'Email comunicación con hotel', 'Gastos alternativos'],
  agencia: ['Contrato/servicio contratado', 'Factura', 'Email reclamación previa', 'Fotos/evidencias', 'Comunicaciones con agencia'],
  alquiler: ['Reserva alquiler', 'Contrato firmado', 'Fotos daños', 'Factura', 'Acta entrega vehículo'],
  otro: ['Toda documentación relacionada', 'Facturas y justificantes', 'Comunicaciones con la empresa'],
};

const NEXT_STEPS: Record<string, { label: string; url: string }[]> = {
  retraso: [
    { label: 'Reclamación AESA (Agencia Estatal de Seguridad Aérea)', url: 'https://sede.aesa.gob.es/sede/' },
    { label: 'Centro Europeo del Consumidor (CEC)', url: 'https://cec.consumo.gob.es/' },
  ],
  cancelacion: [
    { label: 'Reclamación AESA', url: 'https://sede.aesa.gob.es/sede/' },
    { label: 'OMIC (Oficina Municipal de Información al Consumidor)', url: 'https://www.consumo.gob.es/' },
  ],
  overbooking: [
    { label: 'Reclamación AESA', url: 'https://sede.aesa.gob.es/sede/' },
    { label: 'Centro Europeo del Consumidor', url: 'https://cec.consumo.gob.es/' },
  ],
  equipaje: [
    { label: 'Reclamación AESA', url: 'https://sede.aesa.gob.es/sede/' },
    { label: 'Convenio Montreal — modelo reclamación', url: 'https://www.mundojuridico.com/' },
  ],
  hotel: [
    { label: 'OMIC / Junta Arbitral de Consumo', url: 'https://www.consumo.gob.es/' },
    { label: 'Dirección General de Turismo (CCAA)', url: 'https://www.turismo.gob.es/' },
  ],
  agencia: [
    { label: 'OMIC / Junta Arbitral de Consumo', url: 'https://www.consumo.gob.es/' },
    { label: 'Dirección General de Consumo', url: 'https://www.consumo.gob.es/' },
  ],
  alquiler: [
    { label: 'OMIC / Junta Arbitral de Consumo', url: 'https://www.consumo.gob.es/' },
    { label: 'Asociación de Consumidores (OCU, FACUA)', url: 'https://www.ocu.org/' },
  ],
  otro: [
    { label: 'OMIC más cercana', url: 'https://www.consumo.gob.es/' },
    { label: 'Junta Arbitral de Consumo', url: 'https://www.consumo.gob.es/' },
  ],
};

const LEGAL_REFERENCES = {
  retraso: {
    reglamento: 'Reglamento (CE) nº 261/2004 del Parlamento Europeo y del Consejo',
    articulo: 'Artículos 6, 7 y 9',
    compensacion: '250€ (≤1500km), 400€ (1500-3500km), 600€ (>3500km)',
    derecho: 'Asistencia, compensación económica, reembolso o transporte alternativo',
  },
  cancelacion: {
    reglamento: 'Reglamento (CE) nº 261/2004 del Parlamento Europeo y del Consejo',
    articulo: 'Artículos 5, 7 y 8',
    compensacion: '250€ a 600€ según distancia, salvo fuerza mayor o aviso +14 días',
    derecho: 'Reembolso completo, transporte alternativo, asistencia',
  },
  overbooking: {
    reglamento: 'Reglamento (CE) nº 261/2004 del Parlamento Europeo y del Consejo',
    articulo: 'Artículos 4 y 7',
    compensacion: '250€ a 600€ según distancia, más reembolso o vuelo alternativo',
    derecho: 'Compensación inmediata, asistencia, reembolso o re-routing',
  },
  equipaje: {
    reglamento: 'Convenio de Montreal (1999) / Reglamento (CE) nº 2027/97',
    articulo: 'Artículos 17-22 del Convenio de Montreal',
    compensacion: 'Hasta 1.288 DGS (~1.600€) por equipaje facturado',
    derecho: 'Indemnización por pérdida, daño o retraso del equipaje',
  },
  hotel: {
    reglamento: 'Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores)',
    articulo: 'Artículos 60-67 (servicios de viaje combinado)',
    compensacion: 'Reembolso, compensación por diferencia de calidad, daños y perjuicios',
    derecho: 'Servicio conforme a lo contratado o indemnización equivalente',
  },
  agencia: {
    reglamento: 'Real Decreto Legislativo 1/2007 / Directiva (UE) 2015/2302',
    articulo: 'Artículos 151-159 (viajes combinados)',
    compensacion: 'Reembolso total o parcial, indemnización por incumplimiento',
    derecho: 'Ejecución conforme al contrato o resolución con reembolso',
  },
  alquiler: {
    reglamento: 'Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores)',
    articulo: 'Artículos 60-67 (derechos del consumidor)',
    compensacion: 'Reembolso, vehículo equivalente o indemnización por daños',
    derecho: 'Servicio conforme a lo contratado, asistencia y protección',
  },
  otro: {
    reglamento: 'Real Decreto Legislativo 1/2007 (Ley General para la Defensa de los Consumidores)',
    articulo: 'Artículo 60 (derechos generales)',
    compensacion: 'Según la normativa aplicable al caso concreto',
    derecho: 'Derecho a un servicio conforme a lo contratado',
  },
};

export default function ReclamacionesClient() {
  const sub = useSubscription();
  const [step, setStep] = useState<'type' | 'form' | 'preview'>('type');
  const [claimType, setClaimType] = useState('');

  const isPremium = sub.premium;

  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    direccion: '',
    aerolinea: '',
    vuelo: '',
    fecha: '',
    origen: '',
    destino: '',
    horaSalida: '',
    horaLlegada: '',
    retraso: '',
    reserva: '',
    importe: '',
    descripcion: '',
  });

  const legal = claimType ? LEGAL_REFERENCES[claimType as keyof typeof LEGAL_REFERENCES] : null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateBasicText = () => {
    const typeLabel = CLAIM_TYPES.find(t => t.value === claimType)?.label || 'reclamación';
    return `RECLAMACIÓN FORMAL — ${typeLabel.toUpperCase()}

Fecha: ${new Date().toLocaleDateString('es-ES')}

A la atención de: ${formData.aerolinea || '[Nombre de la empresa]'}

Yo, [TU NOMBRE], con DNI [TU DNI],

EXPONGO:

Que con fecha ${formData.fecha || '[FECHA]'}, contraté un servicio de ${typeLabel.toLowerCase()} con referencia de reserva ${formData.reserva || '[REFERENCIA]'}, por un importe de ${formData.importe || '[IMPORTE]'}€.

Descripción de los hechos:
${formData.descripcion || '[DESCRIBIR EL INCUMPLIMIENTO DETALLADAMENTE]'}

SOLICITO:

Que en el plazo de 30 días se proceda al reembolso/compensación correspondiente.

Atentamente,
[TU NOMBRE]
[TU FIRMA]`;
  };

  const generatePremiumText = () => {
    const typeLabel = CLAIM_TYPES.find(t => t.value === claimType)?.label || 'reclamación';
    if (!legal) return generateBasicText();

    return `RECLAMACIÓN FORMAL — ${typeLabel.toUpperCase()}
${'═'.repeat(50)}

FECHA: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
REFERENCIA: ${formData.reserva || '[NÚMERO DE RESERVA/LOCALIZADOR]'}

DESTINATARIO:
  ${formData.aerolinea || '[NOMBRE DE LA AEROLÍNEA / EMPRESA]'}
  Servicio de Atención al Cliente / Hoja de Reclamaciones

────────────────────────────────────────────────
DATOS DEL RECLAMANTE
────────────────────────────────────────────────

  Nombre completo: ${formData.nombre || '[NOMBRE Y APELLIDOS]'}
  DNI/NIE: ${formData.dni || '[DOCUMENTO DE IDENTIDAD]'}
  Domicilio: ${formData.direccion || '[DIRECCIÓN COMPLETA]'}
  Email: ${formData.email || '[CORREO ELECTRÓNICO]'}
  Teléfono: ${formData.telefono || '[TELÉFONO DE CONTACTO]'}

────────────────────────────────────────────────
DATOS DEL SERVICIO CONTRATADO
────────────────────────────────────────────────

  ${claimType === 'hotel' ? 'Hotel' : claimType === 'alquiler' ? 'Empresa de alquiler' : 'Aerolínea/Empresa'}: ${formData.aerolinea || '[NOMBRE]'}
  ${formData.vuelo ? `Vuelo/Nº reserva: ${formData.vuelo}` : `Nº reserva: ${formData.reserva || '[REFERENCIA]'}`}
  Fecha: ${formData.fecha || '[FECHA]'}
  ${formData.origen ? `Origen: ${formData.origen}` : ''}
  ${formData.destino ? `Destino: ${formData.destino}` : ''}
  ${formData.horaSalida ? `Hora salida prevista: ${formData.horaSalida}` : ''}
  ${formData.horaLlegada ? `Hora llegada real: ${formData.horaLlegada}` : ''}
  ${formData.retraso ? `Retraso acumulado: ${formData.retraso}` : ''}
  Importe pagado: ${formData.importe || '[IMPORTE]'}€

────────────────────────────────────────────────
HECHOS
────────────────────────────────────────────────

${formData.descripcion || '[DESCRIBIR CRONOLÓGICAMENTE LOS HECHOS: qué ocurrió, cuándo, cómo le afectó, qué respuesta recibió de la empresa]'}

────────────────────────────────────────────────
FUNDAMENTOS DE DERECHO
────────────────────────────────────────────────

  Reglamento aplicable:
  ${legal.reglamento}

  Artículos de referencia:
  ${legal.articulo}

  Derechos que asisten al reclamante:
  ${legal.derecho}

  Compensación aplicable:
  ${legal.compensacion}

────────────────────────────────────────────────
SOLICITUD
────────────────────────────────────────────────

Por todo lo expuesto, SOLICITO:

1. El reconocimiento de la responsabilidad de ${formData.aerolinea || 'la empresa'} en los hechos descritos.

2. La compensación económica de ${formData.importe || '[IMPORTE]'}€, conforme a lo establecido en:
   • ${legal.reglamento}
   • ${legal.articulo}

3. En caso de no recibir respuesta satisfactoria en el plazo de 30 días naturales, me reservo el derecho de:
   • Presentar reclamación ante la Agencia Estatal de Seguridad Aérea (AESA)
   • Acudir al Centro Europeo del Consumidor (CEC)
   • Iniciar procedimiento arbitral ante la Junta Arbitral de Consumo
   • Ejercitar las acciones judiciales que correspondan

────────────────────────────────────────────────
DOCUMENTACIÓN ADJUNTA
────────────────────────────────────────────────

  □ Billete / Confirmación de reserva
  □ Factura / Justificante de pago
  □ Comunicación con la empresa (emails, mensajes)
  □ Fotografías / Evidencias del incidente
  □ Tarjeta de embarque
  □ Informe PIR (Property Irregularity Report) si aplica

────────────────────────────────────────────────

Lugar y fecha: ${formData.direccion ? formData.direccion.split(',')[formData.direccion.split(',').length - 1]?.trim() || 'España' : 'España'}, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}



Firma: ${formData.nombre || '[TU NOMBRE]'}

────────────────────────────────────────────────
NOTA LEGAL: Esta reclamación se basa en la normativa
vigente de protección al consumidor y derechos de
los pasajeros. No constituye asesoramiento legal
profesional. Para casos complejos, consulte con un
abogado especializado en derecho aeronáutico.
────────────────────────────────────────────────`;
  };

  const previewText = isPremium ? generatePremiumText() : generateBasicText();

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
  };

  if (step === 'type') {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Volver al mapa
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full border border-red-500/20">
              <FileText className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Reclamaciones</span>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">
              Generador de Reclamaciones
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Selecciona el tipo de incidencia y genera tu reclamación formal al instante.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {CLAIM_TYPES.map(t => {
              const comp = ESTIMATED_COMPENSATION[t.value];
              return (
                <button
                  key={t.value}
                  onClick={() => { setClaimType(t.value); setStep('form'); }}
                  className="flex flex-col items-center gap-1 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 hover:border-red-500/50 transition-all text-center group"
                >
                  <div className="text-red-400 group-hover:scale-110 transition-transform">
                    {t.icon}
                  </div>
                  <span className="text-white text-xs font-medium">{t.label}</span>
                  <span className="text-slate-500 text-[10px]">{t.desc}</span>
                  {comp && (
                    <span className="text-amber-400 text-[10px] font-semibold mt-0.5">{comp.range}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Free vs Premium comparison */}
          <div className="grid md:grid-cols-2 gap-4 mt-12">
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Gratuito
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" /> Plantilla genérica</li>
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" /> Datos básicos del incidente</li>
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" /> Copiar al portapapeles</li>
                <li className="flex items-start gap-2 text-slate-600"><X className="w-3 h-3 mt-0.5 shrink-0" /> Sin referencias legales</li>
                <li className="flex items-start gap-2 text-slate-600"><X className="w-3 h-3 mt-0.5 shrink-0" /> Sin datos personales</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/30">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Premium
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /> Documento completo y formal</li>
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /> Referencias legales específicas</li>
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /> Datos personales del reclamante</li>
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /> Sección de fundamentos de derecho</li>
                <li className="flex items-start gap-2"><Check className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /> Descarga PDF + compartir</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => setStep('type')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Cambiar tipo
            </button>
            <span className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-medium">2/3</span>
              <span className="text-red-400 text-sm font-medium">
                {CLAIM_TYPES.find(t => t.value === claimType)?.label}
              </span>
            </span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8">
          {/* Subscription status */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isPremium ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {isPremium ? <Crown className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {isPremium ? 'Premium activo' : 'Plan gratuito'}
            </div>
            {!isPremium && (
              <Link href="/free-trial" className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                Probar gratis →
              </Link>
            )}
          </div>

          <div className="space-y-6">
            {/* Personal data — Premium only */}
            {isPremium && (
              <div className="bg-slate-800/60 rounded-xl p-5 border border-amber-500/20">
                <h3 className="text-amber-400 font-bold text-sm mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Datos del reclamante
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={formData.nombre} onChange={e => handleChange('nombre', e.target.value)} placeholder="Nombre completo" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm" />
                  <input value={formData.dni} onChange={e => handleChange('dni', e.target.value)} placeholder="DNI / NIE" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm" />
                  <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="Email" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm" />
                  <input value={formData.telefono} onChange={e => handleChange('telefono', e.target.value)} placeholder="Teléfono" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm" />
                  <input value={formData.direccion} onChange={e => handleChange('direccion', e.target.value)} placeholder="Dirección completa" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none text-sm sm:col-span-2" />
                </div>
              </div>
            )}

            {/* Incident details */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Detalles del incidente
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={formData.aerolinea} onChange={e => handleChange('aerolinea', e.target.value)} placeholder={claimType === 'hotel' ? 'Nombre del hotel' : claimType === 'alquiler' ? 'Empresa de alquiler' : 'Aerolínea / Empresa'} className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                {claimType !== 'hotel' && claimType !== 'agencia' && claimType !== 'alquiler' && (
                  <input value={formData.vuelo} onChange={e => handleChange('vuelo', e.target.value)} placeholder="Nº vuelo (ej: IB3456)" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                )}
                <input type="date" value={formData.fecha} onChange={e => handleChange('fecha', e.target.value)} className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                <input value={formData.reserva} onChange={e => handleChange('reserva', e.target.value)} placeholder="Nº reserva / Localizador" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                {claimType !== 'hotel' && claimType !== 'agencia' && claimType !== 'alquiler' && (
                  <>
                    <input value={formData.origen} onChange={e => handleChange('origen', e.target.value)} placeholder="Origen (ej: Madrid)" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                    <input value={formData.destino} onChange={e => handleChange('destino', e.target.value)} placeholder="Destino (ej: Roma)" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                  </>
                )}
                {claimType === 'retraso' && (
                  <>
                    <input value={formData.horaSalida} onChange={e => handleChange('horaSalida', e.target.value)} placeholder="Hora salida prevista" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                    <input value={formData.horaLlegada} onChange={e => handleChange('horaLlegada', e.target.value)} placeholder="Hora llegada real" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                    <input value={formData.retraso} onChange={e => handleChange('retraso', e.target.value)} placeholder="Retraso (ej: 4 horas)" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
                  </>
                )}
                <input type="number" step="0.01" value={formData.importe} onChange={e => handleChange('importe', e.target.value)} placeholder="Importe pagado (€)" className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm" />
              </div>
            </div>

            {/* Document checklist */}
            {claimType && DOCUMENT_CHECKLIST[claimType] && (
              <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Documentación recomendada
                </h3>
                <ul className="space-y-1.5">
                  {DOCUMENT_CHECKLIST[claimType].map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-white font-bold text-sm mb-4">Descripción de los hechos</h3>
              <textarea
                value={formData.descripcion}
                onChange={e => handleChange('descripcion', e.target.value)}
                placeholder="Describe qué ocurrió, cuándo, cómo te afectó y qué respuesta recibiste de la empresa..."
                rows={6}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-sm resize-none"
              />
            </div>

            {/* Legal reference preview — Premium */}
            {isPremium && legal && (
              <div className="bg-slate-800/60 rounded-xl p-5 border border-amber-500/20">
                <h3 className="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Marco legal aplicable
                </h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <p><span className="text-slate-500">Reglamento:</span> {legal.reglamento}</p>
                  <p><span className="text-slate-500">Artículos:</span> {legal.articulo}</p>
                  <p><span className="text-slate-500">Compensación:</span> {legal.compensacion}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('preview')}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-500 hover:to-orange-500 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Generar reclamación
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Preview step
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-[1000]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setStep('form')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Editar
          </button>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-medium">3/3</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPremium ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
              {isPremium ? 'Premium' : 'Gratuito'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Vista previa</h2>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition-colors border border-slate-700">
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition-colors border border-slate-700">
              <Share2 className="w-3.5 h-3.5" />
              Compartir
            </button>
            {isPremium && (
              <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white text-xs transition-colors">
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            )}
          </div>
        </div>

        <div className="bg-white text-slate-900 rounded-xl p-8 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto shadow-xl">
          {previewText}
        </div>

        {/* Next steps */}
        {claimType && NEXT_STEPS[claimType] && (
          <div className="mt-6 bg-slate-800/60 rounded-xl p-5 border border-slate-700/50">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              Próximos pasos — ¿dónde reclamar?
            </h3>
            <div className="space-y-2">
              {NEXT_STEPS[claimType].map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Not premium CTA */}
        {!isPremium && (
          <div className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/30 text-center">
            <Crown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <h3 className="text-white font-bold mb-1">¿Quieres la versión completa?</h3>
            <p className="text-slate-400 text-xs mb-3">
              Documento con datos personales, referencias legales específicas y descarga PDF.
            </p>
            <Link href="/free-trial" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl text-sm hover:from-amber-400 hover:to-orange-400 transition-all">
              Probar 7 días gratis
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
