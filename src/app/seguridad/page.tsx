import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Server, Brain, Database, Globe, FileText, CreditCard, Mail, ExternalLink, ChevronRight, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seguridad, Privacidad y Transparencia IA | Viaje con Inteligencia',
  description: 'Cómo protegemos tus datos de viaje: infraestructura self-hosted en EU, cifrado AES-256, retención mínima, protección prompt injection y cumplimiento RGPD y AI Act.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/seguridad',
  },
  openGraph: {
    title: 'Seguridad y Privacidad | Viaje con Inteligencia',
    description: 'Infraestructura self-hosted en EU, cifrado en reposo, retención mínima de itinerarios y cumplimiento RGPD + AI Act.',
    url: 'https://www.viajeinteligencia.com/seguridad',
    locale: 'es_ES',
    siteName: 'Viaje con Inteligencia',
    images: [{ url: 'https://www.viajeinteligencia.com/preview_favicon.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seguridad y Privacidad | Viaje con Inteligencia',
    description: 'Stack self-hosted en EU, cifrado AES-256, RGPD y AI Act.',
    images: ['https://www.viajeinteligencia.com/preview_favicon.jpg'],
  },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-xs font-mono tracking-widest uppercase text-slate-500">{children}</span>
      <div className="flex-1 h-px bg-slate-700/50" />
    </div>
  );
}

function Card({ tag, tagColor, title, children }: { tag?: string; tagColor?: string; title: string; children: React.ReactNode }) {
  const tagColors: Record<string, string> = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors">
      {tag && (
        <span className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded border mb-3 ${tagColors[tagColor || 'gray'] || tagColors.gray}`}>
          {tag}
        </span>
      )}
      <h3 className="text-sm font-bold text-white mb-2 leading-snug">{title}</h3>
      <div className="text-xs text-slate-400 leading-relaxed space-y-1.5">{children}</div>
    </div>
  );
}

function StackLayer({ label, name, detail, badge, badgeColor }: { label: string; name: string; detail: string; badge: string; badgeColor: string }) {
  const badgeColors: Record<string, string> = {
    green: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    gray: 'bg-slate-500/10 text-slate-400',
  };
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3 items-center">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 text-right">{label}</span>
      <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-600/50 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-white">{name}</div>
          <div className="text-[11px] font-mono text-slate-400">{detail}</div>
        </div>
        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${badgeColors[badgeColor] || badgeColors.gray}`}>{badge}</span>
      </div>
    </div>
  );
}

