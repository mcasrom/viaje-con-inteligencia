'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { paisesData, getLabelRiesgo, NivelRiesgo } from '@/data/paises';
import { AlertTriangle, Plane, Shield, MapPin, Calendar, ArrowRight, CheckCircle, AlertCircle, Download, Star, FileText, MessageSquare } from 'lucide-react';

const paises = Object.values(paisesData);

const recomendacionesPorNivel: Record<NivelRiesgo, { generales: string[]; documentos: string[]; salud: string[] }> = {
  'sin-riesgo': {
    generales: [
      'Verificar validez pasaporte (6 meses mínimo)',
      'Confirmar requisitos de visado según nacionalidad',
      'Contratar seguro de viaje básico',
      'Descargar mapas offline',
    ],
    documentos: [
      'Pasaporte válido',
      'Billetes de avión',
      'Reserva hotel',
      'Tarjeta sanitaria europea (si aplica)',
    ],
    salud: [
      'Vacunas al día',
      'Seguro médico viaje',
    ],
  },
  'bajo': {
    generales: [
      'Verificar validez pasaporte (6 meses mínimo)',
      'Contratar seguro de viaje con cobertura médica',
      'Registrar viaje en consular',
      'Mantener copias digitales de documentos',
      'Evitar zonas turísticas masivas fuera de horas',
    ],
    documentos: [
      'Pasaporte válido + copia',
      'Visado si aplica',
      'Certificado vacunación',
      'Póliza seguro médico',
      'Copia permiso conducir internacional',
    ],
    salud: [
      'Vacunas recomendadas',
      'Seguro médico obligatorio',
      'Medicamentos básicos',
    ],
  },
  'medio': {
    generales: [
      'Verificar asesoramiento MAEC actualizado',
      'Contratar seguro de viaje con evacuación',
      'Registrar viaje en consular OBLIGATORIO',
      'Evitar manifestaciones y التجمعات',
      'Mantener contacto regular con familia',
      'Tener plan de evacuación preparado',
    ],
    documentos: [
      'Pasaporte válido + 2 copias',
      'Permiso del país (algunos países)',
      'Carta invitación (si aplica)',
      'Póliza evacuación médica',
      'Contacto emergencia consular',
    ],
    salud: [
      'Vacunas actualizadas',
      'Seguro médico con cobertura completa',
      'Kit médico personal',
      'Información hospitales cercanos',
    ],
  },
  'alto': {
    generales: [
      'Consultar MAEC ANTES de planificar',
      'Viajar SOLO si es estrictamente necesario',
      'Contratar seguro premium con evacuación',
      'Registrar viaje consular y dejar itinerario',
      'Evitar TODO travel no esencial',
      'Mantener documentación actualizada',
    ],
    documentos: [
      'Pasaporte + copias múltiples',
      'Autorización escrita motivos viaje',
      'Seguro con cobertura completa',
      'Contactos familiares actualizados',
    ],
    salud: [
      'Vacunas obligatorias',
      'Kit médico completo',
      'Evacuación médica asegurada',
    ],
  },
  'muy-alto': {
    generales: [
      'NO RECOMENDADO viajar',
      'Contactar consular inmediatamente',
      'Seguir instrucciones MAEC en todo momento',
      'Tener plan de salida de emergencia',
    ],
    documentos: [
      'Toda documentación en regla',
      'Contactos consulares',
      'Evacuación médica',
    ],
    salud: [
      'Evacuación médica prioritaria',
      'Vacunas completas',
    ],
  },
};

const climaEstacional: Record<string, { mejor: string }> = {
  'ene': { mejor: 'Sudamérica, Caribe, Sudeste Asiático' },
  'feb': { mejor: 'Sudamérica, Caribe, Sudeste Asiático' },
  'mar': { mejor: 'Europa sur, Norteamérica' },
  'abr': { mejor: 'Europa, Japón, Nueva Zelanda' },
  'may': { mejor: 'Europa, Norteamérica' },
  'jun': { mejor: 'Europa norte, Canadá' },
  'jul': { mejor: 'Europa, Canadá, Alaska' },
  'ago': { mejor: 'Europa, Canadá, Alaska' },
  'sep': { mejor: 'Europa sur, Norteamérica' },
  'oct': { mejor: 'Europa, Asia, Sudamérica' },
  'nov': { mejor: 'Sudeste Asiático, Oceanía' },
  'dic': { mejor: 'Caribe, Sudamérica, Europa sur' },
  'flexible': { mejor: 'Verificar estacionalidad' },
};

