'use client';

import { CheckCircle, Server, GitBranch, Terminal, ExternalLink } from 'lucide-react';

export default function AdminDeploy() {
  const steps = [
    {
      num: 1,
      title: 'Preparar cambios',
      cmd: 'npm run build',
      desc: 'Siempre verifica que el build pasa localmente antes de hacer push.',
      detail: 'Si el build falla, corrige los errores antes de continuar.',
    },
    {
      num: 2,
      title: 'Commit + Push',
      cmd: 'git add -A && git commit -m "tipo: descripción" && git push origin main',
      desc: 'El tipo puede ser fix:, feat:, chore:, etc. La descripción debe ser clara y concisa.',
      detail: 'El push a main dispara automaticamente el deploy.',
    },
    {
      num: 3,
      title: 'GitHub Actions compila y despliega',
      cmd: 'Workflow: Deploy to Hetzner',
      desc: 'GitHub ejecuta rsync + npm install + npm run build + pm2 reload en el servidor.',
      detail: 'Tarda ~2-3 minutos. Ve a GitHub > Actions > Deploy to Hetzner para ver el progreso.',
    },
    {
      num: 4,
      title: 'Health check automático',
      cmd: 'curl http://178.105.80.193:3001/api/health',
      desc: 'El workflow verifica que la app responde en el puerto 3001 tras el despliegue.',
      detail: 'Si falla, el servidor sigue corriendo la versión anterior — no hay downtime.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Procedimiento de Deploy</h1>
          </div>
          <a href="/admin/dashboard" className="text-slate-400 text-sm hover:text-white">← Volver</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Resumen */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-900/40 border border-emerald-700/40 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Deploy automático vía GitHub Actions</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                El proyecto se despliega automáticamente con solo hacer <code className="bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300">git push origin main</code>.
                No necesitas acceder al servidor manualmente. GitHub Actions se encarga de rsync, build y reinicio de PM2.
              </p>
            </div>
          </div>
        </section>

        {/* Pipeline Visual */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-6">Pipeline completo</h2>
          <div className="relative">
            {/* Connection lines */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-slate-700 hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="relative flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Number circle */}
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-600/20 border border-emerald-500/40 rounded-full shrink-0 z-10">
                    <span className="text-emerald-400 font-bold">{step.num}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                    <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Terminal className="w-4 h-4 text-slate-400" />
                      <code className="bg-slate-800 px-3 py-1.5 rounded-lg text-emerald-300 text-sm font-mono flex-1 overflow-x-auto">
                        {step.cmd}
                      </code>
                    </div>
                    <p className="text-slate-300 text-sm">{step.desc}</p>
                    <p className="text-slate-500 text-xs mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Final node */}
            <div className="relative flex flex-col md:flex-row gap-4 md:gap-6 mt-8">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600/20 border border-green-500/40 rounded-full shrink-0 z-10">
                <Server className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 bg-green-900/10 border border-green-800/30 rounded-xl p-5">
                <h3 className="text-green-300 font-bold text-base mb-1">¡Desplegado!</h3>
                <p className="text-slate-300 text-sm">
                  La app se sirve desde <strong className="text-white">Hetzner CX22</strong> via Nginx → Next.js (puerto 3001) con PM2.
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  https://www.viajeinteligencia.com — Proxy naranja Cloudflare + SSL Full (strict)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Arquitectura */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4">Arquitectura del deploy</h2>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto">
            <p className="text-slate-400">git push origin main</p>
            <p className="text-slate-500">  ▼</p>
            <p className="text-emerald-400">GitHub Actions: deploy-hetzner.yml</p>
            <p className="text-slate-500">  ├── actions/checkout@v4</p>
            <p className="text-slate-500">  ├── rsync → deploy@178.105.80.193:/var/www/viajeinteligencia/</p>
            <p className="text-slate-500">  │     (excluye .git, node_modules, .next, .env*, logs)</p>
            <p className="text-slate-500">  ├── ssh: npm install --omit=dev</p>
            <p className="text-slate-500">  ├── ssh: npm run build</p>
            <p className="text-slate-500">  ├── ssh: pm2 startOrReload ecosystem.config.cjs</p>
            <p className="text-slate-500">  └── curl http://178.105.80.193:3001/api/health</p>
            <p className="text-slate-400">  ▼</p>
            <p className="text-white">Servido en https://www.viajeinteligencia.com</p>
            <p className="text-slate-500">  ├── Hetzner CX22 (2 vCPU, 4GB RAM, 40GB SSD)</p>
            <p className="text-slate-500">  ├── Nginx (TLS 1.3, Let's Encrypt, HSTS)</p>
            <p className="text-slate-500">  ├── PM2 fork (1 instance, port 3001)</p>
            <p className="text-slate-500">  ├── Cloudflare proxy naranja + SSL Full (strict)</p>
            <p className="text-slate-500">  └── Logs: /var/www/viajeinteligencia/logs/</p>
          </div>
        </section>

        {/* Workflow details */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4">Workflows de GitHub Actions</h2>
          <div className="space-y-3">
            {[
              { name: 'deploy-hetzner.yml', trigger: 'Push a main', action: 'Despliega a producción', icon: '🚀' },
              { name: 'cron.yml', trigger: '06:00 UTC diario', action: 'Ejecuta master cron (12 pipelines)', icon: '⏰' },
              { name: 'ci.yml', trigger: 'Push o PR a main', action: 'Lint + build + tests unitarios + smoke', icon: '✅' },
              { name: 'backup.yml', trigger: 'Domingo 08:00 UTC', action: 'Backup del repo + release en GitHub', icon: '💾' },
            ].map((wf) => (
              <div key={wf.name} className="bg-slate-700/40 rounded-xl p-4 flex items-start gap-3">
                <span className="text-lg">{wf.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm">{wf.name}</p>
                  <p className="text-slate-400 text-xs">{wf.trigger} → {wf.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verificación post-deploy */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4">Verificación post-deploy</h2>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-700/40 rounded-xl p-4">
              <p className="text-white font-medium mb-1">1. GitHub Actions</p>
              <p className="text-slate-400">Ve a <a href="https://github.com/mcasrom/viaje-con-inteligencia/actions" target="_blank" className="text-blue-400 hover:underline">GitHub → Actions → Deploy to Hetzner</a> y confirma que el workflow se completó en verde.</p>
            </div>
            <div className="bg-slate-700/40 rounded-xl p-4">
              <p className="text-white font-medium mb-1">2. Health check</p>
              <p className="text-slate-400">El workflow ya hace un curl al puerto 3001 automáticamente. Para verificar manualmente: visita <code className="bg-slate-800 px-1 rounded text-emerald-300">https://www.viajeinteligencia.com/api/health</code></p>
            </div>
            <div className="bg-slate-700/40 rounded-xl p-4">
              <p className="text-white font-medium mb-1">3. Monitor de Cron</p>
              <p className="text-slate-400">Revisa <a href="/admin/health-cron" className="text-blue-400 hover:underline">/admin/health-cron</a> al día siguiente para verificar que el master cron se ejecutó correctamente.</p>
            </div>
          </div>
        </section>

        {/* Notas */}
        <section className="bg-amber-900/20 border border-amber-800/30 rounded-2xl p-5">
          <h2 className="text-amber-300 font-bold mb-2">Notas importantes</h2>
          <ul className="space-y-2 text-sm text-amber-200/80">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              No hagas cambios directamente en el servidor. Todo debe ir por git.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Los secrets (API keys, tokens) están en GitHub Secrets y en `.env.local` del servidor. No se sincronizan por rsync (`.env*` está excluido).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Si el build falla en GitHub Actions, el servidor sigue corriendo la versión anterior — sin downtime.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Para forzar un deploy sin cambios: ve a GitHub → Actions → Deploy to Hetzner → "Run workflow".
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">•</span>
              Los logs de producción están en <code className="bg-amber-900/40 px-1 rounded">/var/www/viajeinteligencia/logs/</code> en el servidor.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