export default function SeguridadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-emerald-400 mb-10 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio
        </Link>

        {/* HERO */}
        <header className="pb-12 mb-10 border-b border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_350px_at_70%_-10%,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-1 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Seguridad · Privacidad · Transparencia
            </div>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight text-white max-w-2xl mb-4">
              Tus datos de viaje, <em className="italic text-emerald-400 not-italic">protegidos por diseño</em>
            </h1>
            <p className="text-base text-slate-400 max-w-xl leading-relaxed mb-6">
              Cómo recopilamos, procesamos y protegemos la información que introduces.
              Sin letra pequeña. Hechos técnicos verificables sobre un stack 100% bajo control propio en la Unión Europea.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Self-hosted EU · Hetzner Cloud', 'Next.js + PM2 + Nginx', 'Supabase EU', 'RGPD · AI Act UE', 'Última revisión: Mayo 2026'].map(chip => (
                <span key={chip} className="text-[11px] font-mono px-2.5 py-1 rounded border border-slate-600/50 text-slate-400 bg-slate-800/50">{chip}</span>
              ))}
            </div>
          </div>
        </header>

        {/* DISCLAIMER */}
        <div className="bg-amber-500/5 border border-amber-500/20 border-l-4 border-l-amber-500 rounded-lg p-5 mb-10" role="note">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-2">Aviso de limitación de responsabilidad operacional</div>
          <p className="text-sm text-amber-200/80 leading-relaxed mb-2">
            Viaje con Inteligencia es un <strong>ecosistema de conciencia situacional asistido por fuentes OSINT públicas</strong>.
            Los análisis de riesgo generados son síntesis automatizadas de información pública (MAEC, USGS, GDACS, ACLED, WHO y 73+ fuentes más)
            combinadas con modelos de IA. <strong>No constituyen asesoramiento de seguridad profesional, legal, médico ni consular.</strong>
          </p>
          <p className="text-sm text-amber-200/80 leading-relaxed">
            Las condiciones en destino pueden cambiar sin previo aviso. Para operaciones de alto riesgo, consulta siempre
            las <a href="https://www.exteriores.gob.es" target="_blank" rel="noopener" className="text-amber-300 hover:text-amber-200 underline">recomendaciones oficiales del MAEC</a>
            {' '}y un profesional certificado en seguridad de viaje.
          </p>
        </div>

        {/* 01 · POSICIONAMIENTO */}
        <section className="mb-14" id="posicionamiento">
          <SectionLabel>01 · Qué es este ecosistema</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">Un aggregator OSINT-asistido, no una plataforma de inteligencia operacional</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Viaje con Inteligencia correlaciona y contextualiza 73+ fuentes OSINT públicas para que viajeros
            accedan a información que normalmente solo está al alcance de servicios de inteligencia corporativos.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card tag="Lo que hacemos" tagColor="green" title="Contextualización OSINT-asistida por IA">
              <p>Correlacionamos fuentes abiertas (MAEC, USGS, GDACS, ACLED, WHO, World Bank, Global Peace Index, Aviation Safety Network…) y aplicamos un índice IRV compuesto de <strong className="text-white">16 KPIs en 5 dimensiones ponderadas</strong> para 120 países. El Chat IA (Groq/LLaMA) genera recomendaciones personalizadas en tiempo real.</p>
            </Card>
            <Card tag="Lo que no hacemos" tagColor="amber" title="No generamos inteligencia operacional primaria">
              <p>No realizamos recopilación activa, vigilancia, análisis HUMINT ni accedemos a fuentes clasificadas. Consulta <Link href="/fuentes-osint" className="text-emerald-400 hover:underline">la lista completa de fuentes</Link> y la <Link href="/metodologia" className="text-emerald-400 hover:underline">metodología IRV</Link>.</p>
            </Card>
            <Card tag="Público objetivo" tagColor="blue" title="El espacio entre el MAEC y la inteligencia corporativa">
              <p>Viajeros independientes, periodistas freelance, ONG, nómadas digitales y equipos pequeños sin acceso a productos de inteligencia de viaje corporativos. El MAEC ofrece avisos genéricos; los productos empresariales cuestan cinco cifras anuales.</p>
            </Card>
            <Card tag="Transparencia" tagColor="gray" title="Proyecto personal de código abierto">
              <p>Desarrollado por M. Castillo desde España. Repositorio público en <a href="https://github.com/mcasrom/viaje-con-inteligencia" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">GitHub</a>. Arquitectura y evolución documentadas en <Link href="/ecosistema" className="text-emerald-400 hover:underline">/ecosistema</Link>.</p>
            </Card>
          </div>
        </section>

        {/* 02 · INFRAESTRUCTURA */}
        <section className="mb-14" id="stack">
          <SectionLabel>02 · Infraestructura</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">Stack técnico verificable — 100% EU, bajo control propio</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            En mayo de 2026 completamos la migración de Vercel a infraestructura self-hosted en Hetzner Cloud (datacenter EU).
            Ningún dato de usuario transita por redes de edge compartidas fuera del control de la plataforma.
          </p>

          <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 text-center mb-5">Arquitectura de producción — Mayo 2026</div>
            <div className="space-y-2.5">
              <StackLayer label="Cliente" name="Navegador / PWA" detail="Next.js 16 · React · Leaflet · i18n ES/EN" badge="Frontend" badgeColor="gray" />
              <StackLayer label="Transporte" name="HTTPS · TLS 1.3 · HSTS" detail="Nginx reverse proxy · Let's Encrypt auto-renovados" badge="Cifrado" badgeColor="green" />
              <StackLayer label="Aplicación" name="Next.js bare metal · PM2" detail="Hetzner Cloud VPS · datacenter EU · control propio" badge="Self-hosted EU" badgeColor="green" />
              <StackLayer label="Base de datos" name="Supabase · PostgreSQL" detail="Región EU · AES-256 en reposo · RLS por usuario" badge="EU · Cifrado" badgeColor="green" />
              <StackLayer label="IA · Chat" name="Groq API · LLaMA" detail="Chat IA tiempo real · stateless · sin historial entre usuarios" badge="API externa" badgeColor="amber" />
              <StackLayer label="Pagos" name="Stripe Checkout" detail="PCI DSS Level 1 · SAQ-A · tarjetas nunca tocan la infraestructura del servidor" badge="PCI L1" badgeColor="blue" />
              <StackLayer label="Email" name="Resend" detail="Transaccional y newsletter · sin almacenamiento en la base de datos" badge="API externa" badgeColor="gray" />
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 border-l-4 border-l-emerald-500 rounded-lg p-4">
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              <strong className="text-emerald-300">Nota sobre API externa de IA:</strong> Groq es un proveedor ubicado en EE.UU.
              Las llamadas a su API se realizan bajo Cláusulas Contractuales Tipo (SCCs) del RGPD.
              La API no retiene datos en su política estándar. Los datos enviados son exclusivamente el input sanitizado
              de la sesión activa — nunca identificadores persistentes.
            </p>
          </div>
        </section>

        {/* 03 · CICLO DE VIDA DEL DATO */}
        <section className="mb-14" id="datos">
          <SectionLabel>03 · Ciclo de vida del dato</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">¿Qué ocurre con tu itinerario? Trazabilidad completa</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Del momento en que introduces tu destino hasta la eliminación automática. Sin pasos ocultos.
          </p>

          {/* Flow diagram */}
          <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6 mb-6 overflow-x-auto">
            <div className="flex items-center min-w-[500px] justify-center">
              {[
                { icon: '🧑', label: 'Tú', sub: 'Destino / itinerario', color: 'border-emerald-500/40' },
                { icon: '🛡', label: 'Nginx · PM2', sub: 'Hetzner EU', color: '' },
                { icon: '🤖', label: 'Groq / LLaMA', sub: 'Stateless', color: '' },
                { icon: '📊', label: 'Informe', sub: 'Tu pantalla', color: 'border-emerald-500/40' },
                { icon: '🗑', label: 'Purga auto', sub: 'Eliminación', color: 'border-red-500/30' },
              ].map((node, i) => (
                <div key={node.label} className="flex items-center">
                  <div className={`bg-slate-800 rounded-lg border ${node.color || 'border-slate-600/50'} px-3 py-2.5 text-center min-w-[90px] flex-shrink-0`}>
                    <span className="text-lg block mb-1">{node.icon}</span>
                    <div className="text-[11px] font-mono text-slate-400">{node.label}</div>
                    <div className="text-[10px] text-slate-500">{node.sub}</div>
                  </div>
                  {i < 4 && (
                    <div className="flex-1 min-w-[20px] flex items-center justify-center relative h-8 mx-1">
                      <div className="absolute inset-x-4 top-1/2 h-px bg-slate-600/50" />
                      <ChevronRight className="w-3 h-3 text-slate-500 relative z-10 ml-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Data table */}
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/80">
                  <th className="text-[11px] font-mono uppercase tracking-wider text-slate-400 text-left px-4 py-3 font-medium">Dato</th>
                  <th className="text-[11px] font-mono uppercase tracking-wider text-slate-400 text-left px-4 py-3 font-medium">¿Se almacena?</th>
                  <th className="text-[11px] font-mono uppercase tracking-wider text-slate-400 text-left px-4 py-3 font-medium">Retención</th>
                  <th className="text-[11px] font-mono uppercase tracking-wider text-slate-400 text-left px-4 py-3 font-medium">Cifrado</th>
                  <th className="text-[11px] font-mono uppercase tracking-wider text-slate-400 text-left px-4 py-3 font-medium">Propósito</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Email / cuenta', 'Sí', 'Vida de la cuenta', 'AES-256 · Supabase EU', 'Autenticación'],
                  ['Itinerario / destino', 'Temporal', 'Máx. 24 horas', 'TLS + RLS en BD', 'Análisis IRV'],
                  ['Historial consultas', 'Opcional', 'Hasta supresión', 'AES-256 · RLS por uid', 'Informes previos'],
                  ['Datos de pago', 'No (Stripe)', 'No aplica', 'PCI DSS L1 vía Stripe', 'Facturación delegada'],
                  ['Email newsletter', 'Sí', 'Hasta baja', 'Resend · AES-256', 'Comunicación opcional'],
                  ['Logs de acceso', 'Sí', '30 días rolling', 'Nginx · Hetzner', 'Seguridad'],
                ].map(([dato, almacena, retencion, cifrado, proposito]) => (
                  <tr key={dato} className="border-t border-slate-700/50 hover:bg-slate-800/30">
                    <td className="text-white font-mono text-[11px] px-4 py-2.5">{dato}</td>
                    <td className="text-slate-400 px-4 py-2.5">
                      <span className={almacena === 'Sí' ? 'text-emerald-400' : almacena === 'Temporal' ? 'text-amber-400' : 'text-slate-500'}>{almacena}</span>
                    </td>
                    <td className="text-slate-400 px-4 py-2.5">{retencion}</td>
                    <td className="text-slate-400 px-4 py-2.5 text-[11px]">{cifrado}</td>
                    <td className="text-slate-400 px-4 py-2.5">{proposito}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 04 · SEGURIDAD INFORMÁTICA */}
        <section className="mb-14" id="seguridad-tecnica">
          <SectionLabel>04 · Seguridad informática</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">Defensa en capas — respuestas técnicas concretas</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Las preguntas correctas: ¿qué se almacena?, ¿cuánto tiempo?, ¿está cifrado?, ¿qué garantías hay? Respuestas — sin marketing.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card tag="Activo" tagColor="green" title="Cifrado en tránsito y en reposo">
              <ul className="list-disc pl-4 space-y-1">
                <li>TLS 1.3 en toda la cadena: cliente → Nginx → Next.js → Supabase</li>
                <li>HSTS con preload — no hay fallback a HTTP</li>
                <li>Supabase cifra volúmenes con AES-256 en reposo</li>
                <li>Certificados Let's Encrypt con renovación automática</li>
              </ul>
            </Card>
            <Card tag="Activo" tagColor="green" title="Row Level Security (RLS)">
              <ul className="list-disc pl-4 space-y-1">
                <li>Todas las tablas con datos personales tienen RLS activo</li>
                <li>Políticas: <code className="text-[11px] bg-slate-700 px-1 rounded">auth.uid() = user_id</code> — aislamiento por usuario</li>
                <li>Una API key comprometida no accede a datos de otros usuarios</li>
              </ul>
            </Card>
            <Card tag="Activo" tagColor="green" title="Control propio de infraestructura">
              <ul className="list-disc pl-4 space-y-1">
                <li>Migración self-hosted en Hetzner Cloud EU (Mayo 2026)</li>
                <li>Elimina superficie de ataque de edge networks compartidas</li>
                <li>Acceso SSH con clave pública — sin contraseñas</li>
                <li>Firewall UFW + reglas Nginx restrictivas</li>
              </ul>
            </Card>
            <Card tag="Activo" tagColor="green" title="Gestión de secretos">
              <ul className="list-disc pl-4 space-y-1">
                <li>Todas las API keys en variables de entorno — nunca en código</li>
                <li>Cero secretos comiteados en el repositorio GitHub</li>
                <li>Webhook de Stripe validado con firma HMAC</li>
              </ul>
            </Card>
            <Card tag="En progreso" tagColor="amber" title="Rate limiting en API públicas y B2B">
              <ul className="list-disc pl-4 space-y-1">
                <li>Límites por IP y <code className="text-[11px] bg-slate-700 px-1 rounded">user_id</code> en rutas <code className="text-[11px] bg-slate-700 px-1 rounded">/api/*</code></li>
                <li>Protección reforzada en webhooks de Stripe</li>
                <li>API B2B con autenticación por token (<code className="text-[11px] bg-slate-700 px-1 rounded">x-api-key</code>)</li>
              </ul>
            </Card>
            <Card tag="Planificado" tagColor="blue" title="Canal de divulgación de vulnerabilidades">
              <ul className="list-disc pl-4 space-y-1">
                <li><code className="text-[11px] bg-slate-700 px-1 rounded">/.well-known/security.txt</code> con contacto y PGP key</li>
                <li>SLA de respuesta a reportes: 72 horas</li>
                <li>Reconocimiento público a investigadores responsables</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 05 · SEGURIDAD IA */}
        <section className="mb-14" id="seguridad-ia">
          <SectionLabel>05 · Seguridad IA</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">El modelo que usamos y cómo lo protegemos</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Una integración de IA activa con arquitectura stateless. No comparte contexto entre usuarios.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card tag="Groq API · LLaMA" tagColor="blue" title="Chat IA en tiempo real">
              <ul className="list-disc pl-4 space-y-1">
                <li>Usado para el Chat IA conversacional en el dashboard</li>
                <li>Cada conversación es una sesión completamente nueva</li>
                <li>No existe historial compartido entre usuarios</li>
                <li>Input sanitizado antes de enviar — caracteres de control, patrones de inyección</li>
              </ul>
            </Card>
            <Card tag="Amenaza mitigada" tagColor="red" title="Prompt injection">
              <ul className="list-disc pl-4 space-y-1">
                <li>Función <code className="text-[11px] bg-slate-700 px-1 rounded">sanitizeItinerary()</code> previo al análisis: valida y limpia el input</li>
                <li>Separación estructural: datos de usuario y system prompt en roles API distintos</li>
                <li>Monitorización de outputs fuera del dominio de viaje</li>
                <li>Self-hosting elimina vectores de ataque de edge compartido</li>
              </ul>
            </Card>
            <Card tag="AI Act · arts. 14 y 50" tagColor="amber" title="Transparencia y supervisión humana">
              <ul className="list-disc pl-4 space-y-1">
                <li>Todos los análisis generados por IA están identificados como tales</li>
                <li>Mecanismo de feedback en informes generados</li>
                <li>Sin perfilado discriminatorio, manipulación subliminal ni puntuación social</li>
                <li>Documentación de fuentes y limitaciones mantenida públicamente</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 06 · FUENTES */}
        <section className="mb-14" id="fuentes">
          <SectionLabel>06 · Fuentes de datos</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">73+ fuentes OSINT públicas integradas</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Todas las fuentes son públicas y verificables. Ninguna es propietaria ni clasificada.{' '}
            <Link href="/fuentes-osint" className="text-emerald-400 hover:underline">Lista completa →</Link>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              ['Riesgo oficial', 'MAEC España', 'Scraping automatizado'],
              ['Conflictos', 'ACLED', 'Armed Conflict Location'],
              ['Desastres', 'GDACS', 'Alertas globales'],
              ['Sísmico', 'USGS', 'Actividad sísmica'],
              ['Salud', 'WHO GHO', 'Global Health Observatory'],
              ['Paz global', 'GPI', 'Institute for Economics'],
              ['Economía', 'World Bank', 'IPC, PIB, indicadores'],
              ['Aviación', 'Aviation Safety Network', 'Seguridad aérea'],
              ['Transporte', 'OpenSky Network', 'Tráfico aéreo real'],
              ['Turismo', 'UNWTO', 'Estadísticas turismo'],
              ['Desarrollo', 'UNDP HDI', 'Índice Desarrollo Humano'],
              ['Terrorismo', 'GTI', 'Global Terrorism Index'],
            ].map(([cat, name, desc]) => (
              <div key={name} className="bg-slate-800/50 rounded-lg border border-slate-700 p-3">
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">{cat}</div>
                <div className="text-sm font-bold text-white">{name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 07 · LEGAL */}
        <section className="mb-14" id="legal">
          <SectionLabel>07 · Marco legal</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">Normativa aplicable y cumplimiento</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Operamos desde España con usuarios en la Unión Europea.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card tag="RGPD · Reglamento 2016/679" tagColor="blue" title="Protección de datos personales">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-white">Base jurídica:</strong> consentimiento explícito (art. 6.1.a)</li>
                <li><strong className="text-white">Minimización:</strong> solo los datos necesarios para el análisis</li>
                <li><strong className="text-white">Tus derechos:</strong> acceso, rectificación, supresión — desde tu perfil o <a href="mailto:privacidad@viajeinteligencia.com" className="text-emerald-400">privacidad@viajeinteligencia.com</a></li>
                <li><strong className="text-white">Infraestructura:</strong> Hetzner EU + Supabase EU — datos dentro del EEE</li>
                <li><strong className="text-white">API externa IA:</strong> cubierta por SCCs del RGPD</li>
              </ul>
            </Card>
            <Card tag="AI Act · Reglamento 2024/1689" tagColor="amber" title="Uso responsable de inteligencia artificial">
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-white">Clasificación:</strong> riesgo limitado según uso actual</li>
                <li><strong className="text-white">Transparencia (art. 50):</strong> toda interacción IA identificada</li>
                <li><strong className="text-white">Supervisión humana (art. 14):</strong> feedback en informes</li>
                <li><strong className="text-white">Prohibiciones (art. 5):</strong> sin perfilado discriminatorio</li>
              </ul>
            </Card>
            <Card tag="LSSI-CE · Ley 34/2002" tagColor="gray" title="Servicios de la Sociedad de la Información">
              <ul className="list-disc pl-4 space-y-1">
                <li>Identificación del prestador en <Link href="/legal" className="text-emerald-400 hover:underline">/legal</Link></li>
                <li>Política de cookies conforme a directrices AEPD</li>
                <li>Disclaimer operacional en todos los informes IA</li>
              </ul>
            </Card>
            <Card tag="PCI DSS · Stripe" tagColor="gray" title="Seguridad en pagos delegada">
              <ul className="list-disc pl-4 space-y-1">
                <li>Stripe Checkout — tarjetas nunca tocan la infraestructura</li>
                <li>Clasificación SAQ-A: mínima responsabilidad PCI DSS</li>
                <li>Webhook validado con firma HMAC</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 08 · ROADMAP */}
        <section className="mb-14" id="roadmap">
          <SectionLabel>08 · Hoja de ruta de seguridad</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-3">Compromisos con fechas reales</h2>

          <div className="space-y-0">
            {[
              { phase: 'Fase 1\nMayo 2026', title: 'Migración a Hetzner Cloud EU', badge: 'completado', badgeColor: 'bg-emerald-500/10 text-emerald-400', color: 'bg-emerald-500', desc: 'Infraestructura self-hosted bajo control propio. Next.js bare metal + PM2 + Nginx.' },
              { phase: 'Fase 1\nMayo 2026', title: 'Sanitización de input previo al análisis', badge: 'activo', badgeColor: 'bg-emerald-500/10 text-emerald-400', color: 'bg-emerald-500', desc: 'Función sanitizeItinerary(): validación y detección de prompt injection antes de llamadas a IA.' },
              { phase: 'Fase 1\nMayo 2026', title: 'Purga automática TTL 24h', badge: 'activo', badgeColor: 'bg-emerald-500/10 text-emerald-400', color: 'bg-emerald-500', desc: 'Eliminación automática de itinerarios tras el análisis.' },
              { phase: 'Fase 2\nQ3 2026', title: 'Hardening Nginx + UFW completo', badge: 'en curso', badgeColor: 'bg-amber-500/10 text-amber-400', color: 'bg-amber-500', desc: 'Configuración final de firewall, headers de seguridad (CSP, X-Frame-Options).' },
              { phase: 'Fase 2\nQ3 2026', title: 'Rate limiting API pública y B2B', badge: 'en curso', badgeColor: 'bg-amber-500/10 text-amber-400', color: 'bg-amber-500', desc: 'Límites por IP y user_id en endpoints /api/*.' },
              { phase: 'Fase 3\nQ4 2026', title: 'security.txt y divulgación responsable', badge: 'planificado', badgeColor: 'bg-blue-500/10 text-blue-400', color: 'bg-blue-500', desc: 'Publicación de /.well-known/security.txt con clave PGP y SLA de 72h.' },
            ].map((item, i) => {
              const [phase1, phase2] = item.phase.split('\n');
              return (
                <div key={i} className="flex gap-4">
                  <div className="text-right min-w-[70px] pt-1">
                    <div className="text-[10px] font-mono uppercase text-slate-500 leading-tight">{phase1}</div>
                    <div className="text-[10px] font-mono uppercase text-slate-600">{phase2}</div>
                  </div>
                  <div className="flex gap-3 pb-6 border-l border-slate-700 pl-4 ml-[-0.5px]">
                    <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0 mt-1.5 ml-[-21px]`} />
                    <div>
                      <div className="text-sm font-bold text-white">
                        {item.title}
                        <span className={`inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ml-2 align-middle ${item.badgeColor}`}>{item.badge}</span>
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 09 · FAQ */}
        <section className="mb-14" id="faq">
          <SectionLabel>09 · Preguntas frecuentes</SectionLabel>
          <h2 className="text-2xl font-bold text-white mb-6">Lo que los usuarios nos preguntan</h2>

          <div className="space-y-0 divide-y divide-slate-700/50">
            {[
              { q: '¿Se almacena mi itinerario de viaje?', a: 'No de forma permanente. Los datos de itinerario se procesan en sesión y se eliminan automáticamente en menos de 24 horas. Si activas el historial en tu perfil, el resumen del informe puede guardarse hasta que lo elimines tú.' },
              { q: '¿Qué modelo de IA procesa mis datos?', a: 'El Chat IA usa la API de Groq (LLaMA). Es completamente stateless — cada sesión es una llamada API nueva sin historial compartido entre usuarios. La API no retiene datos en su política estándar de uso.' },
              { q: '¿Dónde están alojados mis datos?', a: 'La aplicación corre en servidores Hetzner Cloud (datacenter EU) bajo control propio. La base de datos está en Supabase (región EU). Ningún dato personal sale del EEE salvo las llamadas a la API de Groq, realizadas bajo Cláusulas Contractuales Tipo RGPD.' },
              { q: '¿Puedo confiar en el análisis para decisiones de seguridad críticas?', a: 'Para planificación ordinaria, sí. Para operaciones de alto riesgo, zonas de conflicto o misiones humanitarias: consulta siempre las recomendaciones oficiales del MAEC y profesionales certificados. Somos una herramienta de conciencia situacional, no un sustituto del criterio profesional.' },
              { q: '¿Cumple la plataforma con el RGPD?', a: 'Sí. Base jurídica: consentimiento explícito (art. 6.1.a). Infraestructura en EU (Hetzner + Supabase EU). Derechos de acceso, rectificación, supresión y portabilidad desde tu perfil o en privacidad@viajeinteligencia.com.' },
              { q: '¿Cómo protegéis contra prompt injection?', a: 'Tres capas: (1) función sanitizeItinerary() que valida el input previo al análisis; (2) separación estructural entre datos de usuario e instrucciones del sistema usando roles API distintos; (3) monitorización de outputs fuera del dominio de análisis de viaje.' },
              { q: '¿Dónde reporto una vulnerabilidad?', a: 'Escribe a seguridad@viajeinteligencia.com. Respondemos en máximo 72 horas. Estamos preparando /.well-known/security.txt con clave PGP (Q3 2026).' },
            ].map((faq, i) => (
              <details key={i} className="group py-4" open={i === 0}>
                <summary className="text-sm font-bold text-white cursor-pointer list-none flex items-center justify-between gap-3 select-none">
                  {faq.q}
                  <span className="text-emerald-400 text-lg leading-none group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-8 border-t border-slate-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Legal</h4>
              <div className="space-y-1">
                <a href="https://www.viajeinteligencia.com/legal" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">Aviso legal</a>
                <a href="https://www.viajeinteligencia.com/legal#privacidad" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">Política de privacidad</a>
                <a href="https://www.viajeinteligencia.com/transparencia" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">Estado del sistema</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Plataforma</h4>
              <div className="space-y-1">
                <a href="https://www.viajeinteligencia.com/metodologia" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">Metodología IRV</a>
                <a href="https://www.viajeinteligencia.com/fuentes-osint" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">Fuentes OSINT</a>
                <a href="https://www.viajeinteligencia.com/ecosistema" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">Ecosistema</a>
                <a href="https://www.viajeinteligencia.com/precio-api" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">API B2B</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Contacto</h4>
              <div className="space-y-1">
                <a href="mailto:privacidad@viajeinteligencia.com" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">privacidad@viajeinteligencia.com</a>
                <a href="mailto:seguridad@viajeinteligencia.com" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">seguridad@viajeinteligencia.com</a>
                <a href="mailto:info@viajeinteligencia.com" className="block text-sm text-slate-400 hover:text-emerald-400 transition-colors">info@viajeinteligencia.com</a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Infraestructura</h4>
              <div className="space-y-1 text-xs text-slate-400">
                <p><span className="text-slate-500">Hosting:</span> Hetzner Cloud EU</p>
                <p><span className="text-slate-500">App:</span> Next.js + PM2 + Nginx</p>
                <p><span className="text-slate-500">BD:</span> Supabase EU · AES-256</p>
                <p><span className="text-slate-500">IA:</span> Groq (stateless)</p>
                <p><span className="text-slate-500">Pagos:</span> Stripe PCI DSS L1</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-slate-700/50 text-[11px] font-mono text-slate-600">
            <span>
              <a href="https://www.viajeinteligencia.com/" className="hover:text-emerald-400 transition-colors">Viaje con Inteligencia</a>
              {' · '}© 2026 M.Castillo{' · '}
              <a href="https://github.com/mcasrom/viaje-con-inteligencia" target="_blank" rel="noopener" className="hover:text-emerald-400 transition-colors">GitHub</a>
            </span>
            <span><code className="text-slate-500">/seguridad</code> · v2.0 · Mayo 2026</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