const riesgoColors: Record<NivelRiesgo, { bg: string; text: string; border: string }> = {
  'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
  'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
  'medio': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
  'alto': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
  'muy-alto': { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900' },
};

function AnalisisInner() {
  const searchParams = useSearchParams();
  const [destino, setDestino] = useState(searchParams.get('destino') || '');
  const [fecha, setFecha] = useState(searchParams.get('fecha') || 'flexible');
  const [loading, setLoading] = useState(false);

  const paisSeleccionado = paises.find(p => p.codigo.toLowerCase() === destino.toLowerCase());

  const handleAnalizar = () => {
    if (!destino) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const nivel = paisSeleccionado?.nivelRiesgo || 'sin-riesgo';
  const recs = recomendacionesPorNivel[nivel];
  const clima = climaEstacional[fecha] || climaEstacional['flexible'];

  return (
    <>
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-slate-300 text-sm mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destino
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Seleccionar destino...</option>
              {paises.map(p => (
                <option key={p.codigo} value={p.codigo}>{p.bandera} {p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-slate-300 text-sm mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Época del viaje
            </label>
            <select
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="flexible">📅 Fechas flexibles</option>
              <option value="ene">Enero</option>
              <option value="feb">Febrero</option>
              <option value="mar">Marzo</option>
              <option value="abr">Abril</option>
              <option value="may">Mayo</option>
              <option value="jun">Junio</option>
              <option value="jul">Julio</option>
              <option value="ago">Agosto</option>
              <option value="sep">Septiembre</option>
              <option value="oct">Octubre</option>
              <option value="nov">Noviembre</option>
              <option value="dic">Diciembre</option>
            </select>
          </div>
          <button
            onClick={handleAnalizar}
            disabled={!destino || loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Analizando...' : 'Analizar'}
          </button>
        </div>
      </div>

      {paisSeleccionado && (
        <>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`bg-slate-800/50 rounded-2xl p-6 border-2 ${riesgoColors[nivel].border}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${riesgoColors[nivel].bg}`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Nivel de Riesgo</p>
                  <p className={`text-xl font-bold ${riesgoColors[nivel].text}`}>
                    {getLabelRiesgo(nivel)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-4xl">{paisSeleccionado.bandera}</span>
                <div>
                  <p className="text-white font-semibold">{paisSeleccionado.nombre}</p>
                  <p className="text-slate-400 text-sm">{paisSeleccionado.capital}</p>
                </div>
              </div>
              <Link
                href={`/pais/${paisSeleccionado.codigo}`}
                className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Ver ficha completa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Mejor época</p>
                  <p className="text-white font-semibold">{clima.mejor}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <p className="text-slate-300 text-sm">{fecha === 'flexible' ? 'Selecciona mes' : `Para ${fecha.toUpperCase()}`}</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Documentos necesarios</p>
                  <p className="text-white font-semibold">{recs.documentos.length} items</p>
                </div>
              </div>
              <Link href="/lead-magnet" className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm">
                <Download className="w-4 h-4" />
                Descargar checklist
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Recomendaciones
              </h3>
              <ul className="space-y-2">
                {recs.generales.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Documentos
              </h3>
              <ul className="space-y-2">
                {recs.documentos.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Salud
              </h3>
              <ul className="space-y-2">
                {recs.salud.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {nivel !== 'sin-riesgo' && nivel !== 'bajo' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-orange-400 mb-2">⚠️ Recomendaciones Importantes</h3>
                  <ul className="space-y-2 text-orange-200">
                    <li>• Registra tu viaje en la consular</li>
                    <li>• Contrata seguro con evacuación médica</li>
                    <li>• Mantén contacto regular con familia</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Chat IA para más detalles
            </h3>
            <p className="text-slate-400 mb-4">
              ¿Preguntas sobre {paisSeleccionado.nombre}? El chat IA puede ayudarte.
            </p>
            <Link
              href="/premium"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Acceder al Chat IA
            </Link>
          </div>
        </>
      )}

      {!paisSeleccionado && (
        <div className="text-center py-16 text-slate-400">
          <Plane className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl mb-2">Selecciona un destino</h3>
          <p>Elige un país para obtener el análisis completo</p>
        </div>
      )}
    </>
  );
}

export default function AnalisisContent() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Cargando...</div>}>
      <AnalisisInner />
    </Suspense>
  );
}