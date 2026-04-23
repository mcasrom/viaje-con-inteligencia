'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Download, Loader2, Mail, Gift, ArrowRight, Star, Zap, Shield, Plane } from 'lucide-react';

const PREMIUM_CHECKLIST_ITEMS = [
  { category: 'Documentos', items: ['Pasaporte vigente (6+ meses)', 'Billetes confirmación', 'Reserva hotel', 'Seguro viaje (PDF)', 'Autorización menores (si aplica)', 'Visa entradas (si aplica)'] },
  { category: 'Salud', items: ['Vacunas actualizadas', 'Medicamentos receta', 'Seguro médico internacional', 'Card sanitario EHIC (UE)', 'Botiquín básico', 'Contacto emergencia'] },
  { category: 'Finanzas', items: ['Tarjetas crédito/débito', 'Efectivo (divisa local)', 'App banca móvil', 'Teléfono banco', 'Docs seguro viajes', 'Límites aumentados'] },
  { category: 'Tecnología', items: ['Cargador universal', 'Power bank', 'eSIM/ roaming activo', 'Apps offline maps', 'VPN configurada', 'Cloud backup fotos'] },
  { category: 'Seguridad', items: ['Copias digitales docs', 'Email consulate', 'Registro viajes MAEC', 'Notificar familia', 'Seguro cancelación', 'Emergency contacts'] },
];

export default function LeadMagnetClient() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, source: 'lead-magnet' }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        const checklistUrl = '/api/checklist-pdf?' + new URLSearchParams({ email, name: name || 'viajero' });
        window.open(checklistUrl, '_blank');
      } else {
        setStatus('error');
        setMessage(data.error || 'Error al procesar');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-8">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">¡Descargado!</h1>
            <p className="text-slate-300 mb-6">Tu checklist premium se ha descargado. También recibirás nuestro resumen semanal.</p>
            
            <div className="space-y-3 text-left">
              <p className="text-slate-400 text-sm font-medium">📱 También disponible en:</p>
              <a 
                href="https://t.me/ViajeConInteligenciaBot" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
              >
                <Plane className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Bot de Alertas</p>
                  <p className="text-slate-400 text-xs">/alertasviaje para机场, trenes, clima</p>
                </div>
              </a>
              <a 
                href="https://t.me/ViajeConInteligencia" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Canal Telegram</p>
                  <p className="text-slate-400 text-xs">Resumen diario de alertas</p>
                </div>
              </a>
            </div>
            
            <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-6">
              <ArrowRight className="w-4 h-4" />
              Volver al mapa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 font-medium mb-4">
            <Gift className="w-5 h-5" />
            <span>GRATIS - Solo hoy</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Checklist Premium de Viaje
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Descarga nuestra guía completa con 80+ items verificados por viajeros experimentados. 
            No olvides nada en tu próximo viaje.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Qué incluye
            </h2>
            <ul className="space-y-3">
              {['80+ items organizados', 'Categorías por prioridad', 'Print-friendly PDF', 'Actualizaciones gratis', 'Tips de viajeros', 'En español'].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <Check className="w-4 h-4 text-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Valoraciones
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>"Essential para qualquer viagem"</p>
              <p>"Nunca mais viajei sem ele"</p>
              <p>"Me ahorró tiempo y dinero"</p>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-sm text-slate-400 ml-2">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-8 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Descarga inmediata</h2>
          </div>
          <p className="text-slate-300 mb-6">
            Ingresa tu email y recibe el checklist inmediatamente. También te enviamos un resumen semanal con alertas de viaje.
          </p>

          <form onSubmit={handleDownload} className="space-y-4">
            {status === 'error' && (
              <div className="text-red-400 text-sm">{message}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-yellow-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-500 text-xs">
              <Mail className="w-3 h-3 inline mr-1" />
              No spam. Cancela cuando quieras. Verificado por +500 viajeros.
            </p>
          </form>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Vista previa</h2>
          <div className="bg-white rounded-xl p-6 text-slate-900 max-h-96 overflow-y-auto">
            {PREMIUM_CHECKLIST_ITEMS.map((section, i) => (
              <div key={i} className="mb-6">
                <h3 className="font-bold text-blue-600 mb-2">{section.category}</h3>
                <ul className="space-y-1 text-sm">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-center text-slate-400 text-sm mt-8">...y más</p>
          </div>
        </div>
      </main>
    </div>
  );
}